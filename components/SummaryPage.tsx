import React from 'react';
import { DownloadIcon, NewChatIcon } from './icons';

interface SummaryPageProps {
    summaryText: string;
    onNewChat: () => void;
}

const SummaryPage: React.FC<SummaryPageProps> = ({ summaryText, onNewChat }) => {
    
    const handleSave = () => {
        window.print();
    };

    return (
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col h-[95vh] md:h-[90vh]">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-5 rounded-t-2xl text-center shadow-md">
                <h1 className="text-2xl font-bold">Итоги сессии и рекомендации</h1>
                <p className="text-sm opacity-90 mt-1">Ваши персональные шаги к улучшению</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                <div id="printable-summary">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Рекомендации по итогам нашего диалога:</h2>
                    <div className="prose prose-lg text-gray-700 whitespace-pre-wrap">
                        {summaryText}
                    </div>
                </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl flex justify-center items-center space-x-4 no-print">
                <button
                    onClick={handleSave}
                    className="bg-indigo-600 text-white font-semibold rounded-lg px-5 py-3 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                    aria-label="Сохранить как PDF"
                >
                   <DownloadIcon /> Сохранить как PDF
                </button>
                <button
                    onClick={onNewChat}
                    className="bg-gray-600 text-white font-semibold rounded-lg px-5 py-3 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
                    aria-label="Начать новый диалог"
                >
                    <NewChatIcon /> Начать новый диалог
                </button>
            </div>
        </div>
    );
};

export default SummaryPage;