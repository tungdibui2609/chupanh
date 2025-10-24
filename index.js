import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/", (req, res) => {
  res.send("🚀 Server Puppeteer chụp ảnh khổ A4 hoạt động!");
});

app.get("/screenshot", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Thiếu tham số ?url=");

  try {
    console.log("🌐 Đang mở trang:", url);

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

    // ⚙️ Đặt kích thước khổ A4 (96 DPI)
    await page.setViewport({ width: 794, height: 1123 });

    // 🕐 Truy cập URL
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });


     // ✅ Đợi 10 giây cho trang load/render hoàn tất
    console.log("⏳ Đang đợi trang load đầy đủ (10 giây)...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 💬 Thêm CSS để đảm bảo font chữ hiển thị rõ
    await page.addStyleTag({
      content: `
        body {
          font-family: 'Roboto', 'Arial', sans-serif !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `,
    });

    // 📸 Chụp ảnh khổ A4, không chụp toàn trang
    const buffer = await page.screenshot({
      type: "png",
      fullPage: false,
      captureBeyondViewport: false,
      omitBackground: false,
    });

    await browser.close();

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (error) {
    console.error("❌ Lỗi Puppeteer:", error);
    res.status(500).send("Lỗi khi chụp ảnh trang web");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server chạy tại cổng ${PORT}`));
