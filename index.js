const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server đang chạy! Vui lòng dùng POST /download để tải video.');
});

const downloadDir = path.join(__dirname, 'downloads');

// Tạo thư mục downloads nếu chưa có
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir);
}

// API để tải video
app.post('/download', (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL không hợp lệ!' });
    }

    const outputPath = path.join(downloadDir, '%(title)s.%(ext)s');
    const command = `yt-dlp -o "${outputPath}" ${url}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: 'Tải video thất bại!', details: stderr });
        }

        // Tìm tên file đã tải
        const match = stdout.match(/Destination: (.*)/);
        if (match && match[1]) {
            const fileName = path.basename(match[1].trim());
            const fileUrl = `${req.protocol}://${req.get('host')}/files/${fileName}`;
            res.json({ message: 'Video tải thành công!', fileUrl });
        } else {
            res.status(500).json({ error: 'Không tìm thấy file đã tải!' });
        }
    });
});

// API để cung cấp file đã tải
app.use('/files', express.static(downloadDir));

// Chạy server
app.listen(port, () => {
    console.log(`Server đang chạy tại: http://localhost:${port}`);
});
