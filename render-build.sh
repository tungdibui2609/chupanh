#!/usr/bin/env bash
echo "🧩 Cài Chrome cho Puppeteer..."
npx puppeteer browsers install chrome

echo "🚀 Khởi động server và keep-alive..."
# Chạy keep_alive song song với Node server
node keep_alive.js &
node index.js
