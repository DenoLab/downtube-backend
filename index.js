const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// 📁 Đảm bảo thư mục downloads tồn tại
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
}

// 🎬 API tải video từ YouTube
app.post('/download', (req, res) => {
    const videoUrl = req.body.url;

    if (!videoUrl) {
        return res.status(400).json({ error: 'Thiếu URL video!' });
    }

    // 🔑 Dùng yt-dlp để lấy tiêu đề video
    exec(`yt-dlp --get-title "${videoUrl}"`, (error, title) => {
        if (error) {
            return res.status(500).json({ error: 'Lấy tiêu đề thất bại!', details: error.message });
        }

        // 🟢 Làm sạch tiêu đề video (xóa ký tự đặc biệt)
        const cleanTitle = title.trim().replace(/[<>:"/\\|?*]+/g, '').replace(/\s+/g, '_');
        const outputFileName = `${cleanTitle}.mp4`;
        const outputFilePath = path.join(downloadsDir, outputFileName);

        // 🎯 Tải video với tiêu đề đã lấy
        const command = `yt-dlp -o "${outputFilePath}" "${videoUrl}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                return res.status(500).json({ error: 'Tải video thất bại!', details: stderr });
            }

            // ✅ Mã hóa URL để tránh lỗi tên file có khoảng trắng
            const encodedFileName = encodeURIComponent(outputFileName);

            res.json({
                message: 'Tải video thành công!',
                downloadLink: `http://localhost:${port}/downloads/${encodedFileName}`,
                fileName: outputFileName
            });
        });
    });
});

// 🖥️ Cung cấp file video để tải về
app.use('/downloads', express.static(downloadsDir));

// 🚀 Khởi động server
app.listen(port, () => {
    console.log(`Server chạy tại: http://localhost:${port}`);
});
