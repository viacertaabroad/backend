// chat_service.js
import responses from "./responses.js";

// Session store for conversation context
const userSessions = {};

export function generateResponse(userId, userInput) {
  // Initialize or get user session
  userSessions[userId] = userSessions[userId] || {
    context: null,
    lastMessage: null,
  };

  const normalizedInput = userInput.toLowerCase().trim();

  // 1. Handle button clicks
  if (isButtonResponse(normalizedInput)) {
    return handleButtonResponse(userId, normalizedInput);
  }

  // 2. Handle text commands
  return handleTextCommand(userId, normalizedInput);
}

// Helper Functions
function isButtonResponse(input) {
  return Object.values(responses).some((response) =>
    response.buttons?.some((btn) => btn.id === input)
  );
}

function handleButtonResponse(userId, buttonId) {
  const session = userSessions[userId];

  // Special cases for country buttons
  if (buttonId.endsWith("_unis")) {
    const country = buttonId.split("_")[0];
    return generateCountryResponse(country);
  }

  // Default button handling
  return formatMessage(responses[buttonId] || responses.fallback);
}

function handleTextCommand(userId, input) {
  const commandMap = {
    hi: "welcome",
    hello: "welcome",
    services: "services",
    germany: "germany_info",
    // Add more commands as needed
  };

  const responseKey = commandMap[input] || "fallback";
  return formatMessage(responses[responseKey]);
}

function generateCountryResponse(country) {
  if (!responses.dynamic_responses.country_info.variables[country]) {
    return formatMessage(responses.fallback);
  }

  const { template, variables } = responses.dynamic_responses.country_info;
  const data = variables[country];

  return {
    type: "text",
    text: template
      .replace("{country}", country.toUpperCase())
      .replace("{universities}", data.universities.join("\n- "))
      .replace("{benefits}", data.benefits.join("\n- "))
      .replace("{work}", data.work),
  };
}

function formatMessage(message) {
  return {
    type: message.type || "text",
    ...message,
  };
}
