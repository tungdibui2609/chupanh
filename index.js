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

    // ✅ Đặt viewport lớn + tăng độ nét ảnh
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2,
    });

    console.log(`🌐 Đang mở trang: ${url}`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // ✅ Đợi 10 giây cho trang load/render hoàn tất
    console.log("⏳ Đang đợi trang load đầy đủ (10 giây)...");
    await page.waitForTimeout(10000);

    // ✅ Cuộn xuống cuối trang để load hết nội dung lazy load
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // ✅ Chụp ảnh toàn trang, chất lượng cao
    const buffer = await page.screenshot({
      fullPage: true,
      type: "jpeg",
      quality: 100,
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
