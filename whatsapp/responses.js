const responses = {
  welcome: {
    type: "interactive",
    header: "🌍 *Welcome to ViaCerta Abroad!* 🌍",
    text: "Hello! Welcome to our service. How can I help you today?",
    body: "Your gateway to global education. How can we assist you today?",
    buttons: [
      { id: "services", title: "Our Services" },
      { id: "destinations", title: "Study Destinations" },
      { id: "tests", title: "Test Preparation" },
    ],
    footer: "Reply with keywords like HELP, CONTACT",
  },

  services: {
    type: "list",
    
    header: "📚 *Our End-to-End Services*",
    text: "Here are our services:\n1. Service A\n2. Service B\n3. Service C",
    body: "Choose an option for details:",
    sections: [
      {
        title: "1. University Selection",
        description: "Find your perfect match",
      },
      {
        title: "2. Visa Assistance",
        description: "Documentation & interview prep",
      },
    ],
    button: { id: "back", title: "← Main Menu" },
  },

  destinations: {
    type: "carousel",
    items: [
      {
        title: "🇩🇪 Germany",
        description: "Free tuition | 18mo work visa",
        buttons: [
          { id: "de_unis", title: "Universities" },
          { id: "de_visa", title: "Visa Info" },
        ],
      },
      {
        title: "🇨🇦 Canada",
        description: "3yr work permit | PR options",
        buttons: [
          { id: "ca_unis", title: "Universities" },
          { id: "ca_visa", title: "Visa Info" },
        ],
      },
    ],
  },

  test_prep: {
    type: "quick_reply",
    text: "📝 *Test Preparation Programs*",
    options: [
      { id: "ielts", title: "IELTS" },
      { id: "gre", title: "GRE" },
      { id: "toefl", title: "TOEFL" },
    ],
  },

  dynamic_responses: {
    country_info: {
      template:
        "🇺🇳 *{country}*\n\n🎓 Top Universities:\n{universities}\n\n📌 Key Benefits:\n{benefits}\n\n💼 Work Rights: {work}",
      variables: {
        germany: {
          universities: ["TUM", "Heidelberg", "LMU"],
          benefits: ["Free tuition", "Strong economy", "English programs"],
          work: "18 months post-study",
        },
      },
    },
  },

  contact: {
    text: "You can reach us at:\nPhone: +1234567890\nEmail: contact@example.com"
  },

  fallback: {
    text: "Sorry, I didn't understand that. Try these options:",
    buttons: [
      { id: "help", title: "Help" },
      { id: "contact", title: "Contact Agent" },
    ],
  },
};

export default responses;
