import { GoogleGenAI, Type } from "@google/genai";
import { AICommandResponse, ToolAction } from "../types";

// Initialize Gemini Client
// NOTE: process.env.API_KEY is injected by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-2.5-flash";

const systemPrompt = `
You are "StockMaster AI", an expert Inventory Management Agent for a warehouse.
Your job is to translate natural language commands into structured JSON tool calls.

Supported Operations (Tools):
1. ADD_STOCK (Receipts): Incoming goods from vendors.
   - Triggers when user says "Received", "Bought", "Arrived".
   - Params: name, qty, location, category (optional).

2. DELIVER_STOCK (Deliveries): Outgoing goods to customers.
   - Triggers when user says "Deliver", "Ship", "Send", "Sold".
   - Params: name, qty.

3. MOVE_STOCK (Internal Transfers): Moving stock between internal locations.
   - Triggers when user says "Move", "Transfer", "Put".
   - Params: name, qty (optional), to_location.

4. ADJUST_STOCK (Inventory Adjustments): Corrections based on physical counts.
   - Triggers when user says "Correct", "Set stock to", "Audit says".
   - Params: name, true_qty.

5. REPORT: General dashboard or data queries.
   - Triggers when user asks "Show me...", "What is...", "List...".

INSTRUCTIONS:
- Return ONLY the JSON object matching the schema.
- Default category to "General" if unknown for new products.
- If the command is unclear, return tool: "UNKNOWN".
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