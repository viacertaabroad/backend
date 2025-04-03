// Button message template
export const buttonMessage = (to, header, body, buttons) => ({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to,
  type: "interactive",
  interactive: {
    type: "button",
    header: { type: "text", text: header },
    body: { text: body },
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

// Alternatively, you can export them together as named exports
export const messageTemplates = {
  buttonMessage,
  listMessage,
};
