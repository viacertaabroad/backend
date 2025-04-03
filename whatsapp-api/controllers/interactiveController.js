import { messageTemplates } from "../services/messageTemplate.js";
import { sendMessage } from "../services/whatsappService.js";

export const sendButtons = async (req, res) => {
  const { phone, header, body, buttons } = req.body;

  try {
    const payload = messageTemplates.buttonMessage(
      phone,
      header,
      body,
      buttons
    );
    const result = await sendMessage(payload);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendList = async (req, res) => {
  const { phone, header, body, buttonText, sections } = req.body;

  try {
    const payload = messageTemplates.listMessage(
      phone,
      header,
      body,
      buttonText,
      sections
    );
    const result = await sendMessage(payload);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
