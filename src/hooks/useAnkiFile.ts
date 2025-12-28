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
    processFiles: (files: File[]) => Promise<void>;
}

export const useAnkiFile = (): UseAnkiFileReturn => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
    const [cards, setCards] = useState<AnkiCard[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [fileList, setFileList] = useState<string[]>([]);

    const processFiles = async (files: File[]) => {
        setStatus('loading');
        setError(null);
        setCards([]); // Clear previous cards for now, or could append? Let's clear for new batch.

        const allCards: AnkiCard[] = [];
        const allFilesList: string[] = [];

        try {
            console.log(`Processing ${files.length} files...`);

            // Initialize SQL.js
            console.log('Initializing SQL.js...');
            const SQL = await initSqlJs({
                locateFile: () => `${import.meta.env.BASE_URL}sql-wasm.wasm`
            });

            for (const file of files) {
                console.log(`Loading file: ${file.name}`);
                const zip = new JSZip();
                const content = await zip.loadAsync(file);

                const zipEntries = Object.keys(content.files);
                console.log(`Files in zip ${file.name}:`, zipEntries);
                allFilesList.push(...zipEntries.map(f => `${file.name}: ${f}`));

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
                    dbData = await dbFileV2.async('uint8array');
                } else {
                    console.warn(`Skipping invalid .apkg file ${file.name}: neither collection.anki2, .anki21, nor .anki21b found.`);
                    continue; // Skip this file but continue others
                }

                console.log(`Mounting database for ${file.name}...`);
                const db = new SQL.Database(dbData);

                const query = `
                    SELECT c.id, n.flds, n.tags
                    FROM cards c
                    JOIN notes n ON c.nid = n.id
                    LIMIT 1000 -- Limit for safety per file
                `;

                const stmt = db.prepare(query);

                while (stmt.step()) {
                    const row = stmt.getAsObject();
                    const id = row.id as number;
                    const flds = row.flds as string;
                    const tagsStr = row.tags as string;

                    // Split fields by Unit Separator
                    const parts = flds.split('\x1f');
                    const front = parts[0] || '';
                    const back = parts.slice(1).join('<br/>');

                    const tags = tagsStr ? tagsStr.trim().split(' ').filter(Boolean) : [];

                    allCards.push({
                        id, // Note: IDs might collide across decks, but for display it's probably fine.
                        front,
                        back,
                        tags
                    });
                }

                stmt.free();
                db.close();
            }

            setFileList(allFilesList);
            console.log(`Loaded total ${allCards.length} cards.`);
            setCards(allCards);
            setStatus('ready');

        } catch (err: any) {
            console.error('Error processing Anki files:', err);
            setError(err.message || 'Unknown error occurred');
            setStatus('error');
        }
    };

    return { status, cards, error, processFiles, fileList };
};
