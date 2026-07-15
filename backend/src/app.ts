import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import categoryRoutes from "./routes/categoryRoutes";
import currencyRoutes from "./routes/currencyRoutes";

dotenv.config();

const app = express();

// Basic Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "BukuSaku API docs",
  }),
);

app.use("/api/auth", authRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/currency", currencyRoutes);

app.get("/", (req, res) => {
  res.json({ message: "BukuSaku API ✅" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
