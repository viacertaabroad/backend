// whatsapp/utils/messageTemplates.js
const messageTemplates = {
  // Welcome template with interactive buttons
  welcome: {
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: `👋 Welcome to *ViaCerta Abroad* – Your Trusted Partner for Global Education & Career Success.
Empowering Dreams, Enabling Futures. How can we help you today?`,
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: "services_overview",
              title: "Our Services",
            },
          },
          {
            type: "reply",
            reply: {
              id: "counseling",
              title: "Free Counseling",
            },
          },
          {
            type: "reply",
            reply: {
              id: "contact",
              title: "Contact Us",
            },
          },
        ],
      },
    },
  },

  services_overview: {
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: `🌐 *Our Comprehensive Services*\n
1️⃣ Academic & Career Guidance\n
2️⃣ Admissions & Documentation Support\n
3️⃣ Post-Admission Assistance\n
4️⃣ Career Support\n\n
Please choose the service you are most interested in:`,
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: "academic_guidance",
              title: "Academic Guidance",
            },
          },
          {
            type: "reply",
            reply: {
              id: "admissions",
              title: "Admissions Help",
            },
          },
          {
            type: "reply",
            reply: {
              id: "post_admission",
              title: "Post-Admission",
            },
          },
          {
            type: "reply",
            reply: {
              id: "career_support",
              title: "Career Support",
            },
          },
        ],
      },
    },
  },

  academic_guidance: {
    type: "text",
    text: `🎓 *Personalized Academic & Career Guidance*\n
Our consultancy ensures that your academic goals align with global career opportunities. Would you like to book a free counseling session?`,
  },

  admissions: {
    type: "text",
    text: `📄 *Admissions & Documentation Support*\n
We offer detailed assistance with your university applications including SOP, LOR guidance, and visa support. Would you like to know more?`,
  },

  post_admission: {
    type: "text",
    text: `🏠 *Post-Admission Assistance*\n
We provide support with accommodation, part-time/full-time job guidance, and interview preparation. Need more details on housing support?`,
  },

  career_support: {
    type: "text",
    text: `💼 *Career Transition & Work Visa Support*\n
We help with job search strategies, resume building, and work visa conversion. Would you like some job search tips?`,
  },

  // Default fallback message if input is not recognized
  error_fallback: {
    type: "text",
    text: `❌ Sorry, we didn't understand that. Please try selecting one of the available options or type your query.`,
  },
};

export default messageTemplates;
