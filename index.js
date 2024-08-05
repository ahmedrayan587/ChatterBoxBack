import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { configDotenv } from "dotenv";
import { Server } from "socket.io";

const app = express();
configDotenv();
const allowedOrigins = [
  "http://localhost:5173", // Local development
  "https://ahmedrayan587.github.io/ChatterBoxFront/", // GitHub Pages
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json({ limit: "1GB" }));


app.use("/auth", userRoutes);
app.use("/message", messageRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello, world!" });
});


mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log(err.message);
  });
const server = app.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`);
});

//socket.io code to make a realTime chat.
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    global.onlineUsers.set(userId, socket.id);
  });
  socket.on("send-message", (data) => {
    // Corrected the event name to "send-message"
    const sendUserSocket = global.onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-receive", data); // Corrected "msg-recieve" to "msg-receive"
    }
  });
  socket.on("call-user", (data) => {
    const sendUserSocket = global.onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("call-receive", data);
    }
  });

  socket.on("make-answer", (data) => {
    const sendUserSocket = global.onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("answer-made", data);
    }
  });

  socket.on("ice-candidate", (data) => {
    const sendUserSocket = global.onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("ice-candidate", data);
    }
  });

  socket.on("reject-call", (data) => {
    const sendUserSocket = global.onlineUsers.get(data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("call-rejected");
    }
  });
});
