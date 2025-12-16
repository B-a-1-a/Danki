import React, { useCallback } from 'react';
import parse from 'html-react-parser';
import { useAnkiFile, type AnkiCard } from './hooks/useAnkiFile';

function App() {
  const { status, cards, error, processFiles, fileList } = useAnkiFile();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, [processFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Danki Viewer
          </h1>
          <p className="text-gray-500 text-lg">
            View your .apkg files instantly. Serverless & Local.
          </p>
        </header>

        {/* Drop Zone */}
        {status === 'idle' && (
          <div
            className="border-dashed border-4 border-gray-200 rounded-3xl p-20 text-center bg-white shadow-sm hover:border-blue-500 hover:bg-blue-50/20 transition-all cursor-pointer group"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <input
              type="file"
              id="fileInput"
              accept=".apkg"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="space-y-6 group-hover:scale-105 transition-transform">
              <div className="text-7xl">📂</div>
              <div>
                <p className="text-2xl font-bold text-gray-700 mb-2">
                  Drag & Drop an .apkg file
                </p>
                <p className="text-gray-400">
                  or click to browse your computer
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status */}
        {status === 'loading' && (
          <div className="text-center py-20 animate-fade-in">
            <div className="animate-spin text-5xl mb-6 inline-block">⏳</div>
            <p className="text-xl text-gray-600 font-medium">Extracting & loading Anki database...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-r-lg shadow-sm">
            <h3 className="text-red-800 font-bold text-lg mb-2">Error Processing File</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md font-medium hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Cards List */}
        {status === 'ready' && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Found {cards.length} Cards
              </h2>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-gray-500 hover:text-gray-800 underline"
              >
                Load another file
              </button>
            </div>
            {cards.map((card) => (
              <CardView key={card.id} card={card} />
            ))}

            <div className="mt-12 p-4 bg-gray-100 rounded-lg text-xs font-mono text-gray-500">
              <p className="font-bold mb-2">Debug Info (Files in archive):</p>
              <ul className="grid grid-cols-2 gap-2">
                {fileList.map(f => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const CardView = ({ card }: { card: AnkiCard }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        <div className="p-8 prose prose-lg max-w-none">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Front</h3>
          <div className="text-gray-900 leading-relaxed font-serif">
            {parse(card.front)}
          </div>
        </div>
        <div className="p-8 prose prose-lg max-w-none bg-gray-50/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Back</h3>
          <div className="text-gray-900 leading-relaxed font-serif">
            {parse(card.back)}
          </div>
        </div>
      </div>
      {card.tags.length > 0 && (
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex gap-2 flex-wrap">
          {card.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full font-semibold tracking-wide">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
