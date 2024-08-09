import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import { createServer } from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { Chat, IMessages } from './models/Chat.js';
import { User } from './models/Users.js';

dotenv.config();

export interface UserSessionData {
  username: string;
  userId: string;
}

declare module 'express-session' {
  interface SessionData {
    userData: UserSessionData;
  }
}

export const getUserSessionData = (req: Request): UserSessionData | undefined => {
  return req.session.userData;
};

const app = express();
const mongoURL = process.env.MONGO_URL ?? '';

mongoose.connect(mongoURL, {}).then(() => {
  console.log('Connected to MongoDB:', mongoURL);
});

const sessionMiddleware = session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: new session.MemoryStore(),
  cookie: {
    maxAge: 60000000,
  },
});

app.use(sessionMiddleware);
app.use(express.json());

// HTTP route for login
app.post('/login', async (req: Request, res: Response) => {
  const userId = req.body?.userId;
  const username = userId?.split('@')?.[0];
  const newUser = new User({ userId, username, online: true });
  await newUser.save();
  req.session.userData = {
    username: username,
    userId,
  };
  req.session.save((err: any) => {
    if (!err) {
      console.log('Session saved successfully', req.session);
    } else {
      console.log(`Error saving session: ${err}`);
    }
  });
  res.json({ status: 200, msg: 'Logged in successfully', user: newUser });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  pingTimeout: 60000000, // Increase timeout if needed (in milliseconds)
  pingInterval: 25000000, // Adjust ping interval (in milliseconds)
  cors: {
    origin: ['http://localhost:4000', 'https://real-time-chatapp-sigma.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true, // Allow cookies to be sent
  },
});

// Middleware for Socket.io to use session
io.use((socket, next) => {
  const req = socket.request as Request;
  const res = {} as Response; // Mock response object
  sessionMiddleware(req, res, next as NextFunction);
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  const req = socket.request as any;
  const userData = getUserSessionData(req);
  console.log('User session Data:', userData);

  socket.on('join', (userId: string) => {
    const username = userId?.split('@')?.[0];
    socket.join(username);

    const loadMessages = async () => {
      try {
        const sessionUsername = req.session.username;
        const chats: any = await Chat.find({ participants: { $all: [userData?.username] } })
          .sort({ timeStamp: 1 })
          .exec();

        // console.log('messages========>', chats[0]?.messages);
        socket.emit('loadmessages', chats[0]?.messages || []);
      } catch (err) {
        console.log(err);
      }
    };
    if (userData?.username) {
      loadMessages();
    }
    // req.session.save((err: any) => {
    //   if (!err) {
    //     console.log('Session saved successfully', req.session);
    //   } else {
    //     console.log(`Error saving session: ${err}`);
    //   }
    // });
    if (username) {
      User.findOneAndUpdate({ username: username }, { online: true });
    }
  });

  socket.on('send_message', async ({ content, recipient }: { content: string; recipient: string }) => {
    const sessionUsername = userData?.username;
    console.log('Session username in send_message:', userData?.username);
    if (!sessionUsername) return;

    const chat = await Chat.findOne({ participants: { $all: [sessionUsername, recipient] } });
    if (!chat) {
      const msgObj: IMessages = {
        sender: sessionUsername,
        content,
        timestamp: new Date().toDateString(),
        type: 'text',
      };
      const newChat = new Chat({
        participants: [sessionUsername, recipient],
        messages: [msgObj],
      });
      await newChat.save();
    } else {
      const oldMsgs: any = chat.messages || [];
      let newMsgs =
        [...oldMsgs, { sender: sessionUsername, content, timestamp: new Date().toDateString(), type: 'text' }] || [];
      await chat.updateOne({
        messages: newMsgs,
      });
    }
    io.emit('new_message', { sender: sessionUsername, content });
  });

  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', userData?.username);
    console.log('reason:', reason);
    if (userData?.username) {
      User.findOneAndUpdate({ username: userData?.username }, { online: false });
    }
  });
});

const port = process.env.PORT || 4001;
httpServer.listen(port, () => console.log(`Server running on port ${port}`));
