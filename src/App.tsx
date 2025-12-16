import React, { useCallback } from 'react';
import parse from 'html-react-parser';
import { useAnkiFile, type AnkiCard } from './hooks/useAnkiFile';
import { MeshGradientSVG } from './components/MeshGradientSVG';

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
    <div className="min-h-screen bg-[#161912] text-white p-8 font-sans transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center flex flex-col items-center">
          <div className="mb-8 w-64 h-64">
            <MeshGradientSVG />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-white mb-4 drop-shadow-lg">
            DANKI
          </h1>
          <p className="text-blue-200 text-lg">
            convert, view and use .apkg (Anki) files quickly and in browser.
          </p>
        </header>

        {/* Drop Zone */}
        {status === 'idle' && (
          <div
            className="border-dashed border-4 border-blue-500/30 rounded-3xl p-20 text-center bg-white/5 backdrop-blur-sm shadow-xl hover:border-blue-400 hover:bg-white/10 transition-all cursor-pointer group"
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
                <p className="text-2xl font-bold text-white mb-2">
                  Drag & Drop an .apkg file
                </p>
                <p className="text-blue-200">
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
            <p className="text-xl text-blue-200 font-medium">Extracting & loading Anki database...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-900/20 border-l-4 border-red-500 p-6 mb-8 rounded-r-lg shadow-sm">
            <h3 className="text-red-400 font-bold text-lg mb-2">Error Processing File</h3>
            <p className="text-red-200">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-500/20 text-red-200 rounded-md font-medium hover:bg-red-500/30 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Cards List */}
        {status === 'ready' && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white">
                Found {cards.length} Cards
              </h2>
              <button
                onClick={() => window.location.reload()}
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
          {card.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full font-semibold tracking-wide">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
