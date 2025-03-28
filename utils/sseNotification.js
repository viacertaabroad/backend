let clients = [];

export const addClient = (res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  clients.push(res);

  res.on("close", () => {
    clients = clients.filter((client) => client !== res);
  });
};

export const sendNewRoomNotification = (room) => {
  clients.forEach((client) => {
    client.write(
      `data: ${JSON.stringify({
        message: "New Support Room created.",
        clickableMessage: "Join Room",
        redirectUrl: `/support`,
      })}\n\n`
    );
  });
};
