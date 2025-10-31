import React from 'react';
import { DownloadIcon, NewChatIcon } from './icons';

interface SummaryMessageBubbleProps {
    summaryText: string;
    onNewChat: () => void;
}

const SummaryMessageBubble: React.FC<SummaryMessageBubbleProps> = ({ summaryText, onNewChat }) => {
    
    const handleSave = () => {
        window.print();
    };

    return (
        <div className="flex justify-center">
            <div id="printable-summary" className="w-full max-w-full p-6 my-4 rounded-2xl shadow-lg bg-gradient-to-br from-green-500 to-teal-500 text-white">
                 <h2 className="text-xl font-bold mb-4">Итоги сессии и рекомендации</h2>
                 <div className="prose prose-invert prose-lg text-gray-100 whitespace-pre-wrap">
                    {summaryText}
                </div>
                <div className="mt-6 pt-4 border-t border-white/30 flex justify-center items-center space-x-4 no-print">
                    <button
                        onClick={handleSave}
                        className="bg-white/20 text-white font-semibold rounded-lg px-5 py-3 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-teal-500 focus:ring-white flex items-center"
                        aria-label="Сохранить как PDF"
                    >
                       <DownloadIcon /> <span className="ml-2">Сохранить как PDF</span>
                    </button>
                    <button
                        onClick={onNewChat}
                        className="bg-white/20 text-white font-semibold rounded-lg px-5 py-3 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-teal-500 focus:ring-white flex items-center"
                        aria-label="Начать новый диалог"
                    >
                        <NewChatIcon /> <span className="ml-2">Начать новый диалог</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SummaryMessageBubble;
