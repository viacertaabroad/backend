import axios from 'axios';

const API_VERSION = 'v22.0';
const PHONE_NUMBER_ID = "599723043218457";
const ACCESS_TOKEN =  process.env.ACCESS_TOKEN

const BASE_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}`;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const sendWhatsAppMessage = async (phone, message) => {
  try {
    const response = await axiosInstance.post('/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phone,
      type: 'text',
      text: { body: message },
    });

    return {
      success: true,
      messageId: response.data?.messages?.[0]?.id,
      recipient: response.data?.contacts?.[0]?.wa_id,
    };
  } catch (error) {
    console.error('WhatsApp API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || 'Failed to send message',
    };
  }
};