import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/", (req, res) => {
  res.send("🚀 Server Puppeteer Render hoạt động!");
});

app.get("/screenshot", async (req, res) => {
  const url = req.query.url;
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

    // 📏 Khổ A4 thu nhỏ (1240x1754px ~150 DPI)
    await page.setViewport({
      width: 1240,
      height: 1754,
      deviceScaleFactor: 2,
    });

    console.log(`🌐 Đang mở trang: ${url}`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // ⏳ Đợi font load xong
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    });
    await new Promise(r => setTimeout(r, 300));

    // 📸 Chụp ảnh
    const buffer = await page.screenshot({
      type: "jpeg",
      quality: 90,
      fullPage: true,
    });

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
