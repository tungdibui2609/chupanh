#!/usr/bin/env bash
echo "🧩 Cài Chrome cho Puppeteer..."
npx puppeteer browsers install chrome

echo "🧩 Cài font Roboto..."
apt-get update -y && apt-get install -y fonts-roboto fonts-noto fonts-noto-cjk

echo "🚀 Khởi động server..."
node index.js
