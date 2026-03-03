import twilio from "twilio";

function normalizeE164(value) {
  const cleaned = String(value || "").replace(/\s+/g, "");
  if (!cleaned) return "";
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}

export async function POST(request) {
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form-data payload." }, { status: 400 });
  }

  const video = formData.get("video");
  const audio = formData.get("audio");
  const detectedConfidence = formData.get("detectedConfidence");
  const source = formData.get("source");
  const timestamp = formData.get("timestamp");

  if (!video || !audio) {
    return Response.json({ error: "Video and audio evidence are required." }, { status: 400 });
  }

  const evidenceRelayUrl = process.env.EVIDENCE_RELAY_URL;
  if (evidenceRelayUrl) {
    try {
      const relayPayload = new FormData();
      relayPayload.append("video", video);
      relayPayload.append("audio", audio);
      relayPayload.append("detectedConfidence", String(detectedConfidence || ""));
      relayPayload.append("source", String(source || ""));
      relayPayload.append("timestamp", String(timestamp || ""));

      const relayResponse = await fetch(evidenceRelayUrl, {
        method: "POST",
        body: relayPayload,
      });

      if (!relayResponse.ok) {
        const relayText = await relayResponse.text();
        return Response.json(
          { error: "Evidence relay failed.", details: relayText },
          { status: 502 }
        );
      }
    } catch (relayError) {
      return Response.json(
        { error: "Unable to relay evidence.", details: relayError.message },
        { status: 502 }
      );
    }
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = normalizeE164(process.env.TWILIO_PHONE_NUMBER);
  const contactList = (process.env.EMERGENCY_CONTACT_NUMBERS || "")
    .split(",")
    .map((item) => normalizeE164(item.trim()))
    .filter(Boolean);

  if (accountSid && authToken && fromNumber && contactList.length > 0) {
    try {
      const client = twilio(accountSid, authToken);
      const uniqueRecipients = [...new Set(contactList)].filter(
        (to) => to !== fromNumber
      );
      if (uniqueRecipients.length === 0) {
        return Response.json(
          {
            error: "No valid emergency recipients.",
            details:
              "All configured emergency contacts are the same as TWILIO_PHONE_NUMBER.",
          },
          { status: 400 }
        );
      }

      const messageBody =
        `The user has triggered an SOS alert. Violence detected with confidence ` +
        `${Math.round(Number(detectedConfidence || 0) * 100)}%. ` +
        `Source: ${source || "unknown"}. ` +
        `Time: ${timestamp || new Date().toISOString()}. ` +
        "Please check immediately.";

      const sendResults = await Promise.allSettled(
        uniqueRecipients.map((to) =>
          client.messages.create({
            to,
            from: fromNumber,
            body: messageBody,
          })
        )
      );

      const failed = sendResults
        .map((result, index) => ({ result, to: uniqueRecipients[index] }))
        .filter((item) => item.result.status === "rejected")
        .map((item) => ({
          to: item.to,
          reason: item.result.reason?.message || "Unknown Twilio error",
        }));

      if (failed.length > 0) {
        return Response.json(
          {
            error: "Failed to notify one or more emergency contacts.",
            details: failed,
            notifiedContacts: uniqueRecipients.length - failed.length,
          },
          { status: 502 }
        );
      }

      return Response.json(
        {
          success: true,
          relayed: Boolean(evidenceRelayUrl),
          notifiedContacts: uniqueRecipients.length,
        },
        { status: 200 }
      );
    } catch (twilioError) {
      return Response.json(
        { error: "Failed to notify emergency contacts.", details: twilioError.message },
        { status: 502 }
      );
    }
  }

  return Response.json(
    {
      success: true,
      relayed: Boolean(evidenceRelayUrl),
      notifiedContacts: contactList.length,
    },
    { status: 200 }
  );
}
