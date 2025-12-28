import React from 'react';
import parse from 'html-react-parser';
import type { AnkiCard } from '../hooks/useAnkiFile';

interface DeckListViewProps {
    cards: AnkiCard[];
    fileList: string[];
    onLoadAnother: () => void;
}

export const DeckListView: React.FC<DeckListViewProps> = ({ cards, fileList, onLoadAnother }) => {
    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-white">
                    Found {cards.length} Cards
                </h2>
                <button
                    onClick={onLoadAnother}
                    className="text-sm text-blue-300 hover:text-white underline transition-colors"
                >
                    Load another file
                </button>
            </div>
            {cards.map((card) => (
                <CardView key={card.id} card={card} />
            ))}

            <div className="mt-12 p-4 bg-white/5 rounded-lg text-xs font-mono text-blue-300/70">
                <p className="font-bold mb-2">Debug Info (Files in archive):</p>
                <ul className="grid grid-cols-2 gap-2">
                    {fileList.map((f) => (
                        <li key={f}>{f}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const CardView = ({ card }: { card: AnkiCard }) => {
    return (
        <div className="bg-[#1C1F17] rounded-xl shadow-lg border border-white/5 overflow-hidden hover:border-blue-500/30 transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
                <div className="p-8 prose prose-invert prose-lg max-w-none">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Front</h3>
                    <div className="text-gray-200 leading-relaxed font-serif">
                        {parse(card.front)}
                    </div>
                </div>
                <div className="p-8 prose prose-invert prose-lg max-w-none bg-black/20">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Back</h3>
                    <div className="text-gray-200 leading-relaxed font-serif">
                        {parse(card.back)}
                    </div>
                </div>
            </div>
            {card.tags.length > 0 && (
                <div className="bg-black/40 px-8 py-4 border-t border-white/5 flex gap-2 flex-wrap">
                    {card.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full font-semibold tracking-wide"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};
