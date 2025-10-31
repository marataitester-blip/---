import React, { useState } from 'react';
import { SendIcon } from './icons';

interface InputAreaProps {
    onSendMessage: (text: string) => void;
    disabled: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, disabled }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim() && !disabled) {
            onSendMessage(text);
            setText('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={disabled ? "Диалог завершен. Начните новый." : "Напишите ваше сообщение..."}
                    className="flex-1 w-full p-3 rounded-2xl border-gray-300 border bg-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none disabled:bg-gray-200"
                    rows={1}
                    style={{ maxHeight: '120px' }}
                    disabled={disabled}
                />
                <button 
                    type="submit" 
                    disabled={disabled || !text.trim()} 
                    className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    aria-label="Отправить сообщение"
                >
                    <SendIcon />
                </button>
            </form>
        </div>
    );
};

export default InputArea;