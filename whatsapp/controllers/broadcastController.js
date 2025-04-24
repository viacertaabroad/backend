// whatsapp/controllers/broadcastController.js
import { sendWhatsAppMessage } from "../utils/whatsappSender.js";
import { Conversation } from "../models/conversation.model.js";
import pLimit from 'p-limit';

export const sendBroadcast = async (req, res, next) => {
  try {
    const { templateName, message, phoneNumbers } = req.body;

    if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No recipients provided." });
    }
    // delete duplicates
    const uniqueNumbers = [...new Set(phoneNumbers)];

    // fetch only active & unblocked conversations in one go
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; //24 hr active window

    const convos = await Conversation.find({
      phoneNumber: { $in: uniqueNumbers },
      blocked: false,
      lastInteraction: { $gte: new Date(cutoff) },
    }).lean();

    const limit = pLimit(10); // max 10 concurrent sends

    const results = await Promise.allSettled(
      uniqueNumbers.map((number) =>
        limit(async () => {
          const convo = convos.find((c) => c.phoneNumber === number);
          const isActive = convo && convo.lastInteraction.getTime() >= cutoff;
          const payload = {
            phoneNumber: number,
            type: isActive ? message.type : "template",
            ...(isActive ? message : { templateName }),
            conversationId: convo?._id,
          };
          return sendWhatsAppMessage(payload);
        })
      )
    );

    res.json({ success: true, results });
  } catch (err) {
    console.error("Broadcast error:", err);
    next(err);
    // res.status(500).json({ success: false, error: err.message });
  }
};
