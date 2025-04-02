// whatsapp.controller.js
import {
  sendTextMessage,
  sendTemplateMessage,
  broadcastMessage,
  sendButtonMessage,
  sendListMessage,
} from "./whatsapp.service.js";

export const sendMessage = async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ error: "Phone and message are required" });
    }

    const result = await sendTextMessage(phone, message);

    console.log("text from sendTexMessageFn", phone, message);

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
    console.log("text from sendTemplateMessageFn", phone, result);

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

    console.log(`Broadcast sent to ${recipients.length} numbers`, {
      successCount: results.filter((r) => r.success).length,
      failureCount: results.filter((r) => !r.success).length,
    });

    res.json({
      success: true,
      results,
      stats: {
        total: recipients.length,
        success: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// New endpoint for interactive messages
export const sendInteractiveMessage = async (req, res) => {
  try {
    const { phone, type, content } = req.body;

    if (!phone || !type || !content) {
      return res.status(400).json({
        success: false,
        error: "Phone, type and content are required",
        code: "MISSING_PARAMETERS",
      });
    }

    let result;
    switch (type) {
      case "button":
        result = await sendButtonMessage(phone, content.text, content.buttons);
        break;
      case "list":
        result = await sendListMessage(phone, content);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: "Unsupported interactive message type",
          code: "UNSUPPORTED_TYPE",
        });
    }

    console.log(type, phone, result);
    handleResponse(res, result);
  } catch (error) {
    handleError(res, error, "sendInteractive");
  }
};

const handleResponse = (res, result) => {
  if (result.success) {
    res.json({
      success: true,
      data: {
        messageId: result.messageId,
        recipient: result.recipient,
        timestamp: new Date().toISOString(),
      },
    });
  } else {
    res.status(400).json({
      success: false,
      error: result.error.message || "Message sending failed",
      code: result.error.code || "SEND_FAILED",
      details: result.error.details,
    });
  }
};

const handleError = (res, error, context = "") => {
  const errorId = `ERR-${Date.now()}`;
  console.error(`whatsapp controller error[${errorId}] ${context} Error:`, {
    message: error.message,
    stack: error.stack,
    ...(error.response?.data && { apiError: error.response.data }),
  });

  res.status(500).json({
    success: false,
    error: "Internal server error",
    code: "SERVER_ERROR",
    reference: errorId,
  });
};
// Message logging utility
// const logMessage = (type, phone, result) => {
//   console.log(`[${new Date().toISOString()}] ${type.toUpperCase()}`, {
//     to: phone,
//     status: result.success ? 'success' : 'failed',
//     messageId: result.messageId,
//     ...(!result.success && { error: result.error })
//   });
// };