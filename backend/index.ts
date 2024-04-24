import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./lib/uploadthing";
// import mailRouter from "./routes/mail.routes";
// import testRouter from "./routes/test.routes";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import dormRouter from "./routes/dorm.routes";
import chatRouter from "./routes/chat.routes";
import groupChatRouter from "./routes/groupChat.routes";
// import bookingRouter from "./routes/booking.routes"
// import paymentRouter from "./routes/payment.routes"
// import reviewRouter from "./routes/review.routes"
// import issueRouter from "./routes/issue.routes"
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "http";
import { Message } from "@prisma/client";
import { db } from "./lib/db";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

// dotenv.config();

dotenv.config();

const app: Express = express();

const port = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://192.168.165.155:3000" }));
app.use(express.json());
//app.use(express.urlencoded());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://192.168.165.155:3000",
    credentials: true,
  },
});

// app.use('/api/v1', testRouter)
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
// app.use('/api/v1/mails', mailRouter)
app.use("/api/v1/dorms", dormRouter);
// app.use('/api/v1/bookings', bookingRouter)
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/group-chats", groupChatRouter);
// app.use('/api/v1/payment', paymentRouter)
// app.use('/api/v1/reviews', reviewRouter)
// app.use('/api/v1/issues', issueRouter)

app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
  })
);

/*
LOGIN
*/

const loginMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.username === "admin" && req.body.password === "1234") next();
  else res.send("Wrong username or password");
};

app.get("/", async (req: Request, res: Response) => {
  res.send("Hello, this is backend!");
});

app.post("/login", loginMiddleware, (req: Request, res: Response) => {
  const payload = {
    user: req.body.username,
    iat: new Date().getTime(),
  };
  res.send("Login");
});

app.use("/create-group-chat", chatRouter);

// ----------------------------------------------------------------

let onlineUsers: { userId: string; socketId: string }[] = [];

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // group chat

  socket.on("send-group-message", (message, roomId) => {
    socket.to(roomId).emit("receive-group-message", message);
  });

  socket.on("join-room", (roomId, callback) => {
    socket.join(roomId);
    callback();
  });

  // online status

  socket.on("new-user-add", (newUserId) => {
    if (!onlineUsers.some((user) => user.userId === newUserId)) {
      // if user is not added before
      onlineUsers.push({ userId: newUserId, socketId: socket.id });
      console.log("new user is here!", onlineUsers);
    }
    // send all active users to new user
    io.emit("get-users", onlineUsers);
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    console.log("user disconnected", onlineUsers);
    // send all online users to all users
    io.emit("get-users", onlineUsers);
  });

  socket.on("offline", () => {
    // remove user from active users
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    console.log("user is offline", onlineUsers);
    // send all online users to all users
    io.emit("get-users", onlineUsers);
  });

  socket.on(
    "chats:sendMessage",
    async (message: Message, senderSide: "A" | "B", sendTo: string) => {
      console.log(message);
      try {
        const createMessage = await db.message.create({
          data: message,
        });

        let updateData: any = {
          lastUpdated: message.sentAt,
        };

        if (senderSide === "A") {
          updateData = {
            ...updateData,
            participantBUnread: {
              increment: 1,
            },
          };
        } else {
          updateData = {
            ...updateData,
            participantAUnread: {
              increment: 1,
            },
          };
        }

        const updateChat = await db.chat.update({
          where: {
            id: message.chatId,
          },
          data: updateData,
        });

        const senderUser = await db.user.findUnique({
          where: {
            id: sendTo,
          },
          select: {
            id: true,
            displayName: true,
            imageURL: true,
          },
        });

        if (!senderUser) return;

        io.emit(`chats:${message.chatId}:addMessage`, message);

        io.emit(`users:${message.senderId}:chatsUpdate`);
        io.emit(`users:${sendTo}:chatsUpdate`);

        io.emit(`users:${sendTo}:notifications`, {
          type: "Chat",
          context: message.chatId,
          title: `Chat from ${senderUser.displayName} | HorHub`,
          message:
            message.type === "Text"
              ? message.text
              : message.type === "Images"
              ? `${message.pictures.length} picture(s) ${
                  message.pictures.length > 1 ? "are" : "is"
                } sent`
              : "The location is sent",
          icon: senderUser.imageURL,
        });
      } catch (err) {
        console.log(err);
      }
    }
  );
});

// -----Swagger----------------------------------------------------

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "HorHub API",
      version: "1.0.0",
    },
    servers: [
      {
        url: `http://192.168.165.155:${port}/api/v1`,
      },
    ],
  },
  apis: ["./routes/*.ts"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// ----------------------------------------------------------------

server.listen(port, () => {
  console.log(`[server]: Server is running at http://192.168.165.155:${port}`);
});

export { io };

module.exports = app;
