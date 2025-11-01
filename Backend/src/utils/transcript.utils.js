import { createClient } from '@deepgram/sdk';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { APIError } from './Apierror.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Deepgram with v3 SDK
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

export const getVideoTranscript = async (videoUrl) => {
    try {
        // Validate YouTube URL
        if (!isValidYoutubeUrl(videoUrl)) {
            throw new APIError(400, "Invalid YouTube URL");
        }

        // Create temp directory if it doesn't exist
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const audioPath = path.join(tempDir, `audio_${timestamp}.mp3`);

        // Download audio using yt-dlp
        const downloadCommand = `yt-dlp -x --audio-format mp3 -o "${audioPath}" ${videoUrl}`;
        await execAsync(downloadCommand);

        // Read the audio file
        const audioFile = {
            buffer: fs.readFileSync(audioPath),
            mimetype: 'audio/mp3',
        };

        // Get transcript from Deepgram using v3 SDK
        const transcriptionResponse = await deepgram.transcribe({
            buffer: audioFile.buffer,
            mimetype: 'audio/mp3',
            options: {
                smart_format: true,
                punctuate: true,
                utterances: true,
                paragraphs: true
            }
        });

        if (transcriptionResponse.error) {
            throw new Error(transcriptionResponse.error.message);
        }

        // Clean up temp file
        fs.unlinkSync(audioPath);

        const transcription = transcriptionResponse.result.results.channels[0].alternatives[0];
        
        return {
            text: transcription.transcript,
            confidence: transcription.confidence,
            words: transcription.words,
            paragraphs: transcription.paragraphs || []
        };

    } catch (error) {
        console.error('Transcription error:', error);
        throw new APIError(500, "Failed to get video transcript: " + error.message);
    }
};

// Validate YouTube URL
const isValidYoutubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url);
};