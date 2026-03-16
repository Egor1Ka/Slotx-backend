import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./db.js";
import routes from "./routes/routes.js";

const { PORT, FRONTEND_URL } = process.env;

const app = express();

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

connectDB();

if (process.env.API_PREFIX) {
  app.use(`/${process.env.API_PREFIX}`, routes);
} else {
  app.use(routes);
}

app.set("trust proxy", true);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
