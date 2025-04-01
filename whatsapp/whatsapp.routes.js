import express from 'express';
import { sendMessage } from './whatsapp.controller.js';
import { handleIncomingMessages, verifyWebhook } from './whatsapp.webhook.js';
 
const router = express.Router();

router.post('/send', sendMessage);

// Webhook handling
router.get('/webhook', verifyWebhook);
router.post('/webhook', handleIncomingMessages);


export default router;