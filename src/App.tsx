import React, { useCallback, useState, useMemo } from 'react';
import { useAnkiFile } from './hooks/useAnkiFile';
import { downloadQuizletCSV } from './utils/csvExport';
import { MeshGradientSVG } from './components/MeshGradientSVG';
import { DeckListView } from './components/DeckListView';
import { StudyConfigModal } from './components/StudyConfigModal';
import { StudySession } from './components/StudySession';

function App() {
  const { status, cards, error, processFiles, fileList } = useAnkiFile();
  const [viewMode, setViewMode] = useState<'list' | 'study'>('list');
  const [showStudyConfig, setShowStudyConfig] = useState(false);
  const [studyCards, setStudyCards] = useState(cards);

  // Reset view mode when new files are loaded
  React.useEffect(() => {
    if (status === 'ready') {
      setViewMode('list');
      setShowStudyConfig(false);
    }
  }, [status]);

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

  // Extract all unique tags
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    cards.forEach(card => card.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [cards]);

  const handleStartStudy = (selectedTags: string[]) => {
    if (selectedTags.length === 0) {
      setStudyCards(cards);
    } else {
      setStudyCards(cards.filter(card =>
        card.tags.some(tag => selectedTags.includes(tag))
      ));
    }
    setShowStudyConfig(false);
    setViewMode('study');
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

        {/* Main Content */}
        {status === 'ready' && (
          <div className="animate-fade-in-up">
            {/* Action Buttons */}
            {viewMode === 'list' && (
              <div className="flex gap-4 mb-8 justify-center">
                <button
                  onClick={() => setShowStudyConfig(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105"
                >
                  🎓 Study Deck
                </button>
                <button
                  onClick={() => downloadQuizletCSV(cards)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 transition-all transform hover:scale-105"
                  title="Download as Quizlet CSV"
                >
                  📥 Download Quizlet CSV
                </button>
              </div>
            )}

            {viewMode === 'list' ? (
              <DeckListView
                cards={cards}
                fileList={fileList}
                onLoadAnother={() => window.location.reload()}
              />
            ) : (
              <StudySession
                cards={studyCards}
                onExit={() => setViewMode('list')}
              />
            )}
          </div>
        )}

        {/* Study Config Modal */}
        {showStudyConfig && (
          <StudyConfigModal
            availableTags={availableTags}
            onStartStudy={handleStartStudy}
            onCancel={() => setShowStudyConfig(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
