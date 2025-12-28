import React, { useState, useEffect } from 'react';
import parse from 'html-react-parser';
import type { AnkiCard } from '../hooks/useAnkiFile';

interface StudySessionProps {
    cards: AnkiCard[];
    onExit: () => void;
}

export const StudySession: React.FC<StudySessionProps> = ({ cards, onExit }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isDone, setIsDone] = useState(false);

    useEffect(() => {
        // Reset state when cards change (not strictly necessary if component unmounts, but good practice)
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsDone(false);
    }, [cards]);

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (currentIndex < cards.length - 1) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex((prev) => prev + 1), 150); // Small delay for animation feel if needed, or immediate
        } else {
            setIsDone(true);
        }
    };

    const handlePrevious = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (currentIndex > 0) {
            setIsFlipped(false);
            setCurrentIndex((prev) => prev - 1);
            setIsDone(false);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    if (isDone) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in text-center p-8">
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-3xl font-bold text-white mb-4">Session Complete!</h2>
                <p className="text-xl text-gray-300 mb-8">
                    You've studied all {cards.length} cards in this session.
                </p>
                <button
                    onClick={onExit}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/25 transition-all transform hover:scale-105"
                >
                    Back to List
                </button>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    return (
        <div className="max-w-3xl mx-auto w-full animate-fade-in">
            {/* Progress Header */}
            <div className="flex justify-between items-center mb-6 text-sm font-medium text-gray-400">
                <button
                    onClick={onExit}
                    className="hover:text-white transition-colors flex items-center gap-2"
                >
                    ← Back
                </button>
                <span className="bg-white/5 px-4 py-1 rounded-full">
                    Card {currentIndex + 1} of {cards.length}
                </span>
            </div>

            {/* Card Area */}
            <div
                className="relative perspective-1000 min-h-[400px] cursor-pointer group"
                onClick={handleFlip}
            >
                <div
                    className={`relative w-full h-full min-h-[400px] transition-all duration-500 transform-style-3d shadow-2xl rounded-2xl border border-white/10 bg-[#1C1F17] flex flex-col items-center justify-center p-8 text-center ${isFlipped ? 'rotate-y-180' : ''
                        }`}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front Face */}
                    <div
                        className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 overflow-y-auto custom-scrollbar"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-6">
                            Front
                        </h3>
                        <div className="text-2xl md:text-3xl font-serif text-white prose prose-invert max-w-none">
                            {parse(currentCard.front)}
                        </div>
                        <p className="absolute bottom-6 text-xs text-gray-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to flip
                        </p>
                    </div>

                    {/* Back Face */}
                    <div
                        className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 overflow-y-auto custom-scrollbar bg-black/20"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-6">
                            Back
                        </h3>
                        <div className="text-2xl md:text-3xl font-serif text-white prose prose-invert max-w-none">
                            {parse(currentCard.back)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center mt-8">
                <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${currentIndex === 0
                        ? 'opacity-0 pointer-events-none'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                >
                    ← Previous
                </button>

                {!isFlipped ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); handleFlip(); }}
                        className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all"
                    >
                        Show Answer
                    </button>
                ) : (
                    <div className="flex gap-4">
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105"
                        >
                            Next Card →
                        </button>
                    </div>
                )}

                <button
                    onClick={handleNext}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${currentIndex === cards.length - 1 && isFlipped === false // Hide 'Next' if on last card and haven't flipped yet, forcing them to flip first? Or just show it. Let's keep it simple.
                        ? 'opacity-0 pointer-events-none' // Actually, let's allow next always if we want, or hide if it's the right arrow.
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                        } ${isFlipped ? 'opacity-0 pointer-events-none' : ''}`} // Hide the simple right arrow if flipped, because generic Next button is there.
                >
                    Next →
                </button>
            </div>
        </div>
    );
};
