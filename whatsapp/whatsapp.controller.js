// whatsapp.controller.js
import {
  sendTextMessage,
  sendTemplateMessage,
  broadcastMessage,
} from "./whatsapp.service.js";

export const sendMessage = async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ error: "Phone and message are required" });
    }

    const result = await sendTextMessage(phone, message);
    handleResponse(res, result);
  } catch (error) {
    handleError(res, error);
  }
};

export const sendTemplate = async (req, res) => {
  try {
    const { phone, templateName } = req.body;
    if (!phone || !templateName) {
      return res
        .status(400)
        .json({ error: "Phone and template name are required" });
    }

    const result = await sendTemplateMessage(phone, templateName);
    handleResponse(res, result);
  } catch (error) {
    handleError(res, error);
  }
};

export const broadcast = async (req, res) => {
  try {
    const { recipients, message } = req.body;
    if (!recipients?.length || !message) {
      return res
        .status(400)
        .json({ error: "Recipients and message are required" });
    }

    const results = await broadcastMessage(recipients, message);
    res.json({ success: true, results });
  } catch (error) {
    handleError(res, error);
  }
};

const handleResponse = (res, result) => {
  if (result.success) {
    res.json({ success: true, data: result });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
};

const handleError = (res, error) => {
  console.error("Controller error:", error);
  res.status(500).json({ error: "Internal server error" });
};
