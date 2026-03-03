import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

export async function POST(request) {
  if (!accountSid || !authToken || !fromNumber) {
    return Response.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const client = new twilio(accountSid, authToken);

  let to;
  let body;
  try {
    ({ to, body } = await request.json());
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!to || !body) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const message = await client.messages.create({
      to,
      from: fromNumber,
      body,
    });

    return Response.json({ sid: message.sid }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: "Failed to send message", details: error.message },
      { status: 500 }
    );
  }
}
