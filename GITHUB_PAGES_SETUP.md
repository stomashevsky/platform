# Настройка GitHub Pages

## Шаги для включения GitHub Pages:

1. **Перейдите в Settings репозитория**
   - Откройте https://github.com/stomashevsky/platform
   - Кликните на **Settings** в верхнем меню

2. **Откройте раздел Pages**
   - В левом меню найдите **Pages** (в разделе "Code and automation")

3. **Настройте Source**
   - В разделе **Build and deployment**
   - Выберите **Source**: `GitHub Actions`
   - Нажмите **Save** (если есть кнопка)

4. **Проверьте workflow**
   - Перейдите на вкладку **Actions**
   - Должен запуститься workflow "Deploy Next.js to GitHub Pages"
   - Дождитесь его завершения (зелёная галочка ✅)

5. **Откройте сайт**
   - После успешного деплоя сайт будет доступен по адресу:
   - **https://stomashevsky.github.io/platform/**

## Если возникли проблемы:

### Ошибка "Pages not enabled"

Если GitHub Actions не может найти настройки Pages, попробуйте:

1. Временно выберите Source: `Deploy from a branch`
2. Выберите branch: `main` и folder: `/ (root)`
3. Сохраните
4. Подождите 1 минуту
5. Вернитесь и выберите Source: `GitHub Actions`

### Проверка permissions

Убедитесь что в Settings → Actions → General:
- Workflow permissions установлены на "Read and write permissions"
- Опция "Allow GitHub Actions to create and approve pull requests" включена

## Автоматический деплой

После настройки каждый push в ветку `main` будет автоматически:
1. Собирать проект (`npm run build`)
2. Создавать статические файлы в папке `out/`
3. Деплоить на GitHub Pages

Время деплоя: ~2-3 минуты

