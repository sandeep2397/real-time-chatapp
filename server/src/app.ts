import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
// Load environment variables from .env file
dotenv.config();

// recreate functions from CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**------------Connecting to default mongoDb---------- */
// const mongoURL = process.env.MONGO_URL ?? "";
// try {
//   const connection = await mongoose
//     .createConnection("mongodb://localhost:27017/Eventshuffle", {
//       serverSelectionTimeoutMS: 30000, // 30 seconds
//       socketTimeoutMS: 45000, // 45 seconds
//     })
//     .asPromise();
//   if (connection) {
//     connection.on("connected", () => {
//       console.log("Mongoose connected to the database.");
//     });

//     connection.on("error", (err) => {
//       console.error("Mongoose connection error:", err);
//     });

//     connection.on("disconnected", () => {
//       console.log("Mongoose disconnected. Attempting to reconnect...");
//     });

//     connection.on("reconnected", () => {
//       console.log("Mongoose reconnected to the database.");
//     });
//     console.log("Connected to Mongo database!!!.");
//   }
// } catch (err) {
//   console.log(`Error connecting to mongo db `, err);
// }

const app = express();
// app.disable('x-powered-by'); // security thing
app.use(express.json());
app.use(cors());

axios.defaults.withCredentials = true;

app.get('/api/hello', (req: any, res: any) => {
  res.json({ message: 'Hello from another endpoint!' });
});

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('*', (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

export default app;
