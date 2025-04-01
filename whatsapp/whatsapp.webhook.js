export const verifyWebhook = (req, res) => {
  const verifyToken = process.env.WA_WEBHOOK_TOKEN;

  // Parse params from the webhook verification request
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verifyToken) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
};

export const handleIncomingMessages = (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message) {
      console.log("Received WhatsApp message:", {
        from: message.from,
        messageId: message.id,
        type: message.type,
        text: message.text?.body,
        timestamp: message.timestamp,
      });

      // Process message here (save to DB, reply, etc.)
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.sendStatus(500);
  }
};
