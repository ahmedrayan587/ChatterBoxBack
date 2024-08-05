import messageModel from "../model/messageModel.js";
import User from "../model/userModel.js";

export async function addMessage(req, res, next) {
  try {
    const { from, to, message } = req.body;
    const data = await messageModel.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });

    if (!data)
      return res.json({
        status: 400,
        msg: "Failed to add message to database.",
      });

    // Update last chat timestamp for both users
    await User.updateOne(
      { _id: from },
      { $set: { [`lastChat.${to}`]: new Date() } }
    );
    await User.updateOne(
      { _id: to },
      { $set: { [`lastChat.${from}`]: new Date() } }
    );

    return res.json({ status: 200, msg: "Message added successfully." });
  } catch (error) {
    next(error);
  }
}

function formatDate(date) {
  const options = { month: "short", day: "numeric", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

function formatTime(date) {
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

function isYesterday(date) {
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

export async function getAllMessages(req, res, next) {
  try {
    const { from, to } = req.body;
    const messages = await messageModel
      .find({
        users: {
          $all: [from, to],
        },
      })
      .sort({ updatedAt: 1 });
    const projectMessages = messages.map((msg) => {
      const messageDate = new Date(msg.updatedAt);
      const formattedDate = isYesterday(messageDate)
        ? "Yesterday"
        : formatDate(messageDate);
      const formattedTime = formatTime(messageDate);
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
        date: formattedDate,
        time: formattedTime,
      };
    });
    res.json({ status: 200, projectMessages });
  } catch (error) {
    next(error);
  }
}
