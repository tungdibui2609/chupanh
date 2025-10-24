import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/", (req, res) => {
  res.send("🚀 Server Puppeteer trên Render hoạt động!");
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

    // ✅ Đặt viewport lớn và độ nét cao
    await page.setViewport({
      width: 1920,          // hoặc 2560 cho 2K
      height: 1080,
      deviceScaleFactor: 2, // tăng độ nét ảnh gấp đôi
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // ✅ Chụp ảnh toàn trang với chất lượng cao
    const buffer = await page.screenshot({
      fullPage: true,
      type: "jpeg",   // hoặc "png" nếu bạn muốn giữ nền trong suốt
      quality: 100,   // 0–100, ảnh rõ nét nhất
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
