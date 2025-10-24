// index.js
import express from "express";
import puppeteer from "puppeteer";

const app = express();

// Trang test để kiểm tra server có chạy không
app.get("/", (req, res) => {
  res.send("🚀 Server Puppeteer đang chạy thành công trên Render!");
});

// API chính: /screenshot?url=https://example.com
app.get("/screenshot", async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).send("Thiếu tham số ?url=");
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // bắt buộc cho Render
    });

    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: "networkidle0" });

    // Chụp toàn bộ trang
    const buffer = await page.screenshot({ fullPage: true });

    await browser.close();

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi khi chụp ảnh trang web");
  }
});

// Render sẽ cung cấp biến PORT, phải dùng cái này
const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`✅ Server Puppeteer chạy tại cổng ${port}`));
