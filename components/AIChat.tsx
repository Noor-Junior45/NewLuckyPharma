import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { getGeminiResponse, generateSpeech, isAIConfigured, getPersonalizedSuggestions } from '../services/geminiService';
import { ChatMessage, Product } from '../types';
import { ProductCardImage } from './ProductCardImage';

// --- AUDIO UTILS FOR LIVE API ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- CONSTANTS ---
const QUICK_SUGGESTIONS = [
    { text: "Fever remedies 🤒", icon: "fa-thermometer-half" },
    { text: "Find Paracetamol 💊", icon: "fa-search" },
    { text: "Pharmacy location 📍", icon: "fa-map-marker-alt" },
    { text: "Stomach pain help 🤢", icon: "fa-dizzy" },
    { text: "Store timings ⏰", icon: "fa-clock" },
    { text: "Skin care tips ✨", icon: "fa-sparkles" }
];

const LANGUAGES = [
    { code: 'English', name: 'English', flag: '🇺🇸' },
    { code: 'Hinglish', name: 'Hinglish (Hindi + English)', flag: '🇮🇳' },
    { code: 'Hindi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
    { code: 'Bengali', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
    { code: 'Urdu', name: 'اردو (Urdu)', flag: '🇮🇳' },
    { code: 'Arabic', name: 'العربية (Arabic)', flag: '🇸🇦' },
    { code: 'Spanish', name: 'Español (Spanish)', flag: '🇪🇸' },
    { code: 'French', name: 'Français (French)', flag: '🇫🇷' },
    { code: 'German', name: 'Deutsch (German)', flag: '🇩🇪' },
    { code: 'Japanese', name: '日本語 (Japanese)', flag: '🇯🇵' },
    { code: 'Telugu', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
    { code: 'Tamil', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { code: 'Marathi', name: 'मరాठी (Marathi)', flag: '🇮🇳' },
    { code: 'Gujarati', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
    { code: 'Kannada', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
    { code: 'Malayalam', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
    { code: 'Punjabi', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
    { code: 'Chinese', name: '中文 (Chinese)', flag: '🇨🇳' },
    { code: 'Russian', name: 'Русский (Russian)', flag: '🇷🇺' },
    { code: 'Portuguese', name: 'Português (Portuguese)', flag: '🇵🇹' },
    { code: 'Afrikaans', name: 'Afrikaans', flag: '🇿🇦' },
    { code: 'Albanian', name: 'Shqip (Albanian)', flag: '🇦🇱' },
    { code: 'Amharic', name: 'አማርኛ (Amharic)', flag: '🇪🇹' },
    { code: 'Armenian', name: 'Հայերեն (Armenian)', flag: '🇦🇲' },
    { code: 'Azerbaijani', name: 'Azərbaycan (Azerbaijani)', flag: '🇦🇿' },
    { code: 'Basque', name: 'Euskara (Basque)', flag: '🇪🇸' },
    { code: 'Belarusian', name: 'Беларуская (Belarusian)', flag: '🇧🇾' },
    { code: 'Bosnian', name: 'Bosanski (Bosnian)', flag: '🇧🇦' },
    { code: 'Bulgarian', name: 'Български (Bulgarian)', flag: '🇧🇬' },
    { code: 'Catalan', name: 'Català (Catalan)', flag: '🇪🇸' },
    { code: 'Croatian', name: 'Hrvatski (Croatian)', flag: '🇭🇷' },
    { code: 'Czech', name: 'Čeština (Czech)', flag: '🇨🇿' },
    { code: 'Danish', name: 'Dansk (Danish)', flag: '🇩🇰' },
    { code: 'Dutch', name: 'Nederlands (Dutch)', flag: '🇳🇱' },
    { code: 'Esperanto', name: 'Esperanto', flag: '🌍' },
    { code: 'Estonian', name: 'Eesti (Estonian)', flag: '🇪🇪' },
    { code: 'Filipino', name: 'Filipino', flag: '🇵🇭' },
    { code: 'Finnish', name: 'Suomi (Finnish)', flag: '🇫🇮' },
    { code: 'Georgian', name: 'ქართული (Georgian)', flag: '🇬🇪' },
    { code: 'Greek', name: 'Ελληνικά (Greek)', flag: '🇬🇷' },
    { code: 'Hebrew', name: 'עברית (Hebrew)', flag: '🇮🇱' },
    { code: 'Hungarian', name: 'Magyar (Hungarian)', flag: '🇭🇺' },
    { code: 'Icelandic', name: 'Íslenska (Icelandic)', flag: '🇮🇸' },
    { code: 'Indonesian', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'Irish', name: 'Gaeilge (Irish)', flag: '🇮🇪' },
    { code: 'Italian', name: 'Italiano (Italian)', flag: '🇮🇹' },
    { code: 'Kazakh', name: 'Қазақ (Kazakh)', flag: '🇰🇿' },
    { code: 'Khmer', name: 'ខ្មែر (Khmer)', flag: '🇰🇭' },
    { code: 'Korean', name: '한국어 (Korean)', flag: '🇰🇷' },
    { code: 'Latvian', name: 'Latviešu (Latvian)', flag: '🇱🇻' },
    { code: 'Lithuanian', name: 'Lietuvių (Lithuanian)', flag: '🇱🇹' },
    { code: 'Malay', name: 'Bahasa Melayu (Malay)', flag: '🇲🇾' },
    { code: 'Mongolian', name: 'Монгол (Mongolian)', flag: '🇲🇳' },
    { code: 'Nepali', name: 'नेपाली (Nepali)', flag: '🇳🇵' },
    { code: 'Norwegian', name: 'Norsk (Norwegian)', flag: '🇳🇴' },
    { code: 'Pashto', name: 'ਪښتو (Pashto)', flag: '🇦🇫' },
    { code: 'Persian', name: 'فارسی (Persian)', flag: '🇮🇷' },
    { code: 'Polish', name: 'Polski (Polish)', flag: '🇵🇱' },
    { code: 'Romanian', name: 'Română (Romanian)', flag: '🇷🇴' },
    { code: 'Serbian', name: 'Српски (Serbian)', flag: '🇷🇸' },
    { code: 'Sinhala', name: 'සිංහල (Sinhala)', flag: '🇱🇰' },
    { code: 'Slovak', name: 'Slovenčina (Slovak)', flag: '🇸🇰' },
    { code: 'Slovenian', name: 'Slovenščina (Slovenian)', flag: '🇸🇮' },
    { code: 'Swahili', name: 'Kiswahili (Swahili)', flag: '🇰🇪' },
    { code: 'Swedish', name: 'Svenska (Swedish)', flag: '🇸🇪' },
    { code: 'Thai', name: 'ไทย (Thai)', flag: '🇹🇭' },
    { code: 'Turkish', name: 'Türkçe (Turkish)', flag: '🇹🇷' },
    { code: 'Ukrainian', name: 'Українська (Ukrainian)', flag: '🇺🇦' },
    { code: 'Vietnamese', name: 'Tiếng Việt (Vietnamese)', flag: '🇻🇳' },
    { code: 'Welsh', name: 'Cymraeg (Welsh)', flag: '🏴󠁧󠁢󠁷󠁬󠁿' },
].sort((a, b) => {
    if (a.code === 'English') return -1;
    if (b.code === 'English') return 1;
    if (a.code === 'Hinglish') return -1;
    if (b.code === 'Hinglish') return 1;
    return a.name.localeCompare(b.name);
});

const WELCOME_MSG = "Hello! 👋 I'm your **AI Pharmacist**.\n\nAsk me about:\n💊 Medicine uses\n🤒 Common symptoms\n🌿 Home remedies\n🔍 Find specific medicines\n\n**Note:** I am an AI, not a doctor. Please consult a professional for serious advice.";

const SYSTEM_INSTRUCTION = `You are a warm, caring, and friendly AI Pharmacist assistant for 'New Lucky Pharma', located in Hanwara, Jharkhand. Your goal is to help users with their health queries in a supportive and reassuring manner. 
Keep your responses concise and focused on healthcare. End medical suggestions with "Please consult a doctor for serious advice. Stay safe! 💚"`;

interface AIChatProps {
    onViewProduct?: (product: Product) => void;
}

const AIChat: React.FC<AIChatProps> = ({ onViewProduct }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isOpenRef = useRef(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [showGreeting, setShowGreeting] = useState(false);
    const [showTranslate, setShowTranslate] = useState(false);
    const [searchLang, setSearchLang] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [isOnline] = useState(isAIConfigured());
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [dynamicSuggestions, setDynamicSuggestions] = useState<{text: string, icon: string}[]>(QUICK_SUGGESTIONS);
    
    // UI State
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        try {
            const savedHistory = localStorage.getItem('chat_history');
            if (savedHistory) return JSON.parse(savedHistory);
        } catch (e) {}
        return [{ id: 'welcome', text: WELCOME_MSG, isUser: false, timestamp: Date.now() }];
    });
    const [inputValue, setInputValue] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Audio / Live State
    const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [liveStatusText, setLiveStatusText] = useState("Connecting...");
    const [liveInTranscription, setLiveInTranscription] = useState("");
    const [liveOutTranscription, setLiveOutTranscription] = useState("");
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);

    // Refs for non-react accumulation to avoid stale closures
    const liveInTextRef = useRef("");
    const liveOutTextRef = useRef("");

    // Refs for hardware/API
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const liveSessionRef = useRef<any>(null);
    const liveAudioContextRef = useRef<AudioContext | null>(null);
    const liveNextStartTimeRef = useRef(0);
    const liveSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scanInputRef = useRef<HTMLInputElement>(null);

    // Sync history & Recommendations
    useEffect(() => {
        localStorage.setItem('chat_history', JSON.stringify(messages));
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

        const currentQueries = messages.filter(m => m.isUser).map(m => m.text);
        let storedHistory: string[] = [];
        try {
            storedHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
        } catch (e) {}

        const updatedHistory = Array.from(new Set([...storedHistory, ...currentQueries])).slice(-20);
        localStorage.setItem('search_history', JSON.stringify(updatedHistory));

        if (updatedHistory.length > 0 && isOnline) {
            getPersonalizedSuggestions(updatedHistory).then(suggestions => {
                if (suggestions && suggestions.length > 0) {
                    setDynamicSuggestions(suggestions);
                } else {
                    setDynamicSuggestions(QUICK_SUGGESTIONS);
                }
            });
        } else {
            setDynamicSuggestions(QUICK_SUGGESTIONS);
        }
    }, [messages, isOnline]);

    // Initial Greeting Popup logic
    useEffect(() => {
        const showTimer = setTimeout(() => {
            if (!isOpenRef.current) setShowGreeting(true);
        }, 3000);

        const hideTimer = setTimeout(() => {
            setShowGreeting(false);
        }, 18000); // 3s delay + 15s visible

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, []);

    // Update ref for async checks
    useEffect(() => {
        isOpenRef.current = isOpen;
        if (isOpen) {
            setShowGreeting(false);
            setHasUnread(false);
        }
    }, [isOpen]);

    // Handle Mobile Back Button (Gesture Navigation)
    useEffect(() => {
        if (isOpen) {
            window.history.pushState({ chatOpen: true }, '', window.location.href);
            const handlePopState = () => setIsOpen(false);
            window.addEventListener('popstate', handlePopState);
            return () => window.removeEventListener('popstate', handlePopState);
        }
    }, [isOpen]);

    // Handle 'ask-ai' custom event
    useEffect(() => {
        const handleAskAI = async (e: any) => {
            const { productName, description, customQuery } = e.detail;
            setIsOpen(true);
            setHasUnread(false);
            
            let query = customQuery;
            if (!query && productName) {
                query = `Tell me more about ${productName}. ${description || ''}`;
            }

            if (query) {
                const userMsg: ChatMessage = { 
                    id: Date.now().toString(), 
                    text: query, 
                    isUser: true, 
                    timestamp: Date.now() 
                };
                
                setMessages(prev => [...prev, userMsg]);
                setIsLoading(true);
                
                try {
                    const aiResponse = await getGeminiResponse(query, undefined, selectedLanguage);
                    setMessages(prev => {
                        if (!isOpenRef.current) setHasUnread(true);
                        return [...prev, { 
                            id: (Date.now() + 1).toString(), 
                            text: aiResponse.text, 
                            isUser: false, 
                            timestamp: Date.now(), 
                            products: aiResponse.products, 
                            groundingSources: aiResponse.groundingSources 
                        }];
                    });
                } catch (error) {
                    console.error("AI Error:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        window.addEventListener('ask-ai' as any, handleAskAI);
        return () => window.removeEventListener('ask-ai' as any, handleAskAI);
    }, [selectedLanguage]);

    // Cleanup
    useEffect(() => {
        return () => {
            stopAudio();
            stopLiveSession();
        };
    }, []);

    const toggleChat = () => {
        if (isOpen) {
            window.history.back();
        } else {
            setIsOpen(true);
        }
    };

    const stopAudio = () => {
        if (sourceRef.current) {
            try { sourceRef.current.stop(); } catch (e) {}
            sourceRef.current = null;
        }
        setPlayingMessageId(null);
        setIsAudioLoading(false);
    };

    const playAudio = async (id: string, text: string) => {
        if (playingMessageId === id) { stopAudio(); return; }
        stopAudio();
        setPlayingMessageId(id);
        setIsAudioLoading(true);
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
            }
            const ctx = audioContextRef.current;
            if (ctx.state === 'suspended') await ctx.resume();
            const base64Audio = await generateSpeech(text);
            if (!base64Audio) { setPlayingMessageId(null); setIsAudioLoading(false); return; }
            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.onended = () => { setPlayingMessageId(null); sourceRef.current = null; };
            sourceRef.current = source;
            source.start();
            setIsAudioLoading(false);
        } catch (e) {
            console.error(e);
            setPlayingMessageId(null);
            setIsAudioLoading(false);
        }
    };

    const copyToClipboard = async (id: string, text: string) => {
        try {
            const cleanText = text.replace(/[*_#]/g, '');
            await navigator.clipboard.writeText(cleanText);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    // --- LIVE TALK LOGIC ---
    const startLiveSession = async () => {
        if (isLive) return;
        setIsLive(true);
        setLiveStatusText("Initializing...");
        setLiveInTranscription("");
        setLiveOutTranscription("");
        liveInTextRef.current = "";
        liveOutTextRef.current = "";

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
            
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
            const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
            liveAudioContextRef.current = outputCtx;

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.0-flash',
                callbacks: {
                    onopen: () => {
                        setLiveStatusText("Listening...");
                        const source = inputCtx.createMediaStreamSource(stream);
                        const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
                        scriptProcessor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputCtx.destination);
                        (window as any)._liveInputCtx = inputCtx;
                        (window as any)._liveStream = stream;
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle Input Transcription
                        if (message.serverContent?.inputTranscription) {
                            const newText = message.serverContent.inputTranscription.text;
                            liveInTextRef.current += newText;
                            setLiveInTranscription(liveInTextRef.current);
                            setLiveStatusText("AI is listening...");
                            setIsAiSpeaking(false);
                        }
                        // Handle Output Transcription
                        if (message.serverContent?.outputTranscription) {
                            const newText = message.serverContent.outputTranscription.text;
                            liveOutTextRef.current += newText;
                            setLiveOutTranscription(liveOutTextRef.current);
                            setLiveStatusText("AI is speaking...");
                            setIsAiSpeaking(true);
                        }
                        // Turn complete - Move to main history
                        if (message.serverContent?.turnComplete) {
                            if (liveInTextRef.current || liveOutTextRef.current) {
                                const userText = liveInTextRef.current.trim();
                                const aiText = liveOutTextRef.current.trim();
                                
                                setMessages(prev => {
                                    const newMsgs = [...prev];
                                    if (userText) newMsgs.push({ id: `live-u-${Date.now()}`, text: userText, isUser: true, timestamp: Date.now() });
                                    if (aiText) newMsgs.push({ id: `live-a-${Date.now()+1}`, text: aiText, isUser: false, timestamp: Date.now() });
                                    return newMsgs;
                                });
                            }
                            // Reset local accumulations
                            liveInTextRef.current = "";
                            liveOutTextRef.current = "";
                            setLiveInTranscription("");
                            setLiveOutTranscription("");
                            setLiveStatusText("Listening...");
                            setIsAiSpeaking(false);
                        }
                        // Handle Audio Output
                        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio) {
                            liveNextStartTimeRef.current = Math.max(liveNextStartTimeRef.current, outputCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            source.addEventListener('ended', () => liveSourcesRef.current.delete(source));
                            source.start(liveNextStartTimeRef.current);
                            liveNextStartTimeRef.current += audioBuffer.duration;
                            liveSourcesRef.current.add(source);
                        }
                        if (message.serverContent?.interrupted) {
                            liveSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
                            liveSourcesRef.current.clear();
                            liveNextStartTimeRef.current = 0;
                            setIsAiSpeaking(false);
                        }
                    },
                    onerror: () => { setLiveStatusText("Connection lost."); stopLiveSession(); },
                    onclose: () => { setIsLive(false); setIsAiSpeaking(false); }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                    systemInstruction: SYSTEM_INSTRUCTION,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {}
                }
            });

            liveSessionRef.current = await sessionPromise;
        } catch (err) {
            console.error(err);
            setIsLive(false);
        }
    };

    const stopLiveSession = () => {
        if (liveSessionRef.current) {
            liveSessionRef.current.close();
            liveSessionRef.current = null;
        }
        if ((window as any)._liveInputCtx) (window as any)._liveInputCtx.close();
        if ((window as any)._liveStream) (window as any)._liveStream.getTracks().forEach((t: any) => t.stop());
        liveSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
        liveSourcesRef.current.clear();
        setIsLive(false);
        setIsAiSpeaking(false);
        setLiveInTranscription("");
        setLiveOutTranscription("");
    };

    // --- SCAN / IMAGE HELPERS ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => setSelectedImage(reader.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleCameraScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsScanning(true);
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Data = reader.result as string;
                const prompt = "Identify the brand name of the medicine in this image. Return ONLY the name as a clean string.";
                const response = await getGeminiResponse(prompt, base64Data);
                if (response.text) setInputValue(response.text.replace(/[*_#]/g, '').trim());
                setIsScanning(false);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent | null, overrideText?: string) => {
        if (e) e.preventDefault();
        const textToSubmit = overrideText || inputValue;
        if (!textToSubmit.trim() && !selectedImage) return;
        const userText = textToSubmit.trim();
        const userImage = selectedImage;
        setMessages(prev => [...prev, { id: Date.now().toString(), text: userText, image: userImage || undefined, isUser: true, timestamp: Date.now() }]);
        setInputValue('');
        setSelectedImage(null);
        setIsLoading(true);
        const aiResponse = await getGeminiResponse(userText, userImage || undefined, selectedLanguage);
        setMessages(prev => {
            if (!isOpenRef.current) setHasUnread(true);
            return [...prev, { id: (Date.now() + 1).toString(), text: aiResponse.text, isUser: false, timestamp: Date.now(), products: aiResponse.products, groundingSources: aiResponse.groundingSources }];
        });
        setIsLoading(false);
    };

    const formatMessageText = (text: string) => {
        const textWithBullets = text.replace(/(^|\n)\*\s/g, '$1• ');
        const parts = textWithBullets.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) return <strong key={index} className="text-gray-900 font-bold">{part.slice(2, -2)}</strong>;
            return <span key={index}>{part}</span>;
        });
    };

    const filteredLanguages = LANGUAGES.filter(l => 
        l.name.toLowerCase().includes(searchLang.toLowerCase()) || 
        l.code.toLowerCase().includes(searchLang.toLowerCase())
    );

    const getDateLabel = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (dayDiff === 0 && date.getDate() === now.getDate()) return 'Today';
        if (dayDiff === 1 || (dayDiff === 0 && date.getDate() !== now.getDate())) return 'Yesterday';
        return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <>
            {/* Cloud Greeting Popup */}
            {showGreeting && !isOpen && (
                <div className="fixed bottom-56 md:bottom-36 right-4 md:right-6 z-[95] animate-popup-in origin-bottom-right">
                    <div className="bg-white border border-medical-200 p-3 rounded-3xl shadow-2xl relative max-w-[200px] glass-panel ring-1 ring-medical-50">
                        <div className="flex justify-between items-start gap-2">
                            <p className="text-[11px] font-bold text-gray-800 leading-snug">
                                Hi! 👋 I'm your AI Pharmacist. How can I help you today? 💊
                            </p>
                            <button onClick={() => setShowGreeting(false)} className="w-5 h-5 bg-gray-50 text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center text-[10px] transition-colors shrink-0"><i className="fas fa-times"></i></button>
                        </div>
                        {/* Improved Cloud Tail pointing at the FAB center */}
                        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-medical-200 rotate-45 rounded-sm"></div>
                    </div>
                </div>
            )}

            {/* FAB */}
            <button onClick={toggleChat} className="fixed bottom-36 md:bottom-16 right-4 md:right-6 z-[90] w-16 h-16 rounded-full bg-white border-2 border-medical-100 shadow-xl flex items-center justify-center transition-all hover:-translate-y-1 active:scale-90">
                <i className="fas fa-user-md text-3xl text-medical-600"></i>
                {hasUnread && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
            </button>

            {/* Modal Overlay */}
            <div className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={(e) => e.target === e.currentTarget && toggleChat()}>
                <div className={`bg-white w-full sm:max-w-[450px] h-[90vh] sm:h-[650px] sm:rounded-[2rem] rounded-t-[2rem] flex flex-col transition-all duration-500 overflow-hidden relative ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-full scale-95'}`}>
                    
                    {/* Header */}
                    <div className="bg-medical-600 h-20 px-6 flex items-center justify-between shadow-md text-white flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-medical-600 flex-shrink-0 shadow-sm"><i className="fas fa-user-md text-xl"></i></div>
                            <div>
                                <h3 className="font-bold">AI Pharmacist</h3>
                                <div className="flex items-center gap-1.5 opacity-90"><span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span><span className="text-[10px] uppercase font-bold tracking-wider">{isOnline ? 'Online' : 'Offline'}</span></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setMessages([{ id: 'welcome', text: WELCOME_MSG, isUser: false, timestamp: Date.now() }])} className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-sm" title="Clear Chat"><i className="fas fa-trash-alt text-[10px] sm:text-xs"></i></button>
                            <button onClick={toggleChat} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"><i className="fas fa-times text-sm"></i></button>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 bg-[#ECE5DD] relative custom-scrollbar" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundBlendMode: 'soft-light' }}>
                        
                        {/* REDESIGNED LIVE TALK OVERLAY */}
                        {isLive && (
                            <div className="absolute inset-0 bg-medical-900/95 backdrop-blur-xl z-[60] flex flex-col items-center justify-between py-12 px-6 text-white text-center animate-fade-in overflow-hidden">
                                {/* Top Status */}
                                <div className="flex flex-col items-center gap-2">
                                    <div className="bg-red-500 text-[10px] font-black px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5 tracking-tighter">
                                        <div className="w-2 h-2 bg-white rounded-full"></div> LIVE TALK
                                    </div>
                                    <p className="text-medical-200 text-sm font-bold tracking-wide uppercase mt-2">{liveStatusText}</p>
                                </div>

                                {/* Dynamic Aura & Mic Icon */}
                                <div className="relative flex items-center justify-center">
                                    {/* Waves based on state */}
                                    <div className={`absolute w-32 h-32 bg-medical-500/30 rounded-full blur-xl transition-all duration-700 ${isAiSpeaking ? 'scale-[2.5] opacity-50' : 'scale-[1.8] animate-pulse opacity-40'}`}></div>
                                    <div className={`absolute w-24 h-24 bg-white/20 rounded-full blur-md transition-all duration-500 ${isAiSpeaking ? 'scale-150' : 'scale-110'}`}></div>
                                    
                                    <div className={`relative w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-2xl border-4 border-white/20 transition-all duration-500 ${isAiSpeaking ? 'bg-medical-500 scale-110' : 'bg-medical-600 scale-100 shadow-medical-500/50'}`}>
                                        <i className={`fas ${isAiSpeaking ? 'fa-volume-up animate-bounce' : 'fa-microphone'}`}></i>
                                    </div>
                                </div>

                                {/* Live Transcription Box */}
                                <div className="w-full max-w-sm flex flex-col gap-4">
                                    <div className="bg-white/10 border border-white/10 rounded-2xl p-5 min-h-[140px] flex flex-col justify-center transition-all duration-300">
                                        {liveOutTranscription ? (
                                            <p className="text-lg leading-relaxed font-medium text-medical-50 animate-fade-in">{liveOutTranscription}</p>
                                        ) : liveInTranscription ? (
                                            <p className="text-lg leading-relaxed font-bold text-white italic animate-fade-in opacity-80">"{liveInTranscription}"</p>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 opacity-30">
                                                <i className="fas fa-ellipsis-h text-2xl animate-pulse"></i>
                                                <p className="text-xs uppercase font-bold">Waiting for speech...</p>
                                            </div>
                                        )}
                                    </div>

                                    <button onClick={stopLiveSession} className="w-full py-4 bg-white text-medical-900 rounded-2xl font-black shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-medical-50 uppercase tracking-widest text-sm">
                                        <i className="fas fa-stop-circle text-lg"></i> Finish Session
                                    </button>
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => {
                            const showDate = idx === 0 || getDateLabel(msg.timestamp) !== getDateLabel(messages[idx-1].timestamp);
                            return (
                                <React.Fragment key={msg.id}>
                                    {showDate && (
                                        <div className="flex justify-center my-4 sticky top-0 z-10">
                                            <span className="bg-medical-100/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-medical-800 shadow-sm uppercase tracking-wider">
                                                {getDateLabel(msg.timestamp)}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex w-full items-start gap-3 ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm border shadow-sm ${msg.isUser ? 'bg-gray-100 border-gray-200 text-black' : 'bg-medical-100 border-medical-200 text-medical-600'}`}>
                                            <i className={`fas ${msg.isUser ? 'fa-user' : 'fa-user-md'}`}></i>
                                        </div>

                                        <div className={`flex flex-col max-w-[75%] ${msg.isUser ? 'items-end' : 'items-start'}`}>
                                            <div className={`relative px-3 pt-2 pb-1.5 text-sm shadow-sm w-fit inline-block leading-[1.4] whitespace-pre-wrap ${msg.isUser ? 'bg-[#d9fdd3] rounded-lg rounded-tr-none' : 'bg-white rounded-lg rounded-tl-none'}`}>
                                                {msg.image && <img src={msg.image} className="mb-2 rounded max-w-full border border-gray-100 shadow-sm" />}
                                                <div className="inline">
                                                    {formatMessageText(msg.text)}
                                                    <span className="inline-flex items-center justify-end ml-3 align-bottom text-[9px] opacity-40 leading-none h-[11px] min-w-[45px] select-none pointer-events-none">
                                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                            </div>

                                            {!msg.isUser && (msg.products?.length || msg.groundingSources?.length) && (
                                                <div className="mt-2 flex flex-col gap-2 w-full animate-fade-in">
                                                    {msg.products?.map((p) => (
                                                        <div key={p.id} className="bg-white rounded-xl shadow-sm border border-medical-100 overflow-hidden flex items-center p-2 gap-3 hover:border-medical-300 transition-all cursor-pointer group" onClick={() => onViewProduct?.(p)}>
                                                            <div className="w-12 h-12 flex-shrink-0"><ProductCardImage src={p.image} alt={p.name} className="rounded-lg shadow-inner" /></div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-xs font-bold text-gray-800 truncate group-hover:text-medical-600 transition-colors">{p.name}</h4>
                                                                <p className="text-[10px] text-gray-500 truncate font-medium">{p.category || 'General Health'}</p>
                                                            </div>
                                                            <button className="text-[10px] font-bold text-medical-600 px-3 py-1 bg-medical-50 rounded-full hover:bg-medical-100 transition-colors flex-shrink-0">View</button>
                                                        </div>
                                                    ))}
                                                    <div className="flex flex-wrap gap-2">
                                                        {msg.groundingSources?.map((source, sIdx) => (
                                                            <a key={sIdx} href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100 hover:bg-blue-100 transition-all shadow-sm">
                                                                <i className="fas fa-external-link-alt"></i> {source.title}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {!msg.isUser && (
                                                <div className="flex items-center gap-3 mt-1.5 px-1">
                                                    <button onClick={() => playAudio(msg.id, msg.text)} className={`text-[10px] flex items-center gap-1.5 transition-all ${playingMessageId === msg.id ? 'text-medical-600 font-bold scale-105' : 'text-gray-500 hover:text-medical-600'}`}>
                                                        <i className={`fas ${playingMessageId === msg.id ? (isAudioLoading ? 'fa-spinner fa-spin' : 'fa-stop') : 'fa-volume-up'}`}></i> {playingMessageId === msg.id ? (isAudioLoading ? 'Loading...' : 'Stop') : 'Speak'}
                                                    </button>
                                                    <button onClick={() => copyToClipboard(msg.id, msg.text)} className={`text-[10px] flex items-center gap-1.5 transition-all ${copiedId === msg.id ? 'text-medical-600 font-bold scale-105' : 'text-gray-500 hover:text-medical-600'}`}>
                                                        <i className={`fas ${copiedId === msg.id ? 'fa-check text-green-500' : 'fa-copy'}`}></i> {copiedId === msg.id ? 'Copied!' : 'Copy'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                        {isLoading && <div className="flex items-center gap-3 ml-12 animate-fade-in">
                            <div className="w-8 h-8 rounded-full bg-medical-50 border border-medical-100 flex items-center justify-center text-[10px] text-medical-600 shadow-sm">
                                <i className="fas fa-spinner fa-spin"></i>
                            </div>
                            <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-[10px] text-gray-500 shadow-sm border border-gray-100 font-medium">AI is thinking...</div>
                        </div>}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer */}
                    <div className="p-3 bg-[#f0f2f5] border-t border-gray-200 relative flex-shrink-0">
                        {showSuggestions && (
                            <div className="mb-4 flex flex-col gap-2 animate-popup-in px-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <i className="fas fa-lightbulb text-yellow-500"></i> Suggestions
                                    </p>
                                    <button onClick={() => setShowSuggestions(false)} className="text-gray-400 hover:text-red-500 text-[10px] px-2 py-0.5 rounded-full hover:bg-gray-200 transition-colors">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {dynamicSuggestions.map((suggestion, i) => (
                                        <button key={i} onClick={() => handleSubmit(null, suggestion.text.replace(/🤒|💊|📍|🤢|⏰|✨/g, '').trim())} className="whitespace-nowrap bg-white border border-medical-200 px-3 py-2 rounded-full text-xs font-semibold text-medical-700 hover:bg-medical-50 hover:border-medical-300 transition-all flex items-center gap-2 shadow-sm active:scale-95">
                                            <i className={`fas ${suggestion.icon} text-medical-500`}></i> {suggestion.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedImage && (
                            <div className="mb-2 flex items-center gap-3 animate-popup-in bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                                <img src={selectedImage} className="w-12 h-12 rounded-lg object-cover border border-gray-50 shadow-inner" />
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-gray-500">Image attached</p>
                                    <button onClick={() => setSelectedImage(null)} className="text-red-500 text-[10px] font-bold hover:underline">Remove</button>
                                </div>
                            </div>
                        )}
                        
                        {showTranslate && (
                            <div className="absolute bottom-[calc(100%+10px)] left-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[110] flex flex-col max-h-[300px] animate-popup-in overflow-hidden">
                                <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                    <span className="text-xs font-bold text-gray-600">Translate Chat</span>
                                    <button onClick={() => setShowTranslate(false)} className="text-gray-400 hover:text-red-500 transition-colors"><i className="fas fa-times text-[10px]"></i></button>
                                </div>
                                <div className="p-2">
                                    <div className="relative mb-2">
                                        <i className="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]"></i>
                                        <input type="text" placeholder="Search language..." value={searchLang} onChange={(e) => setSearchLang(e.target.value)} className="w-full text-[11px] py-2 pl-8 pr-2 bg-gray-50 border-none rounded-lg focus:ring-1 focus:ring-medical-500 transition-all" />
                                    </div>
                                    <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[180px] custom-scrollbar">
                                        {filteredLanguages.map(lang => (
                                            <button key={lang.code} onClick={() => { setSelectedLanguage(lang.code); setShowTranslate(false); }} className={`flex items-center gap-3 text-left text-[11px] p-2.5 rounded-lg transition-colors ${selectedLanguage === lang.code ? 'bg-medical-50 text-medical-700 font-bold shadow-sm' : 'hover:bg-gray-50 text-gray-600'}`}>
                                                <span className="text-sm">{lang.flag}</span>
                                                <span className="truncate flex-1">{lang.name}</span>
                                                {selectedLanguage === lang.code && <i className="fas fa-check text-[8px] text-medical-500"></i>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={(e) => handleSubmit(e)} className="flex items-center gap-1.5">
                            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileSelect} />
                            <input type="file" ref={scanInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleCameraScan} />

                            <div className="flex items-center bg-white rounded-full shadow-inner border border-gray-100 p-0.5">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-medical-600 transition-all hover:scale-110 active:scale-95" title="Upload Image"><i className="fas fa-plus"></i></button>
                                <button type="button" onClick={() => scanInputRef.current?.click()} className={`w-9 h-9 flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${isScanning ? 'text-medical-600 animate-spin' : 'text-gray-400 hover:text-medical-600'}`} title="Scan Medicine"><i className="fas fa-camera"></i></button>
                                <button type="button" onClick={() => setShowTranslate(!showTranslate)} className={`w-9 h-9 flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${selectedLanguage !== 'English' || showTranslate ? 'text-medical-600' : 'text-gray-400 hover:text-medical-600'}`} title="Translate"><i className="fas fa-language text-xl"></i></button>
                                <button type="button" onClick={startLiveSession} className="w-9 h-9 flex items-center justify-center text-medical-600 hover:scale-110 active:scale-95 transition-all" title="Live Talk"><i className="fas fa-microphone text-lg"></i></button>
                            </div>
                            
                            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={isLive ? "Talking..." : `Type in ${selectedLanguage}...`} className="flex-1 bg-white border-none rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-medical-500 shadow-inner min-w-0" disabled={isLive} />
                            
                            <button type="submit" disabled={(!inputValue.trim() && !selectedImage) || isLive || isLoading} className="w-10 h-10 rounded-full bg-medical-600 text-white flex items-center justify-center shadow-lg hover:bg-medical-700 disabled:opacity-50 transition-all active:scale-90 flex-shrink-0 transform">
                                {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AIChat;