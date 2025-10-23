import { GoogleGenAI, Type, Part, Content } from "@google/genai";
import type { RecoveryPlan, ChatMessage, DailyLog } from '../types';

const recoveryPlanSchema = {
    type: Type.OBJECT,
    properties: {
        injury: { type: Type.STRING, description: 'The specific injury identified from the user description.' },
        summary: { type: Type.STRING, description: 'A brief summary of the recovery approach, written in an encouraging tone.' },
        disclaimer: { type: Type.STRING, description: 'A mandatory disclaimer advising consultation with a healthcare professional before starting any new exercise program.' },
        estimated_recovery_time: { type: Type.STRING, description: "A general estimated recovery time for the injury (e.g., '2-4 weeks', '6-8 weeks, depending on severity')." },
        otc_suggestions: {
            type: Type.ARRAY,
            description: "An optional list of general, non-prescriptive, over-the-counter management suggestions for pain or inflammation (e.g., 'NSAIDs like ibuprofen for pain'). Each suggestion must include a recommendation to consult a healthcare professional or pharmacist. Only include this for very common, minor injuries.",
            items: { type: Type.STRING }
        },
        phases: {
            type: Type.ARRAY,
            description: 'The different phases of the recovery plan.',
            items: {
                type: Type.OBJECT,
                properties: {
                    phase_name: { type: Type.STRING, description: 'Name of the recovery phase (e.g., "Phase 1: Acute - Rest & Protection").' },
                    duration: { type: Type.STRING, description: 'Estimated duration of this phase (e.g., "First 72 hours", "Week 1-2").' },
                    goals: {
                        type: Type.ARRAY,
                        description: 'The primary goals for this phase.',
                        items: { type: Type.STRING }
                    },
                    exercises: {
                        type: Type.ARRAY,
                        description: 'A list of recommended exercises or activities for this phase. If no specific exercise is needed, it can be an activity like "Rest".',
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                description: { type: Type.STRING, description: 'Detailed instructions on how to perform the exercise safely.' },
                                sets: { type: Type.STRING, description: 'Number of sets (e.g., "3 sets", "N/A").' },
                                reps: { type: Type.STRING, description: 'Number of repetitions (e.g., "10-15 reps", "N/A").' },
                                frequency: { type: Type.STRING, description: 'How often to perform the exercise (e.g., "Daily", "3 times a week").' }
                            },
                            required: ['name', 'description', 'sets', 'reps', 'frequency']
                        }
                    }
                },
                required: ['phase_name', 'duration', 'goals', 'exercises']
            }
        }
    },
    required: ['injury', 'summary', 'disclaimer', 'estimated_recovery_time', 'phases']
};

const CONFIGURATION_ERROR_MESSAGE = `The AI service is not configured correctly. This is a deployment issue.

**Final Fix for Manual Uploads:**
1. In your project folder, find or create a file named exactly \`.env.local\`.
2. Add this one line to the file, pasting your secret key: \`VITE_API_KEY=YOUR_SECRET_KEY_HERE\`
3. Open a terminal in your project folder and run the command: \`npm run build\`
4. A new folder named \`dist\` will be created. **This is the folder you must drag and drop into Netlify.**`;


// Centralized AI client creation and API key check. Returns null if key is not found.
const getAiClient = (): GoogleGenAI | null => {
    // For deployment on services like Netlify, environment variables often need a VITE_ prefix
    // to be exposed to the client-side code for security reasons. We check for that first.
    const API_KEY = process.env.VITE_API_KEY || process.env.API_KEY;
    if (!API_KEY) {
        console.error("VITE_API_KEY or API_KEY environment variable not set. Please configure it in your deployment environment.");
        return null;
    }
    return new GoogleGenAI({ apiKey: API_KEY });
};


export const generateRecoveryPlan = async (description: string, images: { data: string; mimeType: string }[] | null): Promise<RecoveryPlan> => {
    const ai = getAiClient();
    if (!ai) {
        throw new Error(CONFIGURATION_ERROR_MESSAGE);
    }

    try {
        const prompt = `Analyze the following user-described sports injury and generate a detailed, phased recovery plan. The injury is: "${description}"`;

        const textPart: Part = { text: prompt };
        const imageParts: Part[] = (images || []).map(image => ({
            inlineData: {
                data: image.data,
                mimeType: image.mimeType,
            },
        }));

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [...imageParts, textPart] },
            config: {
                systemInstruction: "You are an expert AI sports physiotherapist. Your goal is to create safe, effective, and easy-to-understand recovery plans. You must always include a strong disclaimer to consult a real medical professional. The plan must be structured in JSON format. When appropriate for very common, minor injuries like a simple sprain, you can suggest general categories of over-the-counter pain management (e.g., 'NSAIDs like ibuprofen for pain and inflammation'). You MUST always follow this with a direct instruction to consult a pharmacist or doctor. Do not list brand names. If the injury seems complex or severe, or if you are in any doubt, do not provide any medication suggestions.",
                responseMimeType: "application/json",
                responseSchema: recoveryPlanSchema,
            },
        });

        const jsonText = response.text.trim();
        // The API sometimes returns the JSON wrapped in markdown backticks, so we clean it.
        const cleanedJsonText = jsonText.replace(/^```json\s*|```$/g, '');
        const plan = JSON.parse(cleanedJsonText);
        
        return plan as RecoveryPlan;

    } catch (error) {
        console.error("Error during AI model call in generateRecoveryPlan:", error);
        throw new Error("Failed to generate recovery plan. The AI model may be temporarily unavailable.");
    }
};

export const generateChatStream = (history: ChatMessage[]) => {
    const ai = getAiClient();
    if (!ai) {
        throw new Error(CONFIGURATION_ERROR_MESSAGE);
    }
    
    // The Gemini API expects role and parts. The user and model roles are aligned.
    const contents: Content[] = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    // The calling function (in AIAssistantPage) will handle errors from the stream.
    return ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
            systemInstruction: "You are an AI Recovery Assistant. Your primary goal is to help users understand their potential sports injury byasking targeted questions.\n- Start by asking the user to describe their injury.\n- After their initial description, ask a series of clarifying questions to gather more details. Focus on:\n  - The exact location of the pain.\n  - The type of pain (e.g., sharp, dull, aching).\n  - How the injury occurred.\n  - The presence of swelling, bruising, or inability to bear weight.\n  - What movements make it better or worse.\n- Once you have gathered sufficient information, provide a summary of the possible injury type and general information about it.\n- Maintain a professional and clinical, yet supportive, tone.\n- IMPORTANT: You are not a medical professional. Frame your answers as general information based on the symptoms provided. DO NOT provide a diagnosis. The user has already been shown a disclaimer, so do not repeat it."
        },
    });
};


export const generateTrackingFeedback = async (log: DailyLog): Promise<string> => {
    const ai = getAiClient();
    if (!ai) {
        return "Could not get AI feedback. The AI service is not configured correctly.";
    }

    const prompt = `
        You are an AI recovery specialist analyzing a user's daily sports injury recovery log. Your tone should be supportive and informative. **You must not provide medical advice or a diagnosis.** Your feedback should help the user understand their progress and make small adjustments.

        Analyze the following daily log data and provide a response that includes:
        1. A brief, one-sentence summary of the day's log.
        2. A bulleted list of 2-3 specific, actionable suggestions for improvement based directly on the provided data.
        
        Connect your suggestions to general recovery principles. For example:
        - If pain level is high (7+), or feeling is 'Worse', suggest they might be overdoing activity and should consider focusing on gentle range of motion or rest. Emphasize listening to their body.
        - If sleep quality is 'Poor' or 'Fair', explain that sleep is critical for tissue repair and suggest creating a relaxing bedtime routine.
        - If hydration is 'Low', explain its importance for nutrient transport and inflammation management, and suggest carrying a water bottle.
        - If the user notes a specific activity caused pain, acknowledge it and suggest modifying or avoiding that activity temporarily.

        Use markdown for bullet points (e.g., "- Suggestion 1"). Keep the total response concise, under 80 words.

        Log data:
        ${JSON.stringify(log)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                 systemInstruction: "You are an AI recovery specialist. Your goal is to provide supportive, actionable feedback based on a user's daily injury log. Focus on general wellness principles that aid recovery (sleep, hydration, pain management). Do not diagnose, prescribe, or give medical advice. Structure your response with a summary and bullet points."
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error during AI model call in generateTrackingFeedback:", error);
        return "Great job logging your progress today! AI feedback is temporarily unavailable.";
    }
};