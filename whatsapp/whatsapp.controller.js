import { sendWhatsAppMessage } from "./whatsapp.service.js";

 
export const sendMessage = async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'Both phone and message are required',
      });
    }

    const result = await sendWhatsAppMessage(phone, message);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: {
        messageId: result.messageId,
        recipient: result.recipient,
      },
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};