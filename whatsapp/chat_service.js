// chat_service.js
import responses from "./responses.js";


// Session store for conversation context
const userSessions = {};

export function generateResponse(userId, userInput) {
  // Initialize or get user session with timestamp
  userSessions[userId] = userSessions[userId] || {
    context: "init",
    lastMessage: null,
    lastActive: new Date(),
    history: [],
  };

  const normalizedInput = userInput.toLowerCase().trim();
  //   userSessions[userId].lastActive = new Date(); // Update activity timestamp
  // Update session
  userSessions[userId] = {
    ...userSessions[userId],
    lastActive: new Date(),
    history: [...userSessions[userId].history.slice(-9), normalizedInput], // Keep last 10 messages
  };

  try {
    if (userSessions[userId].context === "awaiting_service") {
      return handleServiceSelection(normalizedInput);
    }

    // 1. Handle button clicks
    if (isButtonResponse(normalizedInput)) {
      return handleButtonResponse(userId, normalizedInput);
    }

    // 2. Handle text commands
    return handleTextCommand(userId, normalizedInput);
  } catch (error) {
    console.error(`Error generating response for ${userId}:`, error);
    return formatMessage(responses.fallback);
  }
}

// Helper Functions
function isButtonResponse(input) {
  return Object.values(responses).some(
    (response) =>
      response.buttons?.some((btn) => btn.id === input) ||
      response.options?.some((opt) => opt.id === input)
  );
}

// function handleButtonResponse(userId, buttonId) {
//   const session = userSessions[userId];

//   // Handle special button patterns
//   if (buttonId.endsWith("_unis") || buttonId.endsWith("_visa")) {
//     const country = buttonId.split("_")[0];
//     if (responses.dynamic_responses.country_info.variables[country]) {
//       return generateCountryResponse(
//         country,
//         buttonId.endsWith("_visa") ? "visa" : "unis"
//       );
//     }
//   }

//   // Handle back button
//   if (buttonId === "back") {
//     return formatMessage(responses.welcome);
//   }

//   // Default button handling
//   const response = Object.values(responses).find(
//     (r) =>
//       r.buttons?.some((b) => b.id === buttonId) ||
//       r.options?.some((o) => o.id === buttonId)
//   );

//   return formatMessage(response || responses.fallback);
// }
function handleButtonResponse(userId, buttonId) {
  const session = userSessions[userId];

  // Add button validation
  const isValidButton = (btn) => {
    return btn.id && btn.title && btn.title.length <= 20;
  };

  // Handle special patterns
  if (buttonId.endsWith("_unis") || buttonId.endsWith("_visa")) {
    const country = buttonId.split("_")[0];
    if (responses.dynamic_responses.country_info.variables[country]) {
      return {
        ...generateCountryResponse(
          country,
          buttonId.endsWith("_visa") ? "visa" : "unis"
        ),
        context: "country_info", // Add context for session
      };
    }
  }

  // Find response with valid buttons
  const response = Object.values(responses).find(
    (r) =>
      (r.buttons &&
        r.buttons.some((b) => b.id === buttonId && isValidButton(b))) ||
      (r.options &&
        r.options.some((o) => o.id === buttonId && isValidButton(o)))
  );

  return {
    ...formatMessage(response || responses.fallback),
    context: buttonId, // Preserve button context
  };
}
function handleTextCommand(userId, input) {
  const commandMap = {
    hi: "welcome",
    hello: "WELCOME",
    services: "services",
    destinations: "destinations",
    tests: "test_prep",
    contact: "contact",
    germany: "germany_info",
    canada: "canada_info",
  };

  const responseKey = commandMap[input] || "fallback";
  return formatMessage(responses[responseKey] || responses.fallback);
}

function generateCountryResponse(country, infoType = "unis") {
  const countryData =
    responses.dynamic_responses.country_info.variables[country];
  if (!countryData) return formatMessage(responses.fallback);

  const template = responses.dynamic_responses.country_info.template;

  return {
    type: "text",
    text: template
      .replace("{country}", country.toUpperCase())
      .replace(
        "{universities}",
        infoType === "unis"
          ? countryData.universities.join("\n- ")
          : countryData.visa_info || "Visa information not available"
      )
      .replace("{benefits}", countryData.benefits.join("\n- "))
      .replace("{work}", countryData.work),
  };
}

function formatMessage(message) {
  if (!message) return responses.fallback;

  return {
    // type: message.type || "text",
    // text: message.text || message.body || "",
    // ...message,

    type: message.type || "text",
    interactiveType: message.interactiveType || undefined,
    text: message.text || message.body || "",
    buttons: message.buttons || undefined,
    options: message.options || undefined,
    sections: message.sections || undefined,
    ...message, // Spread remaining properties
  };
}
