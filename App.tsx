import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Sender, PsychologicalApproach } from './types';
import { getChatResponse, getSpeech, getSummary } from './services/geminiService';
import Header from './components/Header';
import ChatBox from './components/ChatBox';
import InputArea from './components/InputArea';
import StartPage from './components/StartPage';
import SummaryPage from './components/SummaryPage';
import { decode, decodeAudioData } from './utils/audioUtils';

const initialMessage: Message = {
    id: 'initial-message',
    text: 'Здравствуйте! Я ваш электронный психолог. Расскажите, что вас беспокоит?',
    sender: Sender.Bot,
    approach: PsychologicalApproach.Integrative
};

const App: React.FC = () => {
    const [view, setView] = useState<'start' | 'chat' | 'summary'>('start');
    const [messages, setMessages] = useState<Message[]>([initialMessage]);
    const [summary, setSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }, []);
    
    const handleSendMessage = useCallback(async (text: string, isFirstMessage: boolean = false) => {
        if (!text.trim()) return;

        const userMessage: Message = { id: Date.now().toString(), text, sender: Sender.User };
        
        const currentMessages = isFirstMessage ? [initialMessage, userMessage] : [...messages, userMessage];
        setMessages(currentMessages);
        setIsLoading(true);

        try {
            const history = currentMessages.slice(0, -1).map(msg => ({
                role: msg.sender === Sender.User ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

            const botResponseData = await getChatResponse(history, text);

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponseData.response,
                sender: Sender.Bot,
                approach: botResponseData.approach
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Error getting chat response:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.',
                sender: Sender.Bot
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [messages]);

    const handleStartChat = useCallback(async (firstMessage: string) => {
        setView('chat');
        await handleSendMessage(firstMessage, true);
    }, [handleSendMessage]);

    const handleEndChat = useCallback(async () => {
        setIsSummarizing(true);
        try {
            const history = messages.map(msg => ({
                role: msg.sender === Sender.User ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));
            const summaryText = await getSummary(history);
            setSummary(summaryText);
            setView('summary');
        } catch (error) {
            console.error("Error getting summary:", error);
            // You might want to show an error message to the user here
            alert("Не удалось сформировать рекомендации. Пожалуйста, попробуйте позже.");
        } finally {
            setIsSummarizing(false);
        }
    }, [messages]);

    const handleNewChat = useCallback(() => {
        setMessages([initialMessage]);
        setSummary('');
        setView('start');
    }, []);
    
    const handlePlaySound = useCallback(async (text: string, messageId: string) => {
        if (isPlaying === messageId) {
            if (currentAudioSourceRef.current) {
                currentAudioSourceRef.current.stop();
            }
            setIsPlaying(null);
            return;
        }

        if (currentAudioSourceRef.current) {
            currentAudioSourceRef.current.stop();
        }
        
        setIsPlaying(messageId);

        try {
            const base64Audio = await getSpeech(text);
            if (base64Audio && audioContextRef.current) {
                 if (audioContextRef.current.state === 'suspended') {
                    await audioContextRef.current.resume();
                }
                const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    audioContextRef.current,
                    24000,
                    1
                );
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);
                source.onended = () => {
                    if (isPlaying === messageId) {
                       setIsPlaying(null);
                    }
                    currentAudioSourceRef.current = null;
                };
                source.start();
                currentAudioSourceRef.current = source;
            } else {
                 setIsPlaying(null);
            }
        } catch (error) {
            console.error("Error playing sound:", error);
            setIsPlaying(null);
        }
    }, [isPlaying]);

    const renderContent = () => {
        switch (view) {
            case 'start':
                return <StartPage onStartChat={handleStartChat} />;
            case 'chat':
                return (
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col h-[95vh] md:h-[90vh]">
                        <Header onEndChat={handleEndChat} isSummarizing={isSummarizing} />
                        <ChatBox messages={messages} isLoading={isLoading} isPlaying={isPlaying} onPlaySound={handlePlaySound} />
                        <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
                    </div>
                );
            case 'summary':
                return <SummaryPage summaryText={summary} onNewChat={handleNewChat} />;
            default:
                return <StartPage onStartChat={handleStartChat} />;
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-100 to-gray-300 flex justify-center items-center min-h-screen p-4 font-sans">
            {renderContent()}
        </div>
    );
};

export default App;