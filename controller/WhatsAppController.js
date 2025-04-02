import twilio from "twilio";

// Initialize Twilio client for production or mock for testing
let client;
if (process.env.RUNNING_ON === "test") {
  client = {
    messages: {
      create: async (message) => {
        console.log("Mock Twilio Message:", message);
        return { sid: "mock_message_sid" };
      },
    },
  };
} else {
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// Response Templates
const RESPONSES = {
  WELCOME: {
    text: `🌍 Welcome to Viacerta Abroad! 🌍\n\nHello! We are Viacerta Abroad...`,
    buttons: [
      { title: '📚 MORE', id: 'MORE' },
      { title: '📞 CONTACT', id: 'CONTACT' },
      { title: '❓ FAQ', id: 'FAQ' }
    ]
  },
  HELP: {
    text: `🆘 Here's how I can assist you...`,
    buttons: [
      { title: '📚 MORE', id: 'MORE' },
      { title: '📞 CONTACT', id: 'CONTACT' }
    ]
  },
  MORE: {
    text: `📚 Here's more about our services...`
  },
  CONTACT: {
    text: `📞 You can reach us at...`
  },
  FAQ: {
    text: `❓ Frequently Asked Questions...`
  },
  DEFAULT: {
    text: `😅 Sorry, I didn't understand that...`
  }
};

 

// Handle incoming WhatsApp messages
const whatsAppChat = async (req, res) => {
  try {
    console.log("📩 Incoming Request Received");

    const body = req.body;
    const incomingMessage = body.Body ? body.Body.toLowerCase() : null;
    const senderNumber = body.From;

    if (!incomingMessage || !senderNumber) {
      console.error("❌ Missing Body or From in the request!");
      return res.status(400).json({ error: "Missing required fields." });
    }

    let responseMessage = RESPONSES.DEFAULT;

    if (userContext[senderNumber] === "AWAITING_CALLBACK_RESPONSE") {
      if (incomingMessage.includes("yes")) {
        responseMessage = `Great! Our team will call you shortly. 🕒
        In the meantime, feel free to explore more by typing "MORE".`;
        delete userContext[senderNumber];
      } else if (incomingMessage.includes("no")) {
        responseMessage = `No problem! Let us know if you change your mind. 😊
        Type "MORE" to explore our services.`;
        delete userContext[senderNumber];
      } else {
        responseMessage = `Please reply with "YES" or "NO" to confirm your callback request.`;
      }
    } else {
      if (incomingMessage.includes("help")) {
        responseMessage = RESPONSES.HELP;
      } else if (incomingMessage.includes("more")) {
        responseMessage = RESPONSES.MORE;
      } else if (incomingMessage.includes("contact")) {
        responseMessage = RESPONSES.CONTACT;
        userContext[senderNumber] = "AWAITING_CALLBACK_RESPONSE";
      } else if (incomingMessage.includes("faq")) {
        responseMessage = RESPONSES.FAQ;
      } else if (
        incomingMessage.includes("hello") ||
        incomingMessage.includes("hi")
      ) {
        responseMessage = RESPONSES.WELCOME;
      }
    }

    console.log("🚀 Sending Response:", responseMessage);

    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: senderNumber,
      body: responseMessage,
    });

    console.log("✅ Message Sent Successfully:", message.sid);
    res.status(200).json({ success: true, messageSid: message.sid });
  } catch (err) {
    console.error("❌ Twilio Error:", err);
    res.status(500).json({ message: "Failed to send message.", error: err });
  }
};

// Endpoint to check if the bot is running
const checkWhatsapp = async (req, res) => {
  console.log("Environment", process.env.NODE_ENV);
  res.status(200).json({
    message: "Viacerta Abroad WhatsApp Bot is running! 🚀",
    env: process.env.RUNNING_ON,
  });
};

export { whatsAppChat, checkWhatsapp };
