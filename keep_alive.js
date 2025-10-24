// keep_alive.js
import fetch from "node-fetch";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function keepAlive() {
  const url = "https://chupanh.onrender.com/health"; // ⚠️ đổi URL nếu cần

  while (true) {
    try {
      const res = await fetch(url);
      console.log(`✅ Ping ${url} - ${res.status}`);
    } catch (err) {
      console.error("❌ Ping lỗi:", err.message);
    }

    // Random 10–15 phút (Render không bao giờ ngủ nếu <15p)
    const minutes = Math.random() * (15 - 10) + 10;
    const delay = minutes * 60 * 1000;
    console.log(`⏳ Ping lại sau ${minutes.toFixed(1)} phút...\n`);
    await sleep(delay);
  }
}

keepAlive();
