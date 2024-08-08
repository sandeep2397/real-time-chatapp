import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { MongoConnection } from './db.js';
dotenv.config();

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    // origin: 'http://localhost:4000', // Frontend URL
    // methods: ['GET', 'POST'],
    origin: '*',
  },
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: any) {
  const p: number = parseInt(val, 10);

  if (Number.isNaN(p)) {
    // named pipe
    return val;
  }

  if (p >= 0) {
    // port number
    return p;
  }

  return false;
}

/**
 * Get port from environment and store in Express.
 */
export const port: number = normalizePort(process.env.PORT || '4001');
app.set('port', port);

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('message', (message) => {
    console.log('message:', message);
    io.emit('message', message); // Broadcast the message to all clients
  });
  ``;
  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

function onError(error: any) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe  ${port}` : `Port  ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.log(`${bind} requires elevated privileges`);
      console.error(error);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(error);
      process.exit(1);
      break;
    default:
      throw error;
  }
}
MongoConnection().then(() => {
  // console.log('Connected to MongoDB');
  httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

httpServer.on('error', onError);
