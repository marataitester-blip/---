import { GoogleGenAI, Type, Modality, Content } from "@google/genai";
import { PsychologicalApproach } from '../types';

const API_KEY_STORAGE_KEY = 'GEMINI_API_KEY';
let genAIClient: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns a singleton instance of the GoogleGenAI client.
 * Implements the user's request to use localStorage for API key persistence
 * to ensure availability across the app session, adapted for the SPA architecture.
 * @returns {GoogleGenAI} The initialized GoogleGenAI client.
 * @throws {Error} If the API_KEY cannot be found.
 */
function getAiClient(): GoogleGenAI {
    if (genAIClient) {
        // Return the existing client if already initialized.
        return genAIClient;
    }

    let apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);

    if (!apiKey) {
        // If key is not in localStorage, try to get it from environment variables.
        // This should happen on the first load.
        apiKey = process.env.API_KEY;

        if (apiKey) {
            // Store the key from the environment into localStorage for persistence.
            localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
            console.log('✅ API KEY has been saved to localStorage');
        }
    } else {
        console.log('✅ API KEY loaded from localStorage');
    }

    if (!apiKey || !apiKey.startsWith('AIza')) {
        console.error('❌ ERROR: API KEY not found or invalid in environment and localStorage. It must start with "AIza".');
        // Clear any invalid key from storage
        localStorage.removeItem(API_KEY_STORAGE_KEY);
        throw new Error("Ошибка конфигурации: Ключ API не найден или некорректен. Убедитесь, что переменная окружения API_KEY установлена правильно.");
    }
    
    console.log('✅ API_KEY initialized:', apiKey.substring(0, 15) + '...');
    genAIClient = new GoogleGenAI({ apiKey });
    return genAIClient;
}


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
    try {
        const ai = getAiClient();
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
        const errorMessage = error instanceof Error 
            ? error.message 
            : "К сожалению, у меня возникла внутренняя ошибка. Давайте попробуем поговорить об этом позже.";
        return {
            response: errorMessage,
            approach: PsychologicalApproach.Unknown
        };
    }
}

export async function getSpeech(text: string): Promise<string | null> {
    try {
        const ai = getAiClient();
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
    try {
        const ai = getAiClient();
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
        if (error instanceof Error && error.message.includes("Ключ API не найден")) {
            return `Не удалось сформировать рекомендации: ${error.message}`;
        }
        return "Не удалось сформировать рекомендации. Пожалуйста, попробуйте завершить диалог еще раз немного позже.";
    }
}