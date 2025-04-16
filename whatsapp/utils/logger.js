// whatsapp/utils/logger.js
export const logError = (error, context) => {
  const errorLog = {
    timestamp: new Date(),
    error: error.message,
    stack: error.stack,
    context,
    type: "WHATSAPP_ERROR",
  };
  console.error(errorLog);
  // Here you can save errorLog to a database or external logging service.
};

export const logMessageEvent = (eventData) => {
  const eventLog = {
    ...eventData,
    type: "MESSAGE_EVENT",
    timestamp: new Date(),
  };
  console.log(eventLog);
  // Here you can save eventLog to a database or external logging service.
};
