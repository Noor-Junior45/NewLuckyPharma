import { GoogleGenAI, Type, Tool, Modality } from "@google/genai";
import { Product } from "../types";
import { productList } from "../data/products";

// Initialize safely - relies on Vite's define plugin to replace process.env.GEMINI_API_KEY at build time
const getAIClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.warn("API Key is missing. Please set GEMINI_API_KEY in your environment variables.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

// Helper to handle and categorize Gemini API errors
const handleGeminiError = (error: any): string => {
    console.error("Gemini API Error Detail:", error);
    
    // Check if offline
    if (typeof navigator !== "undefined" && !navigator.onLine) {
        return "You appear to be offline. Please check your internet connection and try again.";
    }

    const message = error?.message || String(error);
    const status = error?.status || (error?.response?.status);

    // Categorize common errors
    if (message.includes("API_KEY_INVALID") || status === 403) {
        return "Invalid API Key. Please check your GEMINI_API_KEY environment variable.";
    }
    
    if (message.includes("quota") || message.includes("429") || status === 429) {
        return "API rate limit reached (Quota Exceeded). Please wait a moment before trying again.";
    }

    if (message.includes("not found") || message.includes("404") || status === 404) {
        return "The requested AI model was not found. Please verify the model name or your region's availability.";
    }

    if (message.includes("fetch failed") || message.includes("NetworkError")) {
        return "Network error: Unable to reach the AI server. This might be due to a slow connection or firewall.";
    }

    return `An unexpected AI error occurred: ${message}`;
};

// Response Cache for suggestions and repeated queries
const responseCache = new Map<string, { text: string, products?: Product[], groundingSources?: { title: string; url: string }[] }>();

// Public check for UI status
export const isAIConfigured = (): boolean => {
    return !!process.env.GEMINI_API_KEY;
};

const SYSTEM_INSTRUCTION = `You are a warm, caring, and friendly AI Pharmacist assistant for 'New Lucky Pharma', located in Hanwara, Jharkhand. Your goal is to help users with their health queries in a supportive and reassuring manner.

GUIDELINES:
1. GREETING:
   - If user ask questions then give answer remove greeeting.
   - If the user starts with a simple greeting (e.g., "Hi", "Hello", "How are you?"), reply briefly with a friendly, single-sentence greeting and ask how you can help.
   - For all other queries (i.e., medical questions, product questions), reply directly and immediately to the user's query. Do not add any extra conversational text.
   - Always start with a friendly greeting if it is the very first message.
2. TONE & LANGUAGE:
   - Be empathetic, polite, and respectful. Use emojis (💊, 🌿, 😊, 🙏) to make the conversation warm.
   - Use bold text (**) for key medicine names, headings, and important warnings.
   - **HINGLISH SUPPORT**: If a user selects 'Hinglish' or types in a mix of Hindi and English, you MUST respond in Hinglish. Hinglish is Hindi language written in English script (Roman script), mixed with English medical/technical terms (e.g., "Aapko ye **Paracetamol** din mein do baar khani hai khana khane ke baad. Agar fever kam nahi hota toh doctor se consult karein.").
   - For other languages, follow the requested translation strictly but maintain the professional pharmacist persona.
3. MEDICAL QUERIES:
   - Provide clear, point-wise advice.
   - Format:
     1. **[Medicine Name/Remedy]**
     2. Usage Instructions
     3. Dietary Tip
     4. **Warning**
   - Keep it concise but helpful.
   - Keep Answer short and clean, aiming for less lines maximum.
4. IMAGE ANALYSIS:
   - Identify medicines or visible symptoms.
   - Explain uses/remedies clearly.
5. PRODUCT SEARCH:
   - If the user asks to "find", "search", "show", "buy" or asks about the "price" or "availability" of a specific medicine, USE THE 'search_medicines' TOOL.
6. MANDATORY DISCLAIMER: End *every* medical suggestion with: "Please consult a doctor for serious advice. Stay safe! 💚"
7. LOCATION & DIRECTIONS:
   - If a user asks for the pharmacy's location or directions, provide the address below.
   - Mention that they can use the "Directions" button in the top menu or the interactive map at the bottom of the page for GPS navigation.
   - Location: New Lucky Pharma, Main Road, Hanwara, Godda, Jharkhand (814154).
   - Time: Open 7 days a week, MON-SUN: 6:00 am to 12:00 pm & 1:00 pm to 9:00 pm, except Friday: 6:00 am to 12:00 pm & 2:00 pm to 9:00 pm.

Note: You are an AI assistant, not a doctor. Prioritize user safety and well-being.`;

// Tool Definition
const searchTool: Tool = {
    functionDeclarations: [{
        name: "search_medicines",
        description: "Search for medicines, health products, or remedies in the store inventory.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: {
                    type: Type.STRING,
                    description: "The name of the medicine, symptom, or category to search for."
                }
            },
            required: ["query"]
        }
    }]
};

// Helper to clean markdown bold syntax (**) from responses
const cleanText = (text: string): string => {
    if (!text) return "";
    return text.trim();
};

// Extremely robust local backup NLP responder for server busy, offline, or quota limits (429)
const getOfflineFallbackResponse = (userMessage: string, targetLanguage: string = "English"): { text: string; products?: Product[] } => {
    const query = userMessage.toLowerCase().trim();
    const isHinglish = targetLanguage === "Hinglish";
    const isHindi = targetLanguage === "Hindi";

    // 1. Check Greetings
    const isGreeting = /\b(hi|hello|hey|good morning|good afternoon|namaste|salam|hola|greet|greeting)\b/i.test(query);
    if (isGreeting) {
        if (isHinglish) {
            return {
                text: "✨ **Welcome to New Lucky Pharma AI Assistant!**\n\nPranam! Main New Lucky Pharma ka backup AI assistant hoon. Server ke thoda busy hone ke kaaran main offline mode mein chal raha hoon.\n\nAaj main aapki kya help kar sakta hoon? Aap directly medicines or unki prices pooch sakte hain! 😊"
            };
        } else if (isHindi) {
            return {
                text: "✨ **न्यू लकी फार्मा एआई सहायक में आपका स्वागत है!**\n\nनमस्ते! मैं न्यू लकी फार्मा का बैकअप एआई सहायक हूँ। मुख्य सर्वर व्यस्त होने के कारण मैं ऑफलाइन मोड में काम कर रहा हूँ।\n\nआज मैं आपकी क्या सहायता कर सकता हूँ? आप दवाओं या उनके उपयोग के बारे में पूछ सकते हैं! 😊"
            };
        } else {
            return {
                text: "✨ **Welcome to New Lucky Pharma AI Assistant!**\n\nHello! I am the local backup AI assistant. Since our main AI server is currently running under a high volume of traffic, I have taken over in offline fallback mode.\n\nHow can I help you today? You can search for standard medicines, health topics, or ask about store hours! 😊"
            };
        }
    }

    // 2. Check Store details / timings
    const isLocationOrTiming = /\b(location|address|where|route|direction|map|timing|open|close|hour|friday|holiday|time|shop|store)\b/i.test(query);
    if (isLocationOrTiming) {
        if (isHinglish) {
            return {
                text: "💊 **New Lucky Pharma Location & Office Timings:**\n\nNew Lucky Pharma, Main Road, Hanwara, Godda, Jharkhand (Pincode: **814154**) par sthit hai.\n\n**Hamari timings:**\n- **Mon-Sun:** Subah 6:00 AM se dopahar 12:00 PM, aur dopahar 1:00 PM se raat 9:00 PM tak.\n- **Friday breaks:** Pavittar Namaz ke liye Friday ko dopahar 12:00 PM se 2:00 PM tak pharmacy band rehti hai.\n\nAap contact karne ke liye call kar sakte hain: **+919798881368** par. Safe rahein! 💚"
            };
        } else if (isHindi) {
            return {
                text: "💊 **न्यू लकी फार्मा स्थान एवं खुलने का समय:**\n\nन्यू लकी फार्मा, मेन रोड, हनवारा, गोड्डा, झारखंड (पिनकोड: **814154**) पर स्थित है।\n\n**दुकान का समय:**\n- **सोमवार से रविवार:** सुबह 6:00 से दोपहर 12:00, और दोपहर 1:00 से रात 9:00 बजे तक।\n- **शुक्रवार:** जुमे की नमाज़ के लिए दोपहर 12:00 से 2:00 बजे तक बंद रहता है।\n\nआप +919798881368 पर संपर्क कर सकते हैं। स्वस्थ रहें! 💚"
            };
        } else {
            return {
                text: "💊 **New Lucky Pharma Location & Office Timings:**\n\nWe are situated on Main Road, Hanwara, Godda, Jharkhand (814154).\n\n**Hours of Operation:**\n- **Mon-Sun:** 6:00 AM to 12:00 PM & 1:00 PM to 9:00 PM.\n- **Friday Prayers:** Friday break applies from 12:00 PM to 2:00 PM.\n\nYou can call our managing pharmacist directly at: **+919798881368** or use the Google Map directions at the bottom of the page! Stay safe! 💚"
            };
        }
    }

    // 3. Keyword/Inventory Search Fallback
    const stripped = query.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ").replace(/\s{2,}/g, " ");
    const words = stripped.split(/\s+/).filter(w => w.length > 2);

    let matchedProducts: Product[] = [];

    if (words.length > 0) {
        matchedProducts = productList.filter(p => {
            const nameLower = p.name.toLowerCase();
            const descLower = p.description.toLowerCase();
            const catLower = p.category?.toLowerCase() || "";
            const compLower = p.composition?.toLowerCase() || "";

            return words.some(word => 
                nameLower.includes(word) || 
                descLower.includes(word) || 
                catLower.includes(word) || 
                compLower.includes(word)
            );
        });
    }

    // Symptom matches if no direct keyword hits
    if (matchedProducts.length === 0) {
        const isFeverOrPain = /\b(fever|pain|headache|body|temp|crocin|dolo|parac|dard|bukhar|sir|sar|pira)\b/i.test(query);
        const isCoughCold = /\b(cough|cold|khasi|sardi|nazla|rhinitis|sneez|coughing|flu)\b/i.test(query);
        const isAcidity = /\b(acid|gas|digene|eno|heartburn|bloat|stomach|pait|gastric|pantoc|pan)\b/i.test(query);
        const isAllergy = /\b(allergy|itch|khujli|cetiriz|sniff|allergi)\b/i.test(query);
        const isWoundOrCut = /\b(wound|wound|cut|burn|injury|chot|betadine|soframycin|antiseptic|clean)\b/i.test(query);
        const isBaby = /\b(baby|child|bacha|milk|nestle|cerelac|lactogen|nan|formula)\b/i.test(query);

        if (isFeverOrPain) {
            matchedProducts = productList.filter(p => p.name.includes("DOLO") || p.name.includes("CETIRIZ") || p.category === "Pain Relief");
        } else if (isCoughCold) {
            matchedProducts = productList.filter(p => p.category === "Cough & Cold" || p.category === "Allergy Relief");
        } else if (isAcidity) {
            matchedProducts = productList.filter(p => p.category === "Antacids");
        } else if (isAllergy) {
            matchedProducts = productList.filter(p => p.category === "Allergy Relief");
        } else if (isWoundOrCut) {
            matchedProducts = productList.filter(p => p.category === "Antiseptics");
        } else if (isBaby) {
            matchedProducts = productList.filter(p => p.category === "Baby Care" || p.category === "Baby Food");
        }
    }

    if (matchedProducts.length > 0) {
        const subset = matchedProducts.slice(0, 3);
        
        let intro = "";
        let details = "";
        let footerText = "";

        if (isHinglish) {
            intro = "🔍 **Local Inventory Matching Mode:**\n\nMaine humare counter stock se matching dawaiyan search ki hain:";
            details = subset.map(p => `💊 **${p.name}**\n- **Upayog**: ${p.description.slice(0, 120)}...\n- **Sevan Vidhi**: ${p.usage}\n- **Price Range**: ${p.avgPrice}`).join("\n\n");
            footerText = "\nAap ye products seedhe New Lucky Pharma pharmacy se le sakte hain. Kisi bhi gambheer bimari ke liye doctor se consult karein. Stay safe! 💚";
        } else if (isHindi) {
            intro = "🔍 **स्थानीय इन्वेंटरी मिलान:**\n\nमुझे न्यू लकी फार्मा स्टॉक में आपकी खोज के अनुसार निम्नलिखित उत्पाद मिले हैं:";
            details = subset.map(p => `💊 **${p.name}**\n- **मुख्य लाभ**: ${p.description.slice(0, 120)}...\n- **उपयोग**: ${p.usage}\n- **कीमत**: ${p.avgPrice}`).join("\n\n");
            footerText = "\nयह दवा फार्मेसी काउंटर पर तैयार है। कृपया गंभीर स्थितियों में चिकित्सक से सलाह लें। स्वस्थ रहें! 💚";
        } else {
            intro = "🔍 **Local Inventory Matching Mode:**\n\nI found these highly relevant items in our physical inventory at New Lucky Pharma:";
            details = subset.map(p => `💊 **${p.name}**\n- **Indication**: ${p.description.slice(0, 120)}...\n- **Directions**: ${p.usage}\n- **Est. Price**: ${p.avgPrice}`).join("\n\n");
            footerText = "\nThese products are currently fully stocked at our shop. Please consult a qualified physician for clinical diagnosis. Stay safe! 💚";
        }

        return {
            text: `${intro}\n\n${details}\n\n${footerText}`,
            products: subset
        };
    }

    // 4. Fallback Catch-all
    if (isHinglish) {
        return {
            text: "ℹ️ **Backup Pharmacy Support Mode:**\n\nNew Lucky Pharma AI assistant busy hone ke karan local backup par chal raha hai. Mujhe aapki exact query ke liye to medicine nahi mili, par hamare paas sabhi healthcare categories jaise **Allergy Relief, Antacids, Antibiotics, Pain Relievers, Antiseptics, Baby Foods (Lactogen, Cerelac), aur Cough Drops** fully stocked hain.\n\nAap directly hamare managing phone **+919798881368** par call karke dawaiyon ki availability aur price jaan sakte hain! Stay safe! 💚"
        };
    } else if (isHindi) {
        return {
            text: "ℹ️ **बैकअप फार्मासिस्ट मोड:**\n\nन्यू लकी फार्मा एआई सहायक अत्यधिक ट्रैफ़िक के कारण बैकअप पर काम कर रहा है। आपकी खोज से संबंधित विशिष्ट दवा स्टॉक में नहीं मिली, परंतु हमारे स्टोर में **एंटीबायोटिक, एंटासिड, पेन किलर, और बेबी केयर** के सभी प्रमुख ब्रांड उपलब्ध हैं।\n\nदवा मंगाने या जानकारी हेतु कृपया हमें **+919798881368** पर सीधे कॉल करें। स्वस्थ रहें! 💚"
        };
    } else {
        return {
            text: "ℹ️ **Backup Pharmacy Support Mode:**\n\nI am running as a local fallback helper due to high Google AI traffic. While I couldn't find an exact brand match for your custom text search, please note we stock a comprehensive range of health products, including **Antibiotics, Antacids, Painkillers, Antiseptics, Allergy treatments, Baby food formula (Nestle), and multivitamin syrups**.\n\nPlease call us directly at **+919798881368** to check exact product packaging details or visit our local store in Hanwara. Stay safe! 💚"
        };
    }
};

export const getGeminiResponse = async (userMessage: string, imageBase64?: string, targetLanguage: string = 'English'): Promise<{ text: string, products?: Product[], groundingSources?: { title: string; url: string }[] }> => {
    const cacheKey = `${userMessage}_${targetLanguage}_${imageBase64 ? 'img' : 'no_img'}`;
    try {
        if (responseCache.has(cacheKey)) {
            return responseCache.get(cacheKey)!;
        }

        const ai = getAIClient();
        if (!ai) {
            const fallback = getOfflineFallbackResponse(userMessage, targetLanguage);
            responseCache.set(cacheKey, fallback);
            return fallback;
        }

        let contents: any;
        
        let finalMessage = userMessage;
        
        // Dynamic Language Selection
        if (targetLanguage && targetLanguage !== 'English') {
            if (targetLanguage === 'Hinglish') {
                finalMessage = `${userMessage}\n\n[System Instruction: You MUST reply to this message in HINGLISH (Hindi mixed with English, written in Roman script). Use a natural urban conversational tone.]`;
            } else {
                finalMessage = `${userMessage}\n\n[System Instruction: You MUST reply to this message in ${targetLanguage} language.]`;
            }
        }

        if (imageBase64) {
             const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
             if (match) {
                 const mimeType = match[1];
                 const data = match[2];
                 contents = {
                     parts: [
                         { inlineData: { mimeType, data } },
                         { text: finalMessage || "Please analyze this image." }
                     ]
                 };
             }
        } else {
            contents = finalMessage;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: contents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                tools: [searchTool]
            }
        });

        const functionCalls = response.functionCalls;
        
        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            if (call.name === "search_medicines") {
                const query = (call.args as any)['query'] as string;
                const products = await performHybridSearch(query);
                
                let resultText = products.length > 0 
                    ? `I found ${products.length} products matching "**${query}**" for you. Tap 'View' to see details!`
                    : `I couldn't find "**${query}**" in our local inventory, but I can suggest general remedies if you like.`;

                // Handle translation for tool response too
                if (targetLanguage && targetLanguage !== 'English') {
                    resultText = await translateText(resultText, targetLanguage);
                }

                const finalToolResult = {
                    text: resultText,
                    products: products
                };
                responseCache.set(cacheKey, finalToolResult);
                return finalToolResult;
            }
        }

        const text = response.text || "";
        const groundingSources: { title: string; url: string }[] = [];

        if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
                if (chunk.web?.uri && chunk.web?.title) {
                    groundingSources.push({ title: chunk.web.title, url: chunk.web.uri });
                }
                if (chunk.maps?.uri && chunk.maps?.title) {
                    groundingSources.push({ title: chunk.maps.title, url: chunk.maps.uri });
                } else if (chunk.maps?.uri) {
                     groundingSources.push({ title: "View on Google Maps", url: chunk.maps.uri });
                }
            });
        }

        const finalResult = { 
            text: cleanText(text) || "I didn't quite catch that. Could you rephrase?",
            groundingSources: groundingSources.length > 0 ? groundingSources : undefined
        };
        
        responseCache.set(cacheKey, finalResult);
        return finalResult;

    } catch (error: any) {
        console.warn("Gemini service run failed, falling back to offline search module:", error);
        const fallback = getOfflineFallbackResponse(userMessage, targetLanguage);
        responseCache.set(cacheKey, fallback);
        return fallback;
    }
};

const performHybridSearch = async (query: string): Promise<Product[]> => {
    const lowerQuery = query.toLowerCase();
    
    const localResults = productList.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        p.description.toLowerCase().includes(lowerQuery) ||
        p.category?.toLowerCase().includes(lowerQuery)
    );

    if (localResults.length > 0) {
        return localResults.slice(0, 4);
    }

    return await searchProducts(query);
};

export const translateText = async (text: string, targetLanguage: string = 'English'): Promise<string> => {
    try {
        const ai = getAIClient();
        if (!ai) return text;

        const instruction = targetLanguage === 'Hinglish' 
            ? `Translate into Hinglish (Hindi written in Roman script mixed with English).`
            : `Translate into ${targetLanguage}.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: `${instruction} Keep any markdown formatting like bolding (**). Text: \n\n${text}`,
        });

        return response.text || text;
    } catch (error) {
        handleGeminiError(error);
        return text;
    }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
    try {
        const ai = getAIClient();
        if (!ai) return null;

        const cleanSpeechText = text.replace(/\*\*/g, "").replace(/\*/g, "");

        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-tts-preview",
            contents: [{ parts: [{ text: cleanSpeechText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        handleGeminiError(error);
        return null;
    }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
    try {
        const ai = getAIClient();
        if (!ai) return performHybridSearch(query); // Failover directly to offline search

        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: `You are an expert pharmacist in India. User Query: "${query}".
            Generate a list of 4 DISTINCT, POPULAR BRAND NAME medicines available in India that match the query.
            
            STRICT RULES FOR "NAME" FIELD:
            1. MUST BE A BRAND NAME: Return commercially sold names like "Dolo 650", "Saridon", "Ascoril", "Shelcal", "Digene".
            2. NO GENERIC NAMES: Do NOT use chemical names like "Paracetamol", "Ibuprofen", "Amoxycillin" as the main name.
            3. NO DESCRIPTIONS IN NAME: Do not write "Paracetamol Tablet". Write "Dolo 650".
            4. REAL PRODUCTS ONLY: Use actual products found in Indian medical stores.
            5. SHOW Result according to User Query.
            6. Match first result with user queries.
 
            Provide: Category, Composition (Active Ingredients with strength), Usage, Side Effects, Precautions, and Prescription Status.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            category: { type: Type.STRING },
                            composition: { type: Type.STRING },
                            usage: { type: Type.STRING },
                            sideEffects: { type: Type.STRING },
                            precautions: { 
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            isPrescriptionRequired: { type: Type.BOOLEAN }
                        },
                        required: ["name", "description", "category", "composition", "usage", "sideEffects", "precautions", "isPrescriptionRequired"]
                    }
                }
            }
        });

        let rawData = response.text;
        if (!rawData) return performHybridSearch(query);

        const parsedData = JSON.parse(rawData);
        
        return parsedData.map((item: any, index: number) => ({
            id: Date.now() + index + 100000,
            name: item.name,
            description: item.description,
            image: `https://image.pollinations.ai/prompt/medicine%20${encodeURIComponent(item.name)}%20product%20packaging%20white%20background?width=400&height=400&nologo=true`,
            delay: `reveal-delay-${(index * 100) % 400}`,
            category: item.category,
            composition: item.composition,
            usage: item.usage,
            sideEffects: item.sideEffects,
            precautions: item.precautions,
            isPrescriptionRequired: item.isPrescriptionRequired,
            source: 'ai'
        }));

    } catch (error) {
        console.warn("searchProducts LLM search failed, failing over to local hybrid inventory search:", error);
        // Fallback to local keyword search
        const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        if (queryWords.length > 0) {
            const matches = productList.filter(p => {
                const nameL = p.name.toLowerCase();
                const descL = p.description.toLowerCase();
                return queryWords.some(w => nameL.includes(w) || descL.includes(w));
            });
            if (matches.length > 0) {
                return matches.slice(0, 4);
            }
        }
        return productList.slice(0, 4); // General fallback
    }
};

export const getPersonalizedSuggestions = async (history: string[]): Promise<{text: string, icon: string}[]> => {
    try {
        const cacheKey = `sugg_${history.slice(-5).join('|')}`;
        if (responseCache.has(cacheKey) && responseCache.get(cacheKey)!.text === 'suggestions') {
            return responseCache.get(cacheKey)!.products as any;
        }

        const ai = getAIClient();
        if (!ai) {
            return [
                { text: "Fever Remedies", icon: "fa-pills" },
                { text: "Acidity Relief", icon: "fa-fire" },
                { text: "Cough & Cold", icon: "fa-prescription-bottle" },
                { text: "Store Hours", icon: "fa-clock" }
            ];
        }
        if (history.length === 0) return [];

        const historyStr = history.slice(-5).join(", ");
        const prompt = `Based on these recent health/pharmacy queries: "${historyStr}", give 4 very short relevant follow-up topics to ask.
Output JSON array of objects with 'text' (max 4 words) and 'icon' (fontawesome solid name, e.g., 'pills', 'heartbeat', 'capsules'). NO Markdown. Example: [{"text": "Headache pills", "icon": "pills"}]`;

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You suggest very short clinical/pharmaceutical terms based on history.",
                temperature: 0.5,
                responseMimeType: "application/json"
            }
        });

        const text = response.text || "[]";
        let suggestions = JSON.parse(text);
        
        suggestions = suggestions.map((s: any) => ({
            text: s.text,
            icon: `fa-${s.icon.replace(/^fa-/, '')}`
        }));

        responseCache.set(cacheKey, { text: 'suggestions', products: suggestions });
        return suggestions;

    } catch (e) {
        console.warn("getPersonalizedSuggestions failed, returning safe default chips:", e);
        return [
            { text: "Fever Remedies", icon: "fa-pills" },
            { text: "Acidity Relief", icon: "fa-fire" },
            { text: "Cough & Cold", icon: "fa-prescription-bottle" },
            { text: "Store Hours", icon: "fa-clock" }
        ];
    }
};