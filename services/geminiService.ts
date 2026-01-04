
// FIX: Add DOM library reference to resolve 'Image', 'document', and 'FileReader' type errors.
/// <reference lib="dom" />

import { GoogleGenAI, Chat, Part } from "@google/genai";
import { AspectRatio, Quality } from "../types";

// New helper function to convert a File object to a Gemini API Part
const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedData = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
  });
  return {
      inlineData: {
          data: base64EncodedData,
          mimeType: file.type,
      },
  };
};

// New helper function to add a watermark to an image using canvas
const addWatermarkToImage = (base64Url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Prepare watermark text
      const watermarkText = 'YKJ-Ai';
      const margin = 20;
      // Dynamically calculate font size based on image dimensions
      const fontSize = Math.max(18, Math.min(img.width, img.height) / 40);
      
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; // Semi-transparent white
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      
      // Add a subtle shadow for better visibility across different backgrounds
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 5;

      // Draw the watermark in the bottom-right corner
      ctx.fillText(watermarkText, canvas.width - margin, canvas.height - margin);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      reject(new Error('Failed to load image for watermarking'));
    };
    img.src = base64Url;
  });
};

// FIX: Initializing GoogleGenAI inside each function call to use the most recent API key per guidelines
export const generateVideo = async (prompt: string, imageFile: File | undefined, aspectRatio: AspectRatio, quality: Quality): Promise<string> => {
    // Create ai client locally within function to follow API key usage guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let image;
    if (imageFile) {
        const base64EncodedData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(imageFile);
        });
        image = {
            imageBytes: base64EncodedData,
            mimeType: imageFile.type,
        };
    }
    
    // Using recommended model for high-quality video generation
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        image,
        config: {
            numberOfVideos: 1,
            aspectRatio: aspectRatio,
            resolution: quality === 'HD' ? '1080p' : '720p',
        }
    });

    // Poll for the result, as video generation is asynchronous
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds between checks
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation failed: No download link found.");
    }

    // Append API key when fetching from the download link per guidelines
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio, quality: Quality): Promise<string[]> => {
    // Initialize GoogleGenAI locally within function
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-2.5-flash-image which supports generating content including images
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
          },
        },
    });

    if (!response.candidates?.[0]?.content?.parts) {
        throw new Error("Image generation failed: No content parts returned from the model.");
    }
    
    const imageUrls: string[] = [];
    // Iterate through all parts to find the image part per guidelines
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
            imageUrls.push(await addWatermarkToImage(imageUrl));
        }
    }

    if (imageUrls.length === 0) {
        throw new Error("Image generation failed: The model returned text but no image data.");
    }

    return imageUrls;
};

export const editImage = async (prompt: string, imageFile: File): Promise<string> => {
    // Initialize GoogleGenAI locally within function
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
    });

    // Find the image part in response candidates
    const imageOutputPart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (!imageOutputPart?.inlineData) {
        // Use .text property to extract textual response if image generation failed
        const textResponse = response.text?.trim();
        if (textResponse) {
             throw new Error(`Image editing failed: ${textResponse}`);
        }
        throw new Error("Image editing failed: The model did not return an edited image.");
    }

    const base64ImageBytes: string = imageOutputPart.inlineData.data;
    const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
    
    // Add watermark before returning
    const watermarkedImageUrl = await addWatermarkToImage(imageUrl);
    return watermarkedImageUrl;
};

export const editVideo = async (prompt: string, videoFile: File): Promise<string> => {
    // Placeholder for future capabilities
    await new Promise(resolve => setTimeout(resolve, 1000));
    throw new Error("Video editing is currently not supported. This feature is a placeholder for future model capabilities.");
};

const CHAT_SYSTEM_INSTRUCTION = "You are AI-CI, an expert creative assistant. Your goal is to help users brainstorm and refine ideas for video and photo content. Provide creative, inspiring, and actionable suggestions.";

export const startChatSession = (): Chat => {
    // Initialize GoogleGenAI locally within function
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction: CHAT_SYSTEM_INSTRUCTION,
        },
    });
    return chat;
};

// FIX: sendMessageStream accepts message parameter as string or Part[]
export const sendMessageToChatStream = async (chat: Chat, message: string, file?: File) => {
    if (file) {
        const imagePart = await fileToGenerativePart(file);
        const textPart = { text: message };
        // Construct message as an array of parts if an image is attached
        return chat.sendMessageStream({ message: [textPart, imagePart] });
    }
    return chat.sendMessageStream({ message });
};
