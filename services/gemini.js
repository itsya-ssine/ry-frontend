import { GoogleGenAI } from "@google/genai";

export const campusChat = async (message, history, clubs = [], activities = []) => {
  const apiKey = import.meta.env.CHATBOT_API;

  if (!apiKey) {
    return "Bn8";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const clubsContext = clubs.map(c => `- ${c.name} (${c.category}): ${c.description}`).join('\n');
    const activitiesContext = activities.map(a => `- ${a.title} on ${a.date} at ${a.location}: ${a.description}`).join('\n');

    const systemInstruction = `You are the RY-SYSTEM Assistant. You help students find clubs and activities.
    Current Clubs:
    ${clubsContext}
    
    Current Activities:
    ${activitiesContext}
    
    Be friendly, helpful, and concise. If you don't know the answer, suggest they contact the campus office.`;

    const contents = [
      ...history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting to the campus brain right now. Please try again later!";
  }
};
