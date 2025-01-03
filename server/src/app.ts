import dotenv from "dotenv";
import path from "path";

// Load environment variables first, before any other imports
const envPath = path.resolve(process.cwd(), ".env");
console.log("Current working directory:", process.cwd());
console.log("Loading .env from:", envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("Error loading .env file:", result.error);
  process.exit(1); // Exit if we can't load environment variables
} else {
  console.log(".env file loaded successfully");
  console.log("API Key exists:", !!process.env.OPENAI_API_KEY);
}

import express from "express";
import cors from "cors";
import uploadRouter from "./routes/upload";

const app = express();

// CORS ayarlarını genişlet
app.use(
  cors({
    origin: "http://localhost:5173", // Vite'ın default portu
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads klasörünü statik olarak serve et
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/upload", uploadRouter);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "success", message: "Server is running" });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
