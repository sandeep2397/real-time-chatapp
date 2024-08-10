import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import { createServer } from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { Chat, IMessages } from './models/Chat.js';
import { User } from './models/Users.js';
import contacts from './stubbedContacts.js';

dotenv.config();

interface UserSessionData {
  username: string;
  userId: string;
}

declare module 'express-session' {
  interface SessionData {
    userData: UserSessionData;
  }
}

const getUserSessionData = (req: Request): UserSessionData | undefined => {
  return req.session.userData;
};

const app = express();
axios.defaults.withCredentials = true;

// List of allowed origins
const allowedOrigins = [
  'http://localhost:4000',
  'http://localhost:4001',
  'http://localhost:4002',
  'https://ui-real-time-chatapp.vercel.app',
];

const corsOptions = {
  origin: (origin: any, callback: any) => {
    // If no origin or origin is in the allowed list, allow the request
    // if (!origin || allowedOrigins.includes(origin)) {
    //   callback(null, true);
    // } else {
    //   callback(new Error('Not allowed by CORS'));
    // }
    callback(null, true);
  },
  credentials: true, // Enable credentials (cookies, authorization headers, etc.)
};

// Use CORS middleware
app.use(cors(corsOptions));

const mongoURL = process.env.MONGO_URL ?? '';

const sessionMiddleware = session({
  secret: 'safe-chat-secret',
  resave: false,
  saveUninitialized: false,
  //   store: MongoStore.create({ mongoUrl: mongoURL }),
  cookie: {
    maxAge: 60000000,
  },
});

app.use(sessionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware to catch CORS errors
app.use((err: any, req: any, res: any, next: NextFunction) => {
  if (err?.message?.includes('Not allowed by CORS')) {
    // Custom response for CORS errors
    res.status(403).json({ message: err.message });
  } else {
    next(err); // Pass to next middleware if it's not a CORS error
  }
});

app.get('/api/hello', (req: any, res: any) => {
  res.json({ message: 'Hello from another endpoint!' });
});

// HTTP route for login
app.post('/api/login', async (req: Request, res: Response) => {
  const userId = req.body?.userId;
  const username = userId?.split('@')?.[0];
  console.log('!!!! /login entered');
  try {
    const user = await User.findOne({ userId });
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

    if (user) {
      res.json({ status: 200, msg: 'Logged in successfully', user });
    } else {
      const filteredContacts = contacts?.filter((contact: any) => contact.username !== username);
      const newUser = new User({ userId, username, contacts: filteredContacts, online: true, socketId: '' });
      try {
        await newUser.save();
        console.log('User Added successfully');
      } catch (err: any) {
        console.error('Failed to save user', err?.message);
      }
      res.json({ status: 200, msg: 'Logged in successfully', user: newUser });
    }
  } catch (err) {
    console.error('!!!! /login error');
    res.json({ status: 400, msg: 'mongo error in successfully', err });
  }
});

app.use('/', (req: any, res: any) => {
  res.status(200).send({ message: 'Empty route Server is up and running!' });
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

function convertTo12HourFormat(gmtDateString: string) {
  // Parse the GMT date string into a Date object
  const date = new Date(gmtDateString);

  // Extract components
  const options: any = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'GMT',
  };

  // Convert to 12-hour format
  const timeString = date.toLocaleTimeString('en-US', options);

  // Format the final string
  return `${date.toDateString()} ${timeString} GMT`;
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  const req = socket.request as any;
  const userData = getUserSessionData(req);
  console.log('User session Data:', userData);

  socket.on('join', async (userId: string) => {
    const username = userId?.split('@')?.[0];
    socket.join(username);

    const loadContacts = async () => {
      try {
        const dbUser: any = await User.findOne({ username: userData?.username });
        console.log(`${dbUser?.contacts?.length ?? 0} contacts exists for user ${username} loaded========>`);
        socket.emit('loadcontacts', dbUser?.contacts || []);
      } catch (err) {
        console.log(err);
      }
    };

    if (userData?.username) {
      loadContacts();
      //   loadMessages();
    }
    if (username) {
      const res = await User.updateOne(
        { username: username },
        {
          $set: {
            socketId: socket.id,
          },
        }
      );
      //   console.log('user updated', res);
    }
  });

  socket.on('new-user-chat', ({ sender, recipient }: any) => {
    const username = userData?.username;
    const loadMessages = async () => {
      try {
        const sessionUsername = req.session.username;
        const chats: any = await Chat.find({ participants: { $all: [userData?.username, recipient] } })
          .sort({ timeStamp: 1 })
          .exec();

        console.log(
          `${chats[0]?.messages?.length ?? 0} messages shared between  ${recipient} and ${username} ========>`
        );
        socket.emit('loadmessages', chats[0]?.messages || []);
      } catch (err) {
        console.log(err);
      }
    };
    if (userData?.username) {
      loadMessages();
    }
  });

  socket.on('send_message', async ({ content, recipient }: { content: string; recipient: string }) => {
    const sessionUsername = userData?.username;
    console.log('new message from send_message:' + recipient + 'to ' + sessionUsername);
    if (!sessionUsername) return;

    const userList: any = (await User.find({ username: { $in: [recipient, sessionUsername] } })) || [];
    const userSocketIDs = userList?.map((user: any) => user?.socketId);

    const chat = await Chat.findOne({ participants: { $all: [sessionUsername, recipient] } });
    if (!chat) {
      const gmtDateString = new Date().toDateString();
      const convertedDateString = convertTo12HourFormat(gmtDateString);
      const msgObj: IMessages = {
        sender: sessionUsername,
        content,
        timestamp: convertedDateString,
        type: 'text',
      };
      const newChat = new Chat({
        participants: [sessionUsername, recipient],
        messages: [msgObj],
      });
      await newChat.save();
    } else {
      const oldMsgs: any = chat.messages || [];
      const gmtDateString = new Date().toDateString();
      const convertedDateString = convertTo12HourFormat(gmtDateString);
      let newMsgs =
        [...oldMsgs, { sender: sessionUsername, content, timestamp: convertedDateString, type: 'text' }] || [];
      await chat.updateOne({
        messages: newMsgs,
      });
    }
    io.to(userSocketIDs).emit('new_message', { sender: sessionUsername, recipient, content });
  });

  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', userData?.username);
    console.log('reason:', reason);
    if (userData?.username) {
      User.findOneAndUpdate({ username: userData?.username }, { online: false });
    }
  });
});

// Start the server

mongoose
  .connect(mongoURL, {
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
  })
  .then(() => {
    console.log('Connected to MongoDB', mongoURL);
    const port = process.env.PORT || 4001;
    httpServer.listen(port, () => console.log(`Server running on port ${port}`));
    // app.listen(port, () => {
    //   console.log(`Server is running on port ${port}`);
    // });
  })
  .catch((err) => {
    console.error('Error Connecting to mongo db url======>', mongoURL);
    console.error('Error Connecting to mongo db======>', err);
  });

export default app;
