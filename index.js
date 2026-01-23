import express from "express";
import puppeteer from "puppeteer";
const app = express();
app.get("/health", (req, res) => res.send("ok"));
app.get("/", (req, res) => {
    res.send("🚀 Server Puppeteer Render hoạt động!");
});
app.get("/screenshot", async (req, res) => {
    const url = req.query.url;
    // [NEW] Nhận tham số width từ client, mặc định là 1240 nếu không truyền
    const widthParam = req.query.width;
    const targetWidth = widthParam ? parseInt(widthParam) : 1240;
    if (!url) return res.status(400).send("Thiếu tham số ?url=");
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--no-zygote",
                "--single-process",
            ],
        });
        const page = await browser.newPage();
        // Khổ A4, 150 DPI (Height 1754 là A4 @ 150dpi, Width tùy chỉnh)
        // deviceScaleFactor: 2 giúp ảnh sắc nét (Retina)
        await page.setViewport({ width: targetWidth, height: 1754, deviceScaleFactor: 2 });
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
        // (tuỳ chọn) Bơm Google Fonts
        await page.addStyleTag({
            content: `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        * { font-family: 'Roboto', sans-serif !important; }
      `,
        });
        // Đợi font load
        await page.evaluate(async () => {
            if (document.fonts && document.fonts.ready) {
                await document.fonts.ready;
            }
        });
        // Đợi QR sẵn sàng và decode
        await page.waitForSelector('#print-ready', { timeout: 15000 }).catch(() => { });
        await page.evaluate(async () => {
            const img = document.querySelector('img[alt="QR"]');
            if (img && img.decode) { try { await img.decode(); } catch { } }
        });
        // Lấy vị trí đáy QR
        const qrBottom = await page.evaluate(() => {
            const img = document.querySelector('img[alt="QR"]');
            if (!img) return null;
            const r = img.getBoundingClientRect();
            return Math.ceil(r.bottom + window.scrollY);
        });
        // Đợi thêm 300ms cho layout ổn định
        await new Promise(r => setTimeout(r, 300));
        // Chụp ảnh
        let buffer;
        // Lấy thông tin viewport hiện tại để giữ nguyên width khi resize height
        const currentViewport = page.viewport();
        if (qrBottom && Number.isFinite(qrBottom)) {
            const padding = 35;
            const desiredHeight = Math.min(qrBottom + padding, 8000); // Giới hạn chiều cao tối đa
            await page.setViewport({
                width: currentViewport.width, // Giữ nguyên width đã set ban đầu (targetWidth)
                height: desiredHeight,
                deviceScaleFactor: currentViewport.deviceScaleFactor || 2,
            });
            buffer = await page.screenshot({ type: "jpeg", quality: 95, fullPage: false });
        } else {
            buffer = await page.screenshot({ type: "jpeg", quality: 95, fullPage: true });
        }
        await browser.close();
        res.setHeader("Content-Type", "image/jpeg");
        res.send(buffer);
    } catch (error) {
        console.error("❌ Lỗi Puppeteer:", error);
        res.status(500).send("Lỗi khi chụp ảnh trang web");
    }
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server chạy tại cổng ${PORT}`));
