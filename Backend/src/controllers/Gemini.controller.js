import  askGemini  from "../utils/Info.utils.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse } from "../utils/ApiResponse.js";

export const getGeminiResponse = asyncHandler(async (req, res) => {
  const { question } = req.body;

  if (!question || question.trim() === "")
    return res.status(400).json(new ApiResponse(400, null, "Question is required"));

  const answer = await askGemini(question);

  return res
    .status(200)
    .json(new ApiResponse(200, { answer }, "Response generated successfully"));
});
