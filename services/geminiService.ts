import { GoogleGenAI, Type, Modality, Content } from "@google/genai";
import { PsychologicalApproach } from '../types';

// Create a single, lazily-initialized client instance.
let geminiClient: GoogleGenAI | null = null;

// Helper function to get the AI client. It initializes the client on the first call
// and returns the cached instance on subsequent calls.
const getAiClient = (): GoogleGenAI | null => {
    // If the instance already exists, return it.
    if (geminiClient) {
        return geminiClient;
    }

    // If the API key is not available, log an error and return null.
    // The calling function will handle this and show an error to the user.
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set. Cannot initialize GoogleGenAI client.");
        return null;
    }

    // Try to create and cache the instance.
    try {
        geminiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
        return geminiClient;
    } catch (error) {
        console.error("Error initializing GoogleGenAI:", error);
        return null;
    }
};


const responseSchema = {
    type: Type.OBJECT,
    properties: {
        response: {
            type: Type.STRING,
            description: "The psychologist's response to the user.",
        },
        approach: {
            type: Type.STRING,
            enum: Object.values(PsychologicalApproach),
            description: "The psychological approach used in the response.",
        },
    },
    required: ["response", "approach"],
};

const chatSystemInstruction = `You are an electronic psychologist from Russia. Your goal is to provide supportive and empathetic conversation.
1.  Always respond in Russian.
2.  Analyze the user's message and provide a thoughtful, helpful response based on established psychological principles.
3.  After formulating your response, classify it into one of the following categories: 'CBT' (Когнитивно-поведенческая терапия), 'Gestalt' (Гештальт-терапия), 'Logotherapy' (Логотерапия), 'Systemic' (Системная семейная терапия), or 'Integrative' (Интегративный подход) if it combines elements or is a general supportive message.
4.  You MUST return your answer in a valid JSON format that adheres to the provided schema. The JSON should contain two keys: "response" (your text for the user) and "approach" (the classification string).
Example user input: "I feel so overwhelmed with work."
Example JSON output:
{
  "response": "Это звучит очень тяжело. Похоже, на вас лежит большая нагрузка. Давайте попробуем разобраться, какие именно мысли вызывают у вас чувство перегруженности. Иногда осознание конкретных мыслей помогает снизить их власть над нами.",
  "approach": "CBT"
}`;

const summarySystemInstruction = `You are a helpful assistant. Analyze the following conversation between a user and an electronic psychologist. Based on the entire dialogue, generate a concise, actionable list of recommendations for the user.
- The recommendations should be in Russian.
- Present these recommendations as a numbered list (e.g., 1., 2., 3.).
- The tone should be supportive, encouraging, and professional.
- Address the user directly ("Вам рекомендуется...", "Попробуйте...").
- Respond ONLY with the numbered list of recommendations. Do not add any introductory or concluding text.`;

export async function getChatResponse(history: Content[], newMessage: string): Promise<{ response: string; approach: PsychologicalApproach }> {
    const ai = getAiClient();
    if (!ai) {
        return {
            response: "Ошибка конфигурации: Ключ API не найден. Убедитесь, что переменная окружения API_KEY установлена правильно.",
            approach: PsychologicalApproach.Unknown
        };
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [...history, { role: 'user', parts: [{ text: newMessage }] }],
            config: {
                systemInstruction: chatSystemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.8,
                topP: 0.9,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        const approach = Object.values(PsychologicalApproach).includes(parsedResponse.approach)
            ? parsedResponse.approach
            : PsychologicalApproach.Integrative;

        return {
            response: parsedResponse.response,
            approach: approach
        };

    } catch (error) {
        console.error("Error in getChatResponse:", error);
        // Fallback response
        return {
            response: "К сожалению, у меня возникла внутренняя ошибка. Давайте попробуем поговорить об этом позже.",
            approach: PsychologicalApproach.Unknown
        };
    }
}

export async function getSpeech(text: string): Promise<string | null> {
    const ai = getAiClient();
    if (!ai) return null;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // A voice that might support Russian well
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
}

export async function getSummary(history: Content[]): Promise<string> {
    const ai = getAiClient();
    if (!ai) {
        return "Не удалось сформировать рекомендации: Ключ API не настроен.";
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: history,
            config: {
                systemInstruction: summarySystemInstruction,
                temperature: 0.7,
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error in getSummary:", error);
        return "Не удалось сформировать рекомендации. Пожалуйста, попробуйте завершить диалог еще раз немного позже.";
    }
}