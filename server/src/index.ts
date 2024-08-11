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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const mongoURL = 'mongodb+srv://sandeepgp2397:F02DvPQxzowJujJY@cluster0.nku9qrs.mongodb.net/Chat';
const memoryStore = new session.MemoryStore();

const sessionMiddleware = session({
  secret: 'safe-chat-secret',
  resave: false,
  saveUninitialized: false,
  store: memoryStore,
  cookie: {
    maxAge: 60000000,
  },
});

app.use(sessionMiddleware);
axios.defaults.withCredentials = true;

// List of allowed origins
const allowedOrigins = ['http://localhost:4000', 'https://ui-real-time-chatapp.vercel.app'];

const corsOptions = {
  origin: ['http://localhost:4000', 'https://ui-real-time-chatapp.vercel.app'],
  credentials: true, // Enable credentials (cookies, authorization headers, etc.)
};

// Use CORS middleware
app.use(cors(corsOptions));

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
const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.body?.userId;
  const username = userId?.split('@')?.[0];
  if (req.session && req.session.userData) {
    // User is authenticated, proceed to the next middleware or route handler
    next();
  } else {
    // User is not authenticated, send an unauthorized response
    res.status(401).json({ message: 'Unauthorized. Please log in to access this resource.' });
  }
};

app.post('/api/login', async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.body?.userId;
  const username: string = userId?.split('@')?.[0];
  const prefName = username?.charAt(0)?.toUpperCase() + username?.slice(1);
  console.log('!!!! /login entered');
  try {
    const user = await User.findOne({
      userId: {
        $regex: new RegExp(userId, 'i'),
      },
    });
    req.session.userData = {
      username: username?.toLowerCase(),
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
      const loadAllContacts = contacts || [];
      const adminContact = [
        {
          username: 'sandeep',
          preferedName: 'Sandy',
        },
      ];
      // const filteredContacts = loadAllContacts?.filter((contact: any) => contact.username !== username);
      const newUser = new User({
        userId,
        username: username?.toLowerCase(),
        contacts: adminContact,
        online: true,
        socketId: '',
      });

      const adminUser: any = await User.findOne({ username: 'sandeep' });
      const appendedContacts = [...(adminUser?.contacts || []), { username: username, preferedName: prefName }];
      const updatedRes = await User.updateOne(
        { username: 'sandeep' },
        {
          $set: {
            contacts: appendedContacts,
          },
        }
      );

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
    origin: ['http://localhost:4000', 'https://ui-real-time-chatapp.vercel.app'],
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

function convertTo12HourFormat() {
  // Parse the GMT date string into a Date object
  //   const date = new Date(gmtDateString);

  //   // Extract components
  //   const options: any = {
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     second: '2-digit',
  //     hour12: true,
  //     timeZone: 'GMT',
  //   };

  //   // Convert to 12-hour format
  //   const timeString = date.toLocaleTimeString('en-US', options);
  const date = new Date();
  const dateOptions = {
    month: 'long', // Full month name (e.g., 'August')
    day: 'numeric', // Numeric day (e.g., '10')
    year: 'numeric', // Full year (e.g., '2024')
  };

  const timeOptions = {
    hour: 'numeric', // Numeric hour (e.g., '1')
    minute: 'numeric', // Numeric minute (e.g., '05')
    second: 'numeric', // Numeric second (e.g., '30')
    hour12: true, // 12-hour format with AM/PM
  };

  // Format date and time separately
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    hour12: true,
    minute: 'numeric',
  });
  console.log(formattedDate);

  // Format the final string
  return formattedDate;
}

io.on('connection', async (socket) => {
  console.log('User connected:', socket.id);
  const req = socket.request as any;
  let disconnectTimeout: any;

  const socketusername: any = socket?.handshake?.query?.username;
  console.log('socketusername:', socketusername);

  const userData = getUserSessionData(req);
  console.log('User session Data:', userData);
  const bindUserName = userData?.username ?? socketusername;

  socket.on('join', async (userId: string) => {
    const username = userId?.split('@')?.[0];
    socket.join(username);

    const loadContacts = async () => {
      try {
        const dbUser: any = await User.findOne({ username: bindUserName });
        console.log(`${dbUser?.contacts?.length ?? 0} contacts exists for user ${username} loaded========>`);
        socket.emit('loadcontacts', dbUser?.contacts || []);
      } catch (err) {
        console.log(err);
      }
    };

    if (bindUserName) {
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
    const username = bindUserName;
    const loadMessages = async () => {
      try {
        const sessionUsername = req.session.username;
        const chats: any = await Chat.find({ participants: { $all: [bindUserName, recipient] } })
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
    if (bindUserName) {
      loadMessages();
    }
  });

  socket.on('send_message', async ({ content, recipient }: { content: string; recipient: string }) => {
    const sessionUsername = bindUserName;
    console.log('new message from send_message:' + recipient + 'to ' + sessionUsername);
    if (!sessionUsername) return;

    const userList: any = (await User.find({ username: { $in: [recipient, sessionUsername] } })) || [];
    const userSocketIDs = userList?.map((user: any) => user?.socketId);

    const chat = await Chat.findOne({ participants: { $all: [sessionUsername, recipient] } });
    const gmtDateString = new Date().toDateString();
    const convertedDateString = convertTo12HourFormat();

    if (!chat) {
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

      let newMsgs =
        [...oldMsgs, { sender: sessionUsername, content, timestamp: convertedDateString, type: 'text' }] || [];
      await chat.updateOne({
        messages: newMsgs,
      });
    }
    io.to(userSocketIDs).emit('new_message', {
      sender: sessionUsername,
      timestamp: convertedDateString,
      recipient,
      content,
    });
  });

  socket.on('disconnect', (reason) => {
    disconnectTimeout = setTimeout(() => {
      console.log('User disconnected:', bindUserName);
      console.log('reason:', reason);
      if (bindUserName) {
        User.findOneAndUpdate({ username: bindUserName }, { online: false });
      }
    }, 5000); // Delay for 5 seconds
  });

  socket.on('reconnect', () => {
    clearTimeout(disconnectTimeout);
    console.log('User reconnected:', socket.id);
    // Handle reconnection logic
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
  })
  .catch((err) => {
    console.error('Error Connecting to mongo db url======>', mongoURL);
    console.error('Error Connecting to mongo db======>', err);
  });

const port = process.env.PORT || 4001;
httpServer.listen(port, () => console.log(`Server running on port ${port}`));

export default app;
