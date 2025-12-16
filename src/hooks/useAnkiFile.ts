import { useState } from 'react';
import initSqlJs from 'sql.js';
import JSZip from 'jszip';
import { decompress } from 'fzstd';

export interface AnkiCard {
    id: number;
    front: string;
    back: string;
    tags: string[];
}

export interface UseAnkiFileReturn {
    status: 'idle' | 'loading' | 'ready' | 'error';
    cards: AnkiCard[];
    error: string | null;
    fileList: string[];
    processFile: (file: File) => Promise<void>;
}

export const useAnkiFile = (): UseAnkiFileReturn => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
    const [cards, setCards] = useState<AnkiCard[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [fileList, setFileList] = useState<string[]>([]);

    const processFile = async (file: File) => {
        setStatus('loading');
        setError(null);
        setCards([]);

        try {
            console.log('Loading file...');
            const zip = new JSZip();
            const content = await zip.loadAsync(file);

            const files = Object.keys(content.files);
            console.log('Files in zip:', files);
            setFileList(files);

            let dbData: Uint8Array;

            const dbFileV21b = content.file('collection.anki21b');
            const dbFileV21 = content.file('collection.anki21');
            const dbFileV2 = content.file('collection.anki2');

            if (dbFileV21b) {
                console.log('Found collection.anki21b (Zstd compressed). Decompressing...');
                const compressedData = await dbFileV21b.async('uint8array');
                dbData = decompress(compressedData);
            } else if (dbFileV21) {
                console.log('Found collection.anki21 (Zstd compressed). Decompressing...');
                const compressedData = await dbFileV21.async('uint8array');
                dbData = decompress(compressedData);
            } else if (dbFileV2) {
                console.log('Found collection.anki2 (Standard).');
                // Check if it's the stub file by looking for other versions first (done above)
                // If we are here, it's either a real v2 file or we failed to find the newer ones.
                // However, the stub file usually co-exists with v21/v21b.
                // Since we check v21/v21b FIRST, we should be safe.
                dbData = await dbFileV2.async('uint8array');
            } else {
                throw new Error('Invalid .apkg file: neither collection.anki2, .anki21, nor .anki21b found.');
            }

            console.log('Initializing SQL.js...');
            const SQL = await initSqlJs({
                locateFile: (file) => `/${file}`
            });

            console.log('Mounting database...');
            const db = new SQL.Database(dbData);

            const query = `
        SELECT c.id, n.flds, n.tags
        FROM cards c
        JOIN notes n ON c.nid = n.id
        LIMIT 1000 -- Limit for safety in POC
      `;

            const stmt = db.prepare(query);
            const extractedCards: AnkiCard[] = [];

            while (stmt.step()) {
                const row = stmt.getAsObject();
                const id = row.id as number;
                const flds = row.flds as string;
                const tagsStr = row.tags as string;

                // Split fields by Unit Separator
                const parts = flds.split('\x1f');
                const front = parts[0] || '';
                // Join the rest as back, or just second part? 
                // Usually index 0 is front, index 1..n is extra. 
                // For simple display, let's take parts[1] or join remaining.
                const back = parts.slice(1).join('<br/>');

                const tags = tagsStr ? tagsStr.trim().split(' ').filter(Boolean) : [];

                extractedCards.push({
                    id,
                    front,
                    back,
                    tags
                });
            }

            stmt.free();
            db.close();

            console.log(`Loaded ${extractedCards.length} cards.`);
            setCards(extractedCards);
            setStatus('ready');

        } catch (err: any) {
            console.error('Error processing Anki file:', err);
            setError(err.message || 'Unknown error occurred');
            setStatus('error');
        }
    };

    return { status, cards, error, processFile, fileList };
};
