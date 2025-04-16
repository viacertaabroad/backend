// // whatsapp/utils/responseEngine.js
// import messageTemplates from "./messageTemplates.js";
// import { Conversation } from "../models/conversation.model.js";

// export const handleAutoResponse = async (message) => {
//   const conversation = await Conversation.findById(
//     message.conversation
//   ).populate("messages");

//   const isWithin24h = Date.now() - conversation.lastInteraction < 86400000;

//   const lastUserMessage = conversation.messages
//     .slice() // copy array
//     .reverse()
//     .find((m) => m.direction === "inbound");

//   let response;

//   // Handle interactive button responses
//   if (lastUserMessage?.buttons?.length) {
//     const buttonId = message.text?.toLowerCase();
//     response = messageTemplates[buttonId] || messageTemplates.error_fallback;
//   }

//   // Handle keyword-based responses if no button response was found
//   if (!response) {
//     const keywords = {
//       hello: "welcome",
//       help: "services_overview",
//       // ... add more keyword mappings as needed
//     };

//     const matchedKey = Object.keys(keywords).find((key) =>
//       message.text?.toLowerCase().includes(key)
//     );

//     response = matchedKey ? messageTemplates[keywords[matchedKey]] : null;
//   }

//   // Fallback to a Meta-approved template when the conversation is outside 24h window
//   if (!response && !isWithin24h) {
//     response = {
//       type: "template",
//       templateName: "default_fallback",
//     };
//   }

//   return response;
// };

import messageTemplates from "./messageTemplates.js";

export const handleAutoResponse = async (message) => {
  let response;

  // 1. Button-based matching (recommended scalable method)
  if (message.buttonId) {
    response = messageTemplates[message.buttonId] || messageTemplates.error_fallback;
  }

  // 2. Fallback to keyword-based triggers
  if (!response && message.text) {
    const keywords = {
      hi: "welcome",
      hello: "welcome",
      hey: "welcome",
      help: "need_help",
      services: "explore_services",
      countries: "countries_list",
      admission: "admission_support", 
      // counselor: "counseling",
      visa: "career_support",
      admission: "admissions",
      housing: "post_admission" 
      // add location 
    };


    const matchedKey = Object.keys(keywords).find((key) =>
      message.text.toLowerCase().includes(key)
    );

    if (matchedKey) {
      const templateId = keywords[matchedKey];
      response = messageTemplates[templateId];
    }
  }

  // 3. Fallback when nothing matches
  if (!response) {
    response = {
      type: "template",
      templateName: "default_fallback"
    };
  }

  return response;
};

