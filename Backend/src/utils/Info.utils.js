// src/utils/Info.utils.js
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import FormData from "form-data";
import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();
ffmpeg.setFfmpegPath(ffmpegPath);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

// Ensure uploads dir exists
function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ✅ Check if yt-dlp is available
async function checkYtDlpInstalled() {
  return new Promise((resolve, reject) => {
    execFile("yt-dlp", ["--version"], (error, stdout) => {
      if (error) {
        reject(
          new Error(
            "❌ 'yt-dlp' not found. Please install it:\n\n" +
              "1️⃣ Run:  python -m pip install -U yt-dlp\n" +
              "2️⃣ Add it to PATH (e.g. C:\\Users\\pc\\AppData\\Roaming\\Python\\Python313\\Scripts)\n" +
              "3️⃣ Restart your terminal or VS Code"
          )
        );
      } else {
        console.log(`✅ yt-dlp version detected: ${stdout.trim()}`);
        resolve(true);
      }
    });
  });
}

/**
 * Download audio from YouTube using yt-dlp and convert to WAV (mono, 16k).
 * Returns absolute file path.
 */
export async function downloadYoutubeToWav(youtubeUrl) {
  await checkYtDlpInstalled();

  ensureUploadsDir();
  const audioFile = path.join(UPLOADS_DIR, `${Date.now()}-audio.m4a`);
  const wavFile = path.join(UPLOADS_DIR, `${Date.now()}-audio.wav`);

  console.log("🎥 Downloading audio from YouTube...");

  await new Promise((resolve, reject) => {
    execFile("yt-dlp", [
      "-f",
      "bestaudio",
      "--extract-audio",
      "--audio-format",
      "m4a",
      "-o",
      audioFile,
      youtubeUrl,
    ], (error) => {
      if (error) reject(new Error("Failed to download audio from YouTube"));
      else resolve();
    });
  });

  console.log("🎧 Converting audio to WAV...");

  await new Promise((resolve, reject) => {
    ffmpeg(audioFile)
      .audioChannels(1)
      .audioFrequency(16000)
      .format("wav")
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .save(wavFile);
  });

  // cleanup m4a after conversion
  await fsPromises.unlink(audioFile).catch(() => {});
  return wavFile;
}

/**
 * Send a local audio file to Deepgram and return the parsed response object.
 */
export async function transcribeFileWithDeepgram(filePath, options = {}) {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) throw new Error("Missing DEEPGRAM_API_KEY in env");

  const {
    punctuate = true,
    diarize = false,
    language = undefined,
    model = undefined,
    tier = undefined,
  } = options;

  const query = new URLSearchParams();
  query.set("punctuate", String(punctuate));
  if (diarize) query.set("diarize", "true");
  if (language) query.set("language", language);
  if (model) query.set("model", model);
  if (tier) query.set("tier", tier);

  const form = new FormData();
  form.append("file", fs.createReadStream(filePath), { filename: path.basename(filePath) });

  const headers = {
    Authorization: `Token ${apiKey}`,
    ...form.getHeaders(),
  };

  const url = `https://api.deepgram.com/v1/listen?${query.toString()}`;

  console.log("🚀 Sending file to Deepgram...");

  const resp = await axios.post(url, form, {
    headers,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 180000,
  });

  return resp.data;
}

/**
 * Convenience: download from YouTube, transcribe, cleanup temporary file.
 */
export async function transcribeYoutube(youtubeUrl, options = {}) {
  const tmpFile = await downloadYoutubeToWav(youtubeUrl);
  try {
    const result = await transcribeFileWithDeepgram(tmpFile, options);
    return result;
  } finally {
    await fsPromises.unlink(tmpFile).catch(() => {});
  }
}


// // src/utils/Info.utils.js
// import fs from "fs";
// import fsPromises from "fs/promises";
// import path from "path";

// //import ytdl from "ytdl-core";

// //import ytdl from "@distube/ytdl-core";
// import ffmpeg from "fluent-ffmpeg";
// import ffmpegPath from "ffmpeg-static";
// import FormData from "form-data";
// import axios from "axios";
// import dotenv from "dotenv";

// import { exec } from "child_process";
// import { promisify } from "util";
// const execAsync = promisify(exec);


// dotenv.config();

// const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
// let _ffmpegConfigured = false;

// function ensureFfmpegConfigured() {
//   if (_ffmpegConfigured) return;
//   try {
//     if (ffmpegPath) {
//       ffmpeg.setFfmpegPath(ffmpegPath);
//     }
//     _ffmpegConfigured = true;
//   } catch (err) {
//     console.warn("Warning: failed to set ffmpeg path via ffmpeg-static:", err?.message ?? err);
//     _ffmpegConfigured = false;
//   }
// }

// function ensureUploadsDir() {
//   if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
// }

// /**
//  * Download audio from YouTube and convert to WAV (mono, 16k).
//  * More robust: checks playability, attaches stream error handlers, logs ffmpeg stderr.
//  */
// export async function downloadYoutubeToWav(youtubeUrl) {
//   if (!youtubeUrl || !youtubeUrl.startsWith("http")) {
//     throw new Error("Invalid YouTube URL");
//   }

//   ensureUploadsDir();
//   const outFile = path.join(UPLOADS_DIR, `${Date.now()}-audio.wav`);

//   // download and convert with yt-dlp + ffmpeg
//   const command = `yt-dlp -f bestaudio -x --audio-format wav --audio-quality 0 -o "${outFile}" "${youtubeUrl}"`;
//   console.log("Running:", command);

//   try {
//     await execAsync(command);
//   } catch (err) {
//     console.error("yt-dlp download error:", err);
//     throw new Error("Failed to download audio from YouTube");
//   }

//   return outFile;
// }

// // export async function downloadYoutubeToWav(youtubeUrl, { timeoutMs = 5 * 60 * 1000 } = {}) {
// //   if (!youtubeUrl || typeof youtubeUrl !== "string" || !ytdl.validateURL(youtubeUrl)) {
// //     throw new Error("Invalid YouTube URL");
// //   }

// //   // Check video info first — catches private/age-restricted/unplayable videos early
// //   let info;
// //   try {
// //     info = await ytdl.getInfo(youtubeUrl);
// //   } catch (err) {
// //     throw new Error(`Failed to get YouTube video info: ${err?.message ?? err}`);
// //   }

// //   // basic playability check (ytdl returns videoDetails; playability may be in playabilityStatus)
// //   if (info?.playabilityStatus && info.playabilityStatus.status && info.playabilityStatus.status !== "OK") {
// //     const reason = info.playabilityStatus?.reason ?? info.playabilityStatus?.status;
// //     throw new Error(`YouTube video not playable: ${String(reason)}`);
// //   }

// //   ensureFfmpegConfigured();
// //   ensureUploadsDir();

// //   const outFile = path.join(UPLOADS_DIR, `${Date.now()}-audio.wav`);

// //   await new Promise((resolve, reject) => {
// //     const streamOptions = { quality: "highestaudio", filter: "audioonly", highWaterMark: 1 << 25 };
// //     const audioStream = ytdl(youtubeUrl, streamOptions);

// //     // Attach stream error handler (very important)
// //     audioStream.on("error", (err) => {
// //       // include readable stack
// //       const e = new Error(`ytdl stream error: ${err?.message ?? err}`);
// //       e.code = "YTDL_STREAM_ERROR";
// //       reject(e);
// //     });

// //     // Setup ffmpeg
// //     let finished = false;
// //     const timer = setTimeout(() => {
// //       if (!finished) {
// //         finished = true;
// //         const err = new Error("Timeout while downloading/converting YouTube audio");
// //         err.code = "YT_DOWNLOAD_TIMEOUT";
// //         reject(err);
// //       }
// //     }, timeoutMs);

// //     try {
// //       const cmd = ffmpeg(audioStream)
// //         .audioChannels(1)
// //         .audioFrequency(16000)
// //         .format("wav")
// //         .on("end", () => {
// //           if (!finished) {
// //             finished = true;
// //             clearTimeout(timer);
// //             resolve();
// //           }
// //         })
// //         .on("error", (err) => {
// //           if (!finished) {
// //             finished = true;
// //             clearTimeout(timer);
// //             // Enhance message with ffmpeg stderr if available
// //             const enhanced = new Error(`ffmpeg error: ${err?.message ?? err}`);
// //             enhanced.code = "FFMPEG_ERROR";
// //             reject(enhanced);
// //           }
// //         });

// //       // Log ffmpeg stderr lines to help debug stream parsing errors
// //       cmd.on("stderr", (line) => {
// //         // keep logs concise; you can remove or expand as needed
// //         // eslint-disable-next-line no-console
// //         console.debug("ffmpeg stderr:", line);
// //       });

// //       cmd.save(outFile);
// //     } catch (err) {
// //       if (!finished) {
// //         finished = true;
// //         clearTimeout(timer);
// //         reject(new Error(`Failed to start ffmpeg pipeline: ${err?.message ?? err}`));
// //       }
// //     }
// //   });

// //   // verify output
// //   if (!fs.existsSync(outFile)) {
// //     throw new Error("Failed to create WAV file from YouTube audio");
// //   }

// //   return outFile;
// // }

// /**
//  * Send a local audio file to Deepgram and return the parsed response object.
//  */
// export async function transcribeFileWithDeepgram(filePath, options = {}) {
//   const apiKey = process.env.DEEPGRAM_API_KEY;
//   if (!apiKey) {
//     throw new Error("Missing DEEPGRAM_API_KEY in environment");
//   }

//   if (!fs.existsSync(filePath)) {
//     throw new Error("Audio file not found: " + filePath);
//   }

//   const {
//     punctuate = true,
//     diarize = false,
//     language = undefined,
//     model = undefined,
//     tier = undefined,
//     timeoutMs = 180000,
//   } = options;

//   const query = new URLSearchParams();
//   query.set("punctuate", String(punctuate));
//   if (diarize) query.set("diarize", "true");
//   if (language) query.set("language", language);
//   if (model) query.set("model", model);
//   if (tier) query.set("tier", tier);

//   const form = new FormData();
//   form.append("file", fs.createReadStream(filePath), { filename: path.basename(filePath) });

//   const headers = {
//     Authorization: `Token ${apiKey}`,
//     ...form.getHeaders(),
//   };

//   const url = `https://api.deepgram.com/v1/listen?${query.toString()}`;

//   const resp = await axios.post(url, form, {
//     headers,
//     maxContentLength: Infinity,
//     maxBodyLength: Infinity,
//     timeout: timeoutMs,
//   });

//   return resp.data;
// }

// /**
//  * Convenience: download from YouTube, transcribe, cleanup temporary file.
//  */
// export async function transcribeYoutube(youtubeUrl, options = {}) {
//   const tmpFile = await downloadYoutubeToWav(youtubeUrl, options);
//   try {
//     const result = await transcribeFileWithDeepgram(tmpFile, options);
//     return result;
//   } finally {
//     await fsPromises.unlink(tmpFile).catch((err) => {
//       console.warn("Warning: failed to delete temp file:", tmpFile, err?.message ?? err);
//     });
//   }
// }

// // // src/utils/Info.utils.js
// // import fs from "fs";
// // import fsPromises from "fs/promises";
// // import path from "path";
// // import ytdl from "ytdl-core";
// // import ffmpeg from "fluent-ffmpeg";
// // import ffmpegPath from "ffmpeg-static";
// // import FormData from "form-data";
// // import axios from "axios";
// // import dotenv from "dotenv";

// // dotenv.config();

// // const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
// // let _ffmpegConfigured = false;

// // /**
// //  * Configure ffmpeg path lazily and safely. Does NOT throw on failure;
// //  * instead logs a warning and allows the module to load. Actual ffmpeg
// //  * errors will surface when you call downloadYoutubeToWav.
// //  */
// // function ensureFfmpegConfigured() {
// //   if (_ffmpegConfigured) return;
// //   try {
// //     if (ffmpegPath) {
// //       ffmpeg.setFfmpegPath(ffmpegPath);
// //     }
// //     _ffmpegConfigured = true;
// //   } catch (err) {
// //     // don't throw on import-time, just warn — runtime calls will see ffmpeg errors.
// //     // Use server logs to notice this.
// //     // eslint-disable-next-line no-console
// //     console.warn("Warning: failed to set ffmpeg path via ffmpeg-static:", err?.message ?? err);
// //     _ffmpegConfigured = false;
// //   }
// // }

// // /**
// //  * Ensure uploads dir exists
// //  */
// // function ensureUploadsDir() {
// //   if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
// // }

// // /**
// //  * Download audio from YouTube and convert to WAV (mono, 16k).
// //  * Returns absolute file path.
// //  */
// // export async function downloadYoutubeToWav(youtubeUrl, { timeoutMs = 5 * 60 * 1000 } = {}) {
// //   if (!youtubeUrl || typeof youtubeUrl !== "string" || !ytdl.validateURL(youtubeUrl)) {
// //     throw new Error("Invalid YouTube URL");
// //   }

// //   ensureFfmpegConfigured();
// //   ensureUploadsDir();

// //   const outFile = path.join(UPLOADS_DIR, `${Date.now()}-audio.wav`);
// //   // Wrap the ffmpeg pipeline in a Promise with a timeout guard
// //   await new Promise((resolve, reject) => {
// //     const audioStream = ytdl(youtubeUrl, { quality: "highestaudio", filter: "audioonly" });

// //     let finished = false;
// //     const timer = setTimeout(() => {
// //       if (!finished) {
// //         finished = true;
// //         const err = new Error("Timeout while downloading/converting YouTube audio");
// //         err.code = "YT_DOWNLOAD_TIMEOUT";
// //         reject(err);
// //       }
// //     }, timeoutMs);

// //     try {
// //       ffmpeg(audioStream)
// //         .audioChannels(1)
// //         .audioFrequency(16000)
// //         .format("wav")
// //         .on("end", () => {
// //           if (!finished) {
// //             finished = true;
// //             clearTimeout(timer);
// //             resolve();
// //           }
// //         })
// //         .on("error", (err) => {
// //           if (!finished) {
// //             finished = true;
// //             clearTimeout(timer);
// //             reject(err);
// //           }
// //         })
// //         .save(outFile);
// //     } catch (err) {
// //       if (!finished) {
// //         finished = true;
// //         clearTimeout(timer);
// //         reject(err);
// //       }
// //     }
// //   });

// //   // Verify file exists
// //   if (!fs.existsSync(outFile)) {
// //     throw new Error("Failed to create WAV file from YouTube audio");
// //   }

// //   return outFile;
// // }

// // /**
// //  * Send a local audio file to Deepgram and return the parsed response object.
// //  * options: { punctuate=true, diarize=false, language, model, tier }
// //  */
// // export async function transcribeFileWithDeepgram(filePath, options = {}) {
// //   const apiKey = process.env.DEEPGRAM_API_KEY;
// //   if (!apiKey) {
// //     // do not throw on import — throw here when function is used
// //     throw new Error("Missing DEEPGRAM_API_KEY in environment");
// //   }

// //   if (!fs.existsSync(filePath)) {
// //     throw new Error("Audio file not found: " + filePath);
// //   }

// //   const {
// //     punctuate = true,
// //     diarize = false,
// //     language = undefined,
// //     model = undefined,
// //     tier = undefined,
// //     timeoutMs = 180000,
// //   } = options;

// //   const query = new URLSearchParams();
// //   query.set("punctuate", String(punctuate));
// //   if (diarize) query.set("diarize", "true");
// //   if (language) query.set("language", language);
// //   if (model) query.set("model", model);
// //   if (tier) query.set("tier", tier);

// //   const form = new FormData();
// //   form.append("file", fs.createReadStream(filePath), { filename: path.basename(filePath) });

// //   const headers = {
// //     Authorization: `Token ${apiKey}`,
// //     ...form.getHeaders(),
// //   };

// //   const url = `https://api.deepgram.com/v1/listen?${query.toString()}`;

// //   const resp = await axios.post(url, form, {
// //     headers,
// //     maxContentLength: Infinity,
// //     maxBodyLength: Infinity,
// //     timeout: timeoutMs,
// //   });

// //   return resp.data;
// // }

// // /**
// //  * Convenience: download from YouTube, transcribe, cleanup temporary file.
// //  * Returns the Deepgram response object.
// //  */
// // export async function transcribeYoutube(youtubeUrl, options = {}) {
// //   // downloadYoutubeToWav will throw meaningful errors if something goes wrong
// //   const tmpFile = await downloadYoutubeToWav(youtubeUrl, options);
// //   try {
// //     const result = await transcribeFileWithDeepgram(tmpFile, options);
// //     return result;
// //   } finally {
// //     // best-effort cleanup; don't let cleanup errors mask the real error
// //     await fsPromises.unlink(tmpFile).catch((err) => {
// //       // eslint-disable-next-line no-console
// //       console.warn("Warning: failed to delete temp file:", tmpFile, err?.message ?? err);
// //     });
// //   }
// // }

// //+__________________________________________________________________________________________________________
// // // src/utils/Info.utils.js
// // import fs from "fs";
// // import fsPromises from "fs/promises";
// // import path from "path";
// // import ytdl from "ytdl-core";
// // import ffmpeg from "fluent-ffmpeg";
// // import ffmpegPath from "ffmpeg-static";
// // import FormData from "form-data";
// // import axios from "axios";
// // import dotenv from "dotenv";

// // // src/utils/Info.utils.js  (temporary STUB for debugging)
// // // export async function transcribeYoutube(youtubeUrl, options = {}) {
// // //   // basic validation only, no external libs
// // //   if (!youtubeUrl || typeof youtubeUrl !== "string") {
// // //     throw new Error("Invalid youtubeUrl");
// // //   }
// // //   // return a fake Deepgram-like response so controllers work
// // //   return {
// // //     results: {
// // //       channels: [{
// // //         alternatives: [{
// // //           transcript: "STUB TRANSCRIPT: This is a placeholder transcript for testing."
// // //         }]
// // //       }]
// // //     }
// // //   };
// // // }




// // dotenv.config();
// // ffmpeg.setFfmpegPath(ffmpegPath);

// // const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

// // /**
// //  * Ensure uploads dir exists
// //  */
// // function ensureUploadsDir() {
// //   if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
// // }

// // /**
// //  * Download audio from YouTube and convert to WAV (mono, 16k).
// //  * Returns absolute file path.
// //  */
// // export async function downloadYoutubeToWav(youtubeUrl) {
// //   if (!ytdl.validateURL(youtubeUrl)) {
// //     throw new Error("Invalid YouTube URL");
// //   }

// //   ensureUploadsDir();
// //   const outFile = path.join(UPLOADS_DIR, `${Date.now()}-audio.wav`);

// //   await new Promise((resolve, reject) => {
// //     const audioStream = ytdl(youtubeUrl, { quality: "highestaudio", filter: "audioonly" });

// //     ffmpeg(audioStream)
// //       .audioChannels(1)
// //       .audioFrequency(16000)
// //       .format("wav")
// //       .on("end", () => resolve())
// //       .on("error", (err) => reject(err))
// //       .save(outFile);
// //   });

// //   return outFile;
// // }

// // /**
// //  * Send a local audio file to Deepgram and return the parsed response object.
// //  * options: { punctuate=true, diarize=false, language, model, tier }
// //  */
// // export async function transcribeFileWithDeepgram(filePath, options = {}) {
// //   const apiKey = process.env.DEEPGRAM_API_KEY;
// //   if (!apiKey) throw new Error("Missing DEEPGRAM_API_KEY in env");

// //   const {
// //     punctuate = true,
// //     diarize = false,
// //     language = undefined,
// //     model = undefined,
// //     tier = undefined,
// //   } = options;

// //   const query = new URLSearchParams();
// //   query.set("punctuate", String(punctuate));
// //   if (diarize) query.set("diarize", "true");
// //   if (language) query.set("language", language);
// //   if (model) query.set("model", model);
// //   if (tier) query.set("tier", tier);

// //   const form = new FormData();
// //   form.append("file", fs.createReadStream(filePath), { filename: path.basename(filePath) });

// //   const headers = {
// //     Authorization: `Token ${apiKey}`,
// //     ...form.getHeaders(),
// //   };

// //   const url = `https://api.deepgram.com/v1/listen?${query.toString()}`;

// //   const resp = await axios.post(url, form, {
// //     headers,
// //     maxContentLength: Infinity,
// //     maxBodyLength: Infinity,
// //     timeout: 180000, // adjust for very long files
// //   });

// //   return resp.data;
// // }

// // /**
// //  * Convenience: download from YouTube, transcribe, cleanup temporary file.
// //  * Returns the Deepgram response object.
// //  */
// // export async function transcribeYoutube(youtubeUrl, options = {}) {
// //   const tmpFile = await downloadYoutubeToWav(youtubeUrl);
// //   try {
// //     const result = await transcribeFileWithDeepgram(tmpFile, options);
// //     return result;
// //   } finally {
// //     await fsPromises.unlink(tmpFile).catch(() => {});
// //   }
// // }
