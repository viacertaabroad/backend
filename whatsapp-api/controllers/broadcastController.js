import { sendBroadcast } from "../services/whatsappService.js";

export const createBroadcast = async (req, res) => {
  const { recipients, message } = req.body;

  if (!recipients || !message) {
    return res.status(400).json({
      success: false,
      error: "Recipients and message are required"
    });
  }

  try {
    const result = await sendBroadcast(recipients, message);
    res.json({
      success: true,
      sentCount: result.sentCount,
      firstMessageId: result.messageIds[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};