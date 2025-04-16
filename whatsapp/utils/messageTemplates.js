const messageTemplates = {
  // 🌟 1. Welcome Message (Entry Point)
  welcome: {
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: `👋 Welcome to *ViaCerta Abroad* – Your Trusted Partner for Global Education & Career Success.\n\nEmpowering Dreams, Enabling Futures.\n\nHow can we assist you today?`,
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: "get_started",
              title: "🚀 Get Started",
            },
          },
          {
            type: "reply",
            reply: {
              id: "explore_services",
              title: "📚 Explore Services",
            },
          },
          {
            type: "reply",
            reply: {
              id: "need_help",
              title: "❓ Need Help",
            },
          },
        ],
      },
    },
  },

  // 🌐 2. List of Services (List Message)
  explore_services: {
    type: "interactive",
    interactive: {
      type: "list",
      header: {
        type: "text",
        text: "📌 Our Comprehensive Services",
      },
      body: {
        text: "Choose a category to explore more:",
      },
      footer: {
        text: "Tap to expand each section for more info.",
      },
      action: {
        button: "View Services",
        sections: [
          {
            title: "🎯 Core Services",
            rows: [
              {
                id: "academic_guidance",
                title: "Academic & Career Guidance",
                description: "Course selection, career mapping, skills",
              },
              {
                id: "admission_support",
                title: "Admissions & Documents",
                description: "SOP, LOR, visa guidance, applications",
              },
              {
                id: "post_admission",
                title: "Post-Admission Help",
                description: "Jobs, housing, relocation, pre-departure",
              },
              {
                id: "career_support",
                title: "Work Visa & Job Assistance",
                description: "Interviews, job search, visa conversion",
              },
            ],
          },
        ],
      },
    },
  },

  // 💬 3. Get Started Flow
  get_started: {
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: `🎯 Let's begin your journey!\n\nWhat are you planning to do?`,
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: "free_counseling",
              title: "🧑‍🎓 Book Counseling",
            },
          },
          {
            type: "reply",
            reply: {
              id: "countries_list",
              title: "🌍 Destination Countries",
            },
          },
        ],
      },
    },
  },

  // 🧭 Destination Countries
  countries_list: {
    type: "interactive",
    interactive: {
      type: "list",
      header: {
        type: "text",
        text: "🌎 Top Study Destinations",
      },
      body: {
        text: "Select a country to learn more:",
      },
      footer: {
        text: "We support 10+ destinations worldwide.",
      },
      action: {
        button: "Choose Country",
        sections: [
          {
            title: "🌐 Countries",
            rows: [
              { id: "country_usa", title: "USA" },
              { id: "country_canada", title: "Canada" },
              { id: "country_uk", title: "United Kingdom" },
              { id: "country_australia", title: "Australia" },
              { id: "country_germany", title: "Germany" },
              { id: "country_france", title: "France" },
              { id: "country_singapore", title: "Singapore" },
            ],
          },
        ],
      },
    },
  },

  // 🎓 Academic Guidance
  academic_guidance: {
    type: "text",
    text: `🎓 *Academic & Career Guidance*\n\nWe’ll help you align your academic path with a global career using:\n- Course and country selection\n- Career assessment\n- Skill mapping\n\n💬 Want to speak with a counselor? Reply *Free Counseling*.`,
  },

  // 📄 Admission Support
  admission_support: {
    type: "text",
    text: `📄 *Admissions & Documentation Help*\n\nOur team will guide you with:\n- SOP & LOR creation\n- Visa documentation\n- University application reviews\n\n✍️ Want us to review your profile? Reply *Profile Review*.`,
  },

  // 🏠 Post-Admission
  post_admission: {
    type: "text",
    text: `🏠 *Post-Admission Assistance*\n\nWe help you with:\n- Accommodation\n- Part-time & full-time jobs\n- Travel & banking setup\n\nReply *Job Support* or *Housing Help* to continue.`,
  },

  // 💼 Career Support
  career_support: {
    type: "text",
    text: `💼 *Career & Work Visa Support*\n\nWe assist with:\n- Work visa conversion\n- Job interview training\n- Resume building\n\nType *Work Visa* or *Interview Prep* to explore more.`,
  },

  // 🆘 Help / FAQ
  need_help: {
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: `🆘 Need help?\n\nWe’re here for you. What do you need help with?`,
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: "faq",
              title: "❓ FAQs",
            },
          },
          {
            type: "reply",
            reply: {
              id: "talk_to_agent",
              title: "🧑‍💼 Talk to Expert",
            },
          },
        ],
      },
    },
  },

  // ℹ️ FAQs
  faq: {
    type: "text",
    text: `📌 *Frequently Asked Questions*\n\n1. What services do you offer?\n2. Do you help with scholarships?\n3. What countries can I study in?\n4. Is English test mandatory?\n5. What are the costs involved?\n\nReply with the number (e.g., *1*) to know more.`,
  },

  // 💬 Human Support
  talk_to_agent: {
    type: "text",
    text: `👨‍💼 Please wait while we connect you to a support expert.\n\nIn the meantime, type *menu* anytime to return to the main menu.`,
  },

  // ❌ Fallback
  error_fallback: {
    type: "text",
    text: `❌ Sorry, I didn’t get that. Please choose from the menu or type *help*.`,
  },
};

export default messageTemplates;
