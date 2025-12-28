import React, { useState } from 'react';

interface StudyConfigModalProps {
    availableTags: string[];
    onStartStudy: (selectedTags: string[]) => void;
    onCancel: () => void;
}

export const StudyConfigModal: React.FC<StudyConfigModalProps> = ({
    availableTags,
    onStartStudy,
    onCancel,
}) => {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [mode, setMode] = useState<'all' | 'tags'>('all');

    const handleTagToggle = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleStart = () => {
        if (mode === 'all') {
            onStartStudy([]);
        } else {
            onStartStudy(selectedTags);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1C1F17] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">Study Configuration</h2>
                    <p className="text-gray-400 text-sm mt-1">Choose what you want to study</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex gap-4 p-1 bg-white/5 rounded-lg">
                        <button
                            onClick={() => setMode('all')}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'all'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Study All
                        </button>
                        <button
                            onClick={() => setMode('tags')}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'tags'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Filter by Tags
                        </button>
                    </div>

                    {mode === 'tags' && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-300">Select Tags:</h3>
                            <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                {availableTags.length === 0 ? (
                                    <p className="text-gray-500 text-sm italic">No tags found in this deck.</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {availableTags.map((tag) => (
                                            <button
                                                key={tag}
                                                onClick={() => handleTagToggle(tag)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedTags.includes(tag)
                                                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                                                        : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/20">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleStart}
                        disabled={mode === 'tags' && selectedTags.length === 0}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Start Session
                    </button>
                </div>
            </div>
        </div>
    );
};
