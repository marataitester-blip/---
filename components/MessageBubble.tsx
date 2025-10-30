
import React from 'react';
import { Message, Sender } from '../types';
import { APPROACH_STYLES } from '../constants';
import { SoundIcon, StopIcon } from './icons';

interface MessageBubbleProps {
    message: Message;
    isPlaying: boolean;
    onPlaySound: (text: string, messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isPlaying, onPlaySound }) => {
    const isUser = message.sender === Sender.User;

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow ${
                isUser 
                ? 'bg-indigo-600 text-white rounded-br-lg' 
                : 'bg-gray-200 text-gray-800 rounded-bl-lg'
            }`}>
                <p className="text-base whitespace-pre-wrap">{message.text}</p>
                {!isUser && message.approach && (
                    <div className="mt-2 flex items-center">
                        <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${APPROACH_STYLES[message.approach].className}`}>
                            {APPROACH_STYLES[message.approach].name}
                        </span>
                        <button 
                            onClick={() => onPlaySound(message.text, message.id)}
                            className="ml-3 bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            aria-label={isPlaying ? "Остановить озвучивание" : "Озвучить сообщение"}
                        >
                            {isPlaying ? <StopIcon /> : <SoundIcon />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
