// src/utils/Deepgram.utils.js
import { createClient } from "@deepgram/sdk";
import dotenv from "dotenv";

dotenv.config();

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

/**
 * Transcribe from any public audio/video URL (e.g. YouTube, Dailymotion, MP3)
 */
export async function transcribeFromUrl(videoUrl, options = {}) {
  if (!videoUrl) throw new Error("videoUrl is required");
  if (!process.env.DEEPGRAM_API_KEY)
    throw new Error("Missing DEEPGRAM_API_KEY in environment");

  const {
    punctuate = true,
    diarize = false,
    language = "en",
    model = "nova",
    smart_format = true,
  } = options;

  const response = await deepgram.listen.prerecorded.transcribeUrl(
    { url: videoUrl },
    {
      model,
      language,
      punctuate,
      diarize,
      smart_format,
    }
  );

  return response;
}



// src/utils/Deepgram.utils.js
// import { createClient } from "@deepgram/sdk";
// import dotenv from "dotenv";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import { APIError } from "../utils/Apierror.js";
// import { ApiResponse } from "../utils/ApiResponse.js";

// dotenv.config();

// const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// export const transcribeFromUrl = asyncHandler(async (req, res) => {
//   const { videoUrl, options = {} } = req.body;

//   if (!videoUrl) {
//     throw new APIError(400, "videoUrl is required");
//   }

//   if (!process.env.DEEPGRAM_API_KEY) {
//     throw new APIError(500, "Missing DEEPGRAM_API_KEY in environment");
//   }

//   const {
//     punctuate = true,
//     diarize = false,
//     language = "en",
//     model = "nova",
//     smart_format = true,
//   } = options;

//   try {
//     const response = await deepgram.listen.prerecorded.transcribeUrl(
//       { url: videoUrl },
//       {
//         model,
//         language,
//         punctuate,
//         diarize,
//         smart_format,
//       }
//     );

//     const transcript =
//       response?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

//     return res
//       .status(200)
//       .json(
//         new ApiResponse(200, { transcript, raw: response }, "Transcription successful")
//       );
//   } catch (err) {
//     console.error("Deepgram error:", err);
//     throw new APIError(500, "Failed to transcribe from URL");
//   }
// });




// // src/utils/Deepgram.utils.js
// import { Deepgram } from "@deepgram/sdk";
// import dotenv from "dotenv";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import { APIError } from "../utils/Apierror.js";
// import { ApiResponse } from "../utils/ApiResponse.js";

// dotenv.config();

// const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);

// export const transcribeFromUrl = asyncHandler(async (req, res) => {
//   const { videoUrl, options = {} } = req.body;

//   if (!videoUrl) {
//     throw new APIError(400, "videoUrl is required");
//   }

//   if (!process.env.DEEPGRAM_API_KEY) {
//     throw new APIError(500, "Missing DEEPGRAM_API_KEY in environment");
//   }

//   const {
//     punctuate = true,
//     diarize = false,
//     language = "en",
//     model = "general",
//     tier = "nova",
//   } = options;

//   try {
//     const response = await deepgram.transcription.preRecorded(
//       { url: videoUrl },
//       { punctuate, diarize, language, model, tier }
//     );

//     const transcript =
//       response?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

//     return res
//       .status(200)
//       .json(
//         new ApiResponse(200, { transcript, raw: response }, "Transcription successful")
//       );
//   } catch (err) {
//     console.error("Deepgram error:", err);
//     throw new APIError(500, "Failed to transcribe from URL");
//   }
// });


// // // src/utils/Deepgram.utils.js
// // import { Deepgram } from "@deepgram/sdk";
// // import dotenv from "dotenv";
// // dotenv.config();

// // const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);

// // /**
// //  * Transcribe audio directly from a public URL (including YouTube).
// //  * Deepgram handles downloading & decoding internally.
// //  */
// // export async function transcribeFromUrl(videoUrl, options = {}) {
// //   if (!videoUrl) throw new Error("videoUrl is required");
// //   if (!process.env.DEEPGRAM_API_KEY) throw new Error("Missing DEEPGRAM_API_KEY");

// //   const {
// //     punctuate = true,
// //     diarize = false,
// //     language = "en",
// //     model = "general",
// //     tier = "nova", // faster & more accurate
// //   } = options;

// //   const response = await deepgram.transcription.preRecorded(
// //     { url: videoUrl },
// //     { punctuate, diarize, language, model, tier }
// //   );

// //   return response;
// // }
