import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import { createServer } from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { Chat, IMessages } from './models/Chat.js';
import { Group } from './models/Group.js';
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
  //   console.log('!!!! /login entered');
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
        console.log('Session saved successfully', req.session?.userData);
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

app.post('/api/creategroup', async (req: Request, res: Response, next: NextFunction) => {
  const reqBody = req?.body || {};
  const newGroup = new Group({
    name: reqBody?.name,
    groupImage: reqBody?.groupImage,
    participants: reqBody?.participants,
  });
  try {
    const group = await newGroup.save();
    res.json({ status: 200, msg: 'Group created successfully', group });
  } catch (err) {
    console.error('!!!! failed to create the group');
    res.json({ status: 400, msg: '!!!! failed to create the group', err });
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
  console.log('                                ');
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

    const loadGroups = async () => {
      try {
        const dbGroups: any = await Group.aggregate().match({ 'participants.username': bindUserName });
        console.log(`${dbGroups?.length ?? 0} groups exists for user ${username} loaded========>`);
        socket.emit('loadgroups', dbGroups || []);
      } catch (err) {
        console.log(err);
      }
    };

    if (bindUserName) {
      loadGroups();
      loadContacts();
      //   loadUserMessages();
    }
    if (username) {
      const res = await User.updateOne(
        { username: username },
        {
          $set: {
            socketId: socket.id,
            online: true,
          },
        }
      );
      //   console.log('user updated', res);
    }
  });

  socket.on('new-user-chat', ({ sender, recipient }: any) => {
    const username = bindUserName;
    const loadUserMessages = async () => {
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
      loadUserMessages();
    }
  });

  socket.on(
    'send_message',
    async ({
      content,
      recipient,
      fileUrl,
      fileType,
      fileName,
    }: {
      content: string;
      recipient: string;
      fileUrl: string;
      fileType: string;
      fileName: string;
    }) => {
      const sessionUsername = bindUserName;
      console.log('new message from send_message:' + recipient + ' to ' + sessionUsername);
      if (!sessionUsername) return;

      const userList: any = (await User.find({ username: { $in: [recipient, sessionUsername] } })) || [];
      const userSocketIDs = userList?.map((user: any) => user?.socketId);

      const chat = await Chat.findOne({ participants: { $all: [sessionUsername, recipient] } });
      const gmtDateString = new Date().toDateString();
      const convertedDateString = convertTo12HourFormat();
      const msgObj: IMessages = {
        sender: sessionUsername,
        content,
        timestamp: convertedDateString,
        type: 'text',
      };
      if (fileUrl) {
        msgObj['fileUrl'] = fileUrl;
      }
      if (fileType) {
        msgObj['fileType'] = fileType;
      }
      if (fileName) {
        msgObj['fileName'] = fileName;
      }
      if (!chat) {
        const newChat = new Chat({
          participants: [sessionUsername, recipient],
          messages: [msgObj],
        });
        await newChat.save();
      } else {
        const oldMsgs: any = chat.messages || [];

        let newMsgs = [...oldMsgs, msgObj] || [];
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
    }
  );

  socket.on('user-typing', async ({ sender, recipient, content }: any) => {
    // const username = bindUserName;
    const userList: any = (await User.find({ username: { $in: [recipient, sender] } })) || [];
    const userSocketIDs = userList?.map((user: any) => user?.socketId);

    if (content) {
      io.to(userSocketIDs).emit('show-typing', {
        msg: `${sender} is typing...`,
        sender: sender,
        recipient,
        content,
      });
    } else {
      io.to(userSocketIDs).emit('hide-typing', {
        msg: `${sender} is typing...`,
        sender: sender,
        recipient,
        content,
      });
    }
  });

  /**================== Group messages=================== */
  socket.on('group-user-typing', async ({ sender, content, groupId }: any) => {
    const group: any = await Group.findById(groupId);

    if (group) {
      const newGroupObjId = new mongoose.Types.ObjectId(groupId);
      const userSocketIDs: any =
        (await Group.aggregate()
          .match({
            _id: newGroupObjId,
          })
          .lookup({
            from: 'users',
            localField: 'participants.username',
            foreignField: 'username',
            as: 'users',
          })
          .project({
            _id: 0,
            sockets: '$users.socketId',
          })) || [];

      const socketIds = userSocketIDs?.[0]?.sockets || [];
      if (content) {
        io.to(socketIds).emit('show-group-user-typing', {
          msg: `${sender} is typing...`,
          sender: sender,
          content,
          groupId,
        });
      } else {
        io.to(socketIds).emit('hide-group-user-typing', {
          msg: `${sender} is typing...`,
          sender: sender,
          content,
          groupId,
        });
      }
    }
  });

  socket.on('new-group-chat', ({ groupId }: any) => {
    const username = bindUserName;
    const loadGrpMessages = async () => {
      try {
        const sessionUsername = req.session.username;
        const group: any = await Group.findById(groupId);
        if (group) {
          console.log(`${group?.messages?.length ?? 0} messages shared for the group ${group?.name} ========>`);

          socket.emit('load-group-messages', { messages: group?.messages, participants: group?.participants } || []);
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (bindUserName) {
      loadGrpMessages();
    }
  });

  socket.on(
    'broadcast_new_message',
    async ({
      content,
      groupId,
      fileUrl,
      fileType,
      fileName,
    }: {
      content: string;
      groupId: string;
      fileUrl: string;
      fileType: string;
      fileName: string;
    }) => {
      const sessionUsername = bindUserName;
      console.log('new group message from :' + sessionUsername);
      if (!sessionUsername) return;

      const group: any = await Group.findById(groupId);

      if (group) {
        const convertedDateString = convertTo12HourFormat();
        const newGroupObjId = new mongoose.Types.ObjectId(groupId);
        const userSocketIDs: any =
          (await Group.aggregate()
            .match({
              _id: newGroupObjId,
            })
            .lookup({
              from: 'users',
              localField: 'participants.username',
              foreignField: 'username',
              as: 'users',
            })
            .project({
              _id: 0,
              sockets: '$users.socketId',
            })) || [];

        const msgObj: IMessages = {
          sender: sessionUsername,
          content,
          timestamp: convertedDateString,
          type: 'text',
        };
        if (fileUrl) {
          msgObj['fileUrl'] = fileUrl;
        }
        if (fileType) {
          msgObj['fileType'] = fileType;
        }
        if (fileName) {
          msgObj['fileName'] = fileName;
        }
        const concatedMsgs = [...group?.messages, msgObj];
        try {
          const updatedUser = await Group.findByIdAndUpdate(
            groupId,
            {
              $set: {
                messages: concatedMsgs,
              },
            },
            { new: true, useFindAndModify: false }
          );
          io.to(userSocketIDs?.[0]?.sockets).emit('new_group_message', {
            sender: sessionUsername,
            timestamp: convertedDateString,
            content,
            groupId,
          });
        } catch (err) {
          console.log('Group msg Update Failed ', err);
        }
      }
    }
  );

  socket.on('disconnect', async (reason) => {
    // disconnectTimeout = setTimeout(() => {
    //   console.log('User disconnected:', bindUserName);
    //   console.log('reason:', reason);
    //   if (bindUserName) {
    //     User.findOneAndUpdate({ username: bindUserName }, { online: false, socketId: '' });
    //   }
    // }, 5000); // Delay for 5 seconds
    console.log('User disconnected:', bindUserName);
    console.log('reason:', reason);
    if (bindUserName) {
      const res = await User.updateOne(
        { username: bindUserName },
        {
          $set: {
            online: false,
            socketId: '',
          },
        }
      );
      console.log('socket removed !! for user===>', bindUserName);
      //   User.findOneAndUpdate({ username: bindUserName }, { online: false, socketId: '' });
    }
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
