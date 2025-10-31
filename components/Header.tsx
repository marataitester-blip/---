import React from 'react';

interface HeaderProps {
    onEndChat?: () => void;
    isSummarizing?: boolean;
    isSessionEnded?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onEndChat, isSummarizing, isSessionEnded }) => {
    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-t-2xl text-center shadow-md flex justify-between items-center">
            <div className="text-left">
                <h1 className="text-2xl font-bold">Электронный психолог</h1>
                <p className="text-sm opacity-90 mt-1">Ваш конфиденциальный помощник</p>
            </div>
            {onEndChat && (
                <button
                    onClick={onEndChat}
                    disabled={isSummarizing || isSessionEnded}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-red-400 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                    {isSummarizing ? 'Создание...' : 'Завершить диалог'}
                </button>
            )}
        </div>
    );
};

export default Header;