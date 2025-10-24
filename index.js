import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/screenshot", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Thiếu URL");

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
        "--no-zygote",
      ],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    const screenshot = await page.screenshot({ type: "png" });
    await browser.close();

    res.setHeader("Content-Type", "image/png");
    res.send(screenshot);
  } catch (err) {
    console.error("Lỗi:", err);
    res.status(500).send("Lỗi khi chụp ảnh trang web");
  }
});

app.get("/", (req, res) => {
  res.send("Server chụp ảnh đang chạy!");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server đang chạy tại cổng ${PORT}`));
