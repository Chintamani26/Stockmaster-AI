import { GoogleGenAI, Type } from "@google/genai";
import { AICommandResponse, ToolAction } from "../types";

// Initialize Gemini Client
// NOTE: process.env.API_KEY is injected by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-2.5-flash";

const systemPrompt = `
You are a warehouse assistant called "StockMaster AI".
Your job is to translate natural language inventory commands into a structured JSON object.

Available Tools & Schemas:
1. ADD_STOCK: Receiving items.
   - name (string): Product name
   - qty (number): Quantity received
   - location (string): Where it is stored
   - category (string, default "General"): Product category

2. MOVE_STOCK: Moving items between locations.
   - name (string): Product name
   - qty (number): Quantity to move (optional, mostly for logging)
   - to_location (string): New location

3. ADJUST_STOCK: Corrections or stock taking.
   - name (string): Product name
   - true_qty (number): The actual counted quantity

4. REPORT: General questions or "show me" commands.
   - query_type (string): Just return "REPORT" as tool.

INSTRUCTIONS:
- Extract the intent and parameters carefully.
- If the user provides a partial command (e.g., "I bought some apples"), try to infer or map to ADD_STOCK with best guesses, or return tool: "UNKNOWN".
- Always return a valid JSON object matching the schema.
- Do not wrap in markdown code blocks.
`;

export const parseNaturalLanguageCommand = async (userText: string): Promise<AICommandResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tool: { type: Type.STRING, enum: Object.values(ToolAction) },
            name: { type: Type.STRING },
            qty: { type: Type.INTEGER },
            location: { type: Type.STRING },
            to_location: { type: Type.STRING },
            true_qty: { type: Type.INTEGER },
            category: { type: Type.STRING },
            error: { type: Type.STRING }
          },
          required: ["tool"]
        }
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userText }]
        }
      ]
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AICommandResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      tool: ToolAction.UNKNOWN,
      error: "Failed to process command with AI."
    };
  }
};