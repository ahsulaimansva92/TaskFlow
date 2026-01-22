
import { GoogleGenAI, Type } from "@google/genai";

// Updated initialization to strictly follow standard Gemini API guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSubtasksForTask = async (taskName: string, categoryName: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 3 to 5 clear, actionable subtasks for the following task: "${taskName}" in the category "${categoryName}". Provide only the subtask names as a simple list.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["subtasks"]
        }
      }
    });

    const data = JSON.parse(response.text || '{"subtasks":[]}');
    return data.subtasks || [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};
