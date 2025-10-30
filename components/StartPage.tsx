import React, { useState } from 'react';
import { SendIcon } from './icons';

interface StartPageProps {
    onStartChat: (message: string) => void;
}

const StartPage: React.FC<StartPageProps> = ({ onStartChat }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onStartChat(text);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col items-center justify-center p-8 text-center h-[95vh] md:h-[90vh]">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg -mt-20 mb-8">
                <h1 className="text-4xl font-bold">Электронный психолог</h1>
                <p className="text-md opacity-90 mt-2">Ваш конфиденциальный ИИ-помощник</p>
            </div>
            <div className="w-full max-w-lg">
                <p className="text-gray-600 mb-4">
                    Это безопасное пространство, где вы можете поделиться своими мыслями и чувствами. Я здесь, чтобы выслушать вас без осуждения и помочь найти путь к гармонии.
                </p>
                <p className="text-gray-600 mb-6">
                    Чтобы начать, просто опишите, что вас беспокоит, в поле ниже.
                </p>
                <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Сегодня я чувствую..."
                        className="w-full p-4 rounded-2xl border-gray-300 border bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none shadow-sm"
                        rows={4}
                    />
                    <button
                        type="submit"
                        disabled={!text.trim()}
                        className="mt-4 bg-indigo-600 text-white rounded-full py-3 px-8 font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
                        aria-label="Начать диалог"
                    >
                        <SendIcon />
                        <span className="ml-2">Начать диалог</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StartPage;