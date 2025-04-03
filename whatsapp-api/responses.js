const responses = {
  welcome: {
    type: "interactive",
    interactiveType: "button", // Explicit type
    header: "🌍 *Welcome to ViaCerta Abroad!* 🌍",
    body: "Your gateway to global education. How can we assist you today?",
    footer: "Reply with keywords like HELP, CONTACT",
    buttons: [
      { id: "services", title: "Our Services" },
      { id: "destinations", title: "Study Destinations" },
      { id: "tests", title: "Test Preparation" },
    ],
  },

  services: {
    type: "interactive",
    interactiveType: "list",
    header: "📚 *Our End-to-End Services*",
    body: "Choose an option for details:",
    buttonText: "View Services", // Required for list messages
    sections: [
      {
        title: "University Selection",
        rows: [
          {
            id: "uni_selection",
            title: "🏫 University Selection",
            description: "Find your perfect match",
          },
        ],
      },
      {
        title: "Visa Assistance",
        rows: [
          {
            id: "visa_help",
            title: "✈️ Visa Assistance",
            description: "Documentation & interview prep",
          },
        ],
      },
    ],
  },

  destinations: {
    type: "interactive",
    interactiveType: "product", // For carousel
    header: "🌎 Study Destinations",
    body: "Choose a country to explore options:",
    catalogId: "YOUR_CATALOG_ID", // Must match your Facebook catalog
    productSections: [
      {
        title: "🇩🇪 Germany",
        products: [
          {
            id: "de_unis",
            title: "German Universities",
            description: "Free tuition | 18mo work visa",
          },
        ],
      },
      {
        title: "🇨🇦 Canada",
        products: [
          {
            id: "ca_unis",
            title: "Canadian Universities",
            description: "3yr work permit | PR options",
          },
        ],
      },
    ],
  },

  test_prep: {
    type: "interactive",
    interactiveType: "quick_reply",
    body: "📝 *Test Preparation Programs*",
    options: [
      { id: "ielts", title: "IELTS" },
      { id: "gre", title: "GRE" },
      { id: "toefl", title: "TOEFL" },
    ],
  },

  contact: {
    type: "text",
    text: "You can reach us at:\n📞 Phone: +1234567890\n✉️ Email: contact@example.com",
  },

  fallback: {
    type: "interactive",
    interactiveType: "button",
    body: "Sorry, I didn't understand that. Try these options:",
    buttons: [
      { id: "help", title: "Help" },
      { id: "contact", title: "Contact Agent" },
    ],
  },
};

export default responses;
