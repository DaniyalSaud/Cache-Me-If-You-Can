import express from "express";
import { getGeminiResponse } from "../controllers/Gemini.controller.js";

const router = express.Router();

router.post("/ask", getGeminiResponse);

export default router;
