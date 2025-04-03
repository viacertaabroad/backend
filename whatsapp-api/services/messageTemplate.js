// Button message template

export const textMessage = (to, text) => ({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to,
  type: "text",
  text: { body: text },
});

export const buttonMessage = (to, header, body, buttons, footer = null) => ({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to,
  type: "interactive",
  interactive: {
    type: "button",
    ...(header && { header: { type: "text", text: header } }),
    body: { text: body },
    ...(footer && { footer: { text: footer } }),
    action: {
      buttons: buttons.map((btn) => ({
        type: "reply",
        reply: {
          id: btn.id,
          title: btn.title,
        },
      })),
    },
  },
});

// List message template
export const listMessage = (to, header, body, buttonText, sections) => ({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to,
  type: "interactive",
  interactive: {
    type: "list",
    header: { type: "text", text: header },
    body: { text: body },
    action: {
      button: buttonText,
      sections: sections.map((section) => ({
        title: section.title,
        rows: section.rows.map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
        })),
      })),
    },
  },
});

export const broadcastMessage = (recipients, message) => ({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to: recipients,
  type: "text", // Can be any valid message type
  text: message,
});


// Alternatively, you can export them together as named exports
export const messageTemplates = {
  textMessage,
  buttonMessage,
  listMessage,
  broadcastMessage,
};
