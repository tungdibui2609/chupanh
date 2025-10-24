import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/", (req, res) => {
  res.send("🚀 Server Puppeteer đang hoạt động!");
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

    // 📏 Khổ A4 tỷ lệ đúng, thu nhỏ 150 DPI
    await page.setViewport({
      width: 1240,
      height: 1754,
      deviceScaleFactor: 2,
    });

    console.log(`🌐 Mở trang: ${url}`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    console.log("⏳ Đang đợi load (5 giây)...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    // ✅ Chụp ảnh khổ A4, chất lượng cao
    const buffer = await page.screenshot({
      type: "jpeg",
      quality: 90,
      clip: { x: 0, y: 0, width: 1240, height: 1754 },
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
