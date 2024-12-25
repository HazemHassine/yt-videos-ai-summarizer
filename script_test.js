const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { DOMParser } = require('xmldom');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Endpoint to fetch transcript
app.post('/api/transcript', async (req, res) => {
    const { videoId, language } = req.body;

    if (!videoId || !language) {
        return res.status(400).json({ error: 'Video ID and language are required.' });
    }

    try {
        const videoUrl = `https://youtu.be/${videoId}`;

        // Fetch the YouTube video page
        const youtubeResponse = await fetch(videoUrl);
        if (!youtubeResponse.ok) {
            throw new Error('Could not fetch transcript. Make sure the video has subtitles in the selected language.');
        }

        let youtubeText = await youtubeResponse.text();
        youtubeText = youtubeText.replace(/\\u0026/g, '&'); // Replace escaped `&`

        // Extract all `timedtext` URLs from the page
        const regex = /\/api\/timedtext\?[^"]+/g;
        const matches = youtubeText.match(regex);

        if (!matches) {
            throw new Error('No transcript URLs found on the video page. The video may not have subtitles.');
        }

        // Filter URLs to find one with the desired language
        const transcriptUrls = matches.map(match => `https://www.youtube.com${match}`);
        const languageUrl = transcriptUrls.find(url => url.includes(`lang=${language}`));

        if (!languageUrl) {
            throw new Error(`No subtitles found for the requested language: ${language}.`);
        }

        // Fetch the transcript XML
        const transcriptResponse = await fetch(languageUrl);
        if (!transcriptResponse.ok) {
            throw new Error('Failed to fetch transcript from the subtitle URL.');
        }

        const transcriptXml = await transcriptResponse.text();

        // Parse the XML to extract transcript text
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(transcriptXml, 'application/xml');
        const textElements = xmlDoc.getElementsByTagName('text');

        if (!textElements.length) {
            throw new Error('No transcript text found in the XML response.');
        }

        // Combine all text elements into a single transcript
        const transcript = Array.from(textElements).map(node => node.textContent).join(' ');

        res.json({ transcript });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
