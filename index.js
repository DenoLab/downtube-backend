const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const ytdlp = require('yt-dlp-exec');
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
}

app.post('/download', async (req, res) => {
    const videoUrl = req.body.url;

    if (!videoUrl) {
        return res.status(400).json({ error: 'Thiếu URL video!' });
    }

    try {
        // 🟢 Lấy tiêu đề video bằng yt-dlp-exec
        const title = await ytdlp(videoUrl, { getTitle: true });

        const cleanTitle = title.trim().replace(/[<>:"/\\|?*]+/g, '').replace(/\s+/g, '_');
        const outputFileName = `${cleanTitle}.mp4`;
        const outputFilePath = path.join(downloadsDir, outputFileName);

        // 🎯 Tải video bằng yt-dlp-exec
        await ytdlp(videoUrl, {
            output: outputFilePath,
            format: 'bestvideo+bestaudio/best'
        });

        const encodedFileName = encodeURIComponent(outputFileName);
        res.json({
            message: 'Tải video thành công!',
            downloadLink: `https://your-backend.onrender.com/downloads/${encodedFileName}`,
            fileName: outputFileName
        });
    } catch (error) {
        console.error('Lỗi tải video:', error);
        res.status(500).json({ error: 'Tải video thất bại!', details: error.message });
    }
});

// 🖥️ Cung cấp file để tải về
app.use('/downloads', express.static(downloadsDir));

app.listen(port, () => {
    console.log(`Server chạy tại: http://localhost:${port}`);
});
