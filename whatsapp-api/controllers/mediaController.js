// Change this in your controller file
import {
  sendImage,
  sendVideo,
  sendAudio,
  sendDocument,
  sendTextWithMedia,
} from "../services/whatsappService.js";

export const sendMedia = async (req, res) => {
  const { phone, type, url, caption, filename } = req.body;

  try {
    let result;
    switch (type) {
      case "image":
        result = await sendImage(phone, url, caption);
        break;
      case "video":
        result = await sendVideo(phone, url, caption);
        break;
      case "audio":
        result = await sendAudio(phone, url);
        break;
      case "document":
        result = await sendDocument(phone, url, caption, filename);
        break;
      default:
        return res.status(400).json({ error: "Invalid media type" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendTextWithMediafn = async (req, res) => {
  const { phone, text, type, url, caption } = req.body;

  try {
    const result = await sendTextWithMedia(phone, text, type, url, caption);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
