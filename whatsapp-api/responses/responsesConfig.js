
export const responseFlows = {
    // Initial greeting
    welcome: {
      text: "Welcome to our service! How can we help you today?",
      buttons: [
        { id: "btn_help", title: "Get Help" },
        { id: "btn_order", title: "Order Options" },
        { id: "btn_contact", title: "Contact Us" }
      ]
    },
  
    // Help flow
    btn_help: {
      text: "Here's how we can help:",
      buttons: [
        { id: "contact_support", title: "Contact Support" },
        { id: "faq", title: "View FAQs" },
        { id: "back", title: "Main Menu" }
      ]
    },
  
    // Order flow
    btn_order: {
      text: "Please select an option:",
      list: {
        header: "Order Options",
        body: "Choose delivery method",
        sections: [
          {
            title: "Delivery Methods",
            rows: [
              {
                id: "express",
                title: "Express",
                description: "2-3 business days"
              },
              {
                id: "standard",
                title: "Standard",
                description: "5-7 business days"
              },
              {
                id: "back",
                title: "Main Menu",
                description: "Return to main options"
              }
            ]
          }
        ]
      }
    },
  
    // FAQ responses
    faq: {
      text: "Frequently Asked Questions:",
      list: {
        header: "FAQ Categories",
        body: "Select a category",
        sections: [
          {
            title: "General Questions",
            rows: [
              {
                id: "faq_delivery",
                title: "Delivery Questions",
                description: "About shipping and delivery"
              },
              {
                id: "faq_payment",
                title: "Payment Questions",
                description: "About payments and refunds"
              }
            ]
          }
        ]
      }
    },
  
    // Specific FAQ responses
    faq_delivery: {
      text: "Delivery Information:\n\nWe offer multiple delivery options...",
      buttons: [
        { id: "faq", title: "Back to FAQs" },
        { id: "btn_help", title: "More Help" }
      ]
    },
  
    faq_payment: {
      text: "Payment Information:\n\nWe accept multiple payment methods...",
      buttons: [
        { id: "faq", title: "Back to FAQs" },
        { id: "btn_help", title: "More Help" }
      ]
    },
  
    // Support contact
    contact_support: {
      text: "Please describe your issue and our support team will contact you shortly.",
      quick_reply: true
    },
  
    // Default fallback
    default: {
      text: "Sorry, I didn't understand that. Please select an option:",
      buttons: [
        { id: "btn_help", title: "Get Help" },
        { id: "btn_order", title: "Order Options" }
      ]
    }
  };
  
  // Conversation state management
  export const conversationStates = {
    awaitingSupportDescription: "awaiting_support_description"
  };