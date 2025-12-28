import type { AnkiCard } from '../hooks/useAnkiFile';

export const downloadQuizletCSV = (cards: AnkiCard[]) => {
    // headers
    const headers = ['Term', 'Definition'];

    // simple html strip helper but preserving newlines
    const stripHtml = (html: string) => {
        // First replace <br> with newlines
        let text = html.replace(/<br\s*\/?>/gi, '\n');

        // Then strip other tags
        const doc = new DOMParser().parseFromString(text, 'text/html');
        return doc.body.textContent || "";
    }

    // escape for CSV
    const escapeCsv = (str: string) => {
        // If it contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
        if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const rows = cards.map(card => {
        const front = stripHtml(card.front);
        const back = stripHtml(card.back);

        return [escapeCsv(front), escapeCsv(back)].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'anki_export_quizlet.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
