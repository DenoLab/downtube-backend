const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server đang chạy! Vui lòng dùng POST /download để tải video.');
});

// API để tải video từ YouTube
app.post('/download', (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL không hợp lệ!' });
    }

    const outputPath = path.join(__dirname, 'downloads', '%(title)s.%(ext)s');

    // Dùng yt-dlp để tải video
    const command = `yt-dlp -o "${outputPath}" ${url}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: 'Tải video thất bại!', details: stderr });
        }
        res.json({ message: 'Video tải thành công!', output: stdout });
    });
});

// Chạy server
app.listen(port, () => {
    console.log(`Server đang chạy tại: http://localhost:${port}`);
});
