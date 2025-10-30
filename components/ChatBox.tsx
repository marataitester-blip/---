
import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';

interface ChatBoxProps {
    messages: Message[];
    isLoading: boolean;
    isPlaying: string | null;
    onPlaySound: (text: string, messageId: string) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, isLoading, isPlaying, onPlaySound }) => {
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} isPlaying={isPlaying === msg.id} onPlaySound={onPlaySound} />
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-800 rounded-2xl rounded-bl-lg p-3 max-w-xs animate-pulse">
                        <div className="flex items-center space-x-1">
                           <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                           <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                           <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={endOfMessagesRef} />
        </div>
    );
};

export default ChatBox;
