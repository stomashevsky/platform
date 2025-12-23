#!/bin/bash

# Скрипт запуска Chrome с Remote Debugging
# Использование: ./scripts/start-chrome-debug.sh

echo "🔄 Закрытие всех экземпляров Chrome..."
pkill -9 -f "Google Chrome" 2>/dev/null
sleep 2

echo "📁 Создание временного профиля..."
mkdir -p /tmp/chrome-debug-profile

echo "🚀 Запуск Chrome с Remote Debugging на порту 9222..."
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug-profile \
  "https://platform.openai.com/chat" &

echo ""
echo "✅ Chrome запущен!"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Пройдите капчу Cloudflare (если появится)"
echo "   2. Авторизуйтесь на OpenAI Platform"
echo "   3. Дождитесь полной загрузки интерфейса"
echo "   4. Запустите: node scripts/extract-styles.js"
echo ""

