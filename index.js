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

    // Khổ A4, 150 DPI
    await page.setViewport({
      width: 1240,
      height: 1754,
      deviceScaleFactor: 2,
    });

    console.log(`🌐 Mở trang: ${url}`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Đợi font Roboto load xong
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    });
    // Đợi thêm 300ms cho layout ổn định
    await new Promise(r => setTimeout(r, 300));

    // Chụp fullPage hoặc khổ A4 tuỳ ý
    const buffer = await page.screenshot({
      type: "jpeg",
      quality: 90,
      fullPage: true, // hoặc dùng clip nếu muốn cố định A4
      // clip: { x: 0, y: 0, width: 1240, height: 1754 },
    });

    await browser.close();

    res.setHeader("Content-Type", "image/jpeg");
    res.send(buffer);

  } catch (error) {
    console.error("❌ Lỗi Puppeteer:", error);
    res.status(500).send("Lỗi khi chụp ảnh trang web");
  }
});