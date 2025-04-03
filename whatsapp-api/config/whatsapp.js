export const whatsappConfig = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  apiVersion: 'v22.0',
  baseUrl: 'https://graph.facebook.com',
  webhookVerifyToken: process.env.WEBHOOK_VERIFY_TOKEN,
  broadcastLimit: 100
};