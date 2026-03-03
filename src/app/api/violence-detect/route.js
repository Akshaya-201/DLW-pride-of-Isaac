const DEFAULT_RESPONSE = {
  violenceDetected: false,
  confidence: 0,
  provider: "mock",
};

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const frameDataUrl = payload?.frameDataUrl;
  if (!frameDataUrl || typeof frameDataUrl !== "string") {
    return Response.json({ error: "Missing frameDataUrl." }, { status: 400 });
  }

  const detectorUrl = process.env.VIOLENCE_DETECTOR_URL;
  if (!detectorUrl) {
    return Response.json(DEFAULT_RESPONSE, { status: 200 });
  }

  try {
    const response = await fetch(detectorUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frameDataUrl }),
    });

    if (!response.ok) {
      const text = await response.text();
      return Response.json(
        { error: "Detector service returned an error.", details: text },
        { status: 502 }
      );
    }

    const result = await response.json();
    return Response.json(
      {
        violenceDetected: Boolean(result.violenceDetected),
        confidence: Number(result.confidence || 0),
        provider: result.provider || "external",
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { error: "Failed to call detector service.", details: error.message },
      { status: 502 }
    );
  }
}
