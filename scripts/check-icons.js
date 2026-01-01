const fs = require('fs');
const path = require('path');

// Копируем логику из code.ts
function getIconCategory(iconName) {
  const name = iconName.toLowerCase();
  
  // Navigation - arrows, chevrons, navigation controls
  if (name.includes('arrow') || name.includes('chevron') || name.includes('caret') || 
      name.includes('back') || name.includes('forward') || name.includes('next') || name.includes('previous') ||
      name.includes('home') || name.includes('openleft') || name.includes('openright') ||
      name.includes('globe') || name.includes('world') || name.includes('earth')) {
    return 'Navigation';
  }
  
  // Actions - all action-related icons
  if (name.includes('add') || name.includes('plus') || name.includes('create') || name.includes('new') ||
      name.includes('delete') || name.includes('remove') || name.includes('minus') || name.includes('clear') ||
      name.includes('trash') || name.includes('cleanup') ||
      name.includes('edit') || name.includes('pencil') || name.includes('modify') || name.includes('change') ||
      name.includes('write') ||
      name.includes('copy') || name.includes('duplicate') || name.includes('clone') ||
      name.includes('download') || name.includes('save') || name.includes('export') ||
      name.includes('upload') || name.includes('import') ||
      name.includes('search') || name.includes('magnify') || name.includes('find') || name.includes('telescope') ||
      name.includes('eye') || name.includes('view') || name.includes('visible') || name.includes('hidden') ||
      name.includes('show') || name.includes('hide') ||
      name.includes('filter') ||
      name.includes('logout') || name.includes('exit') || name.includes('enterlogin')) {
    return 'Actions';
  }
  
  // Communication
  if (name.includes('chat') || name.includes('message') || name.includes('mail') || name.includes('email') ||
      name.includes('comment') || name.includes('forum') || name.includes('notification') || name.includes('bell') ||
      name.includes('messaging')) {
    return 'Communication';
  }
  
  // Media - all media types (video, audio, images, controls)
  if (name.includes('video') || name.includes('caption') || name.includes('pictureinpicture') ||
      name.includes('image') || name.includes('picture') || name.includes('photo') || name.includes('camera') ||
      name.includes('mic') || name.includes('microphone') || name.includes('voice') || name.includes('sound') ||
      name.includes('audio') || name.includes('speak') || name.includes('speech') || name.includes('music') ||
      name.includes('play') || name.includes('pause') || name.includes('stop') || 
      name.includes('rewind') || name.includes('skip') || name.includes('loop')) {
    return 'Media';
  }
  
  // Files and documents
  if (name.includes('file') || name.includes('document') || name.includes('folder') || 
      name.includes('archive') || name.includes('page') || name.includes('notebook') || name.includes('notepad') ||
      name.includes('clipboard')) {
    return 'Files';
  }
  
  // Users
  if (name.includes('user') || name.includes('member') || name.includes('person') || 
      name.includes('people') || name.includes('group') || name.includes('avatar') || name.includes('profile')) {
    return 'Users';
  }
  
  // Settings
  if (name.includes('settings') || name.includes('config') || name.includes('gear') || 
      name.includes('preferences') || name.includes('options') || name.includes('customize')) {
    return 'Settings';
  }
  
  // Status - success, error, info
  if (name.includes('check') || name.includes('success') || name.includes('complete') || name.includes('done') ||
      name.includes('error') || name.includes('warning') || name.includes('alert') || name.includes('exclamation') ||
      name.includes('info') || name.includes('help') || name.includes('question')) {
    return 'Status';
  }
  
  // AI and automation
  if (name.includes('agent') || name.includes('assistant') || name.includes('ai') || 
      name.includes('brain') || name.includes('automation') || name.includes('bot') ||
      name.includes('sparkle') || name.includes('bolt') || name.includes('flash') ||
      name.includes('inspiration') || name.includes('gpt') || name.includes('sora')) {
    return 'AI & Automation';
  }
  
  // Analytics
  if (name.includes('chart') || name.includes('graph') || name.includes('analytics') || 
      name.includes('data') || name.includes('statistics') || name.includes('metrics') ||
      name.includes('bar')) {
    return 'Analytics';
  }
  
  // Interface - all interface elements
  if (name.includes('menu') || name.includes('hamburger') || name.includes('sidebar') || 
      name.includes('collapse') || name.includes('expand') || name.includes('minimize') || name.includes('maximize') ||
      name.includes('dock') || name.includes('dropdown') || name.includes('dots') || name.includes('more') ||
      name.includes('link') || name.includes('chain') || name.includes('connect') || name.includes('external') ||
      name.includes('code') || name.includes('function') || name.includes('variable') || name.includes('script') ||
      name.includes('grid') || name.includes('layout') || name.includes('table') ||
      name.includes('history') || name.includes('managehistory') ||
      name.includes('lightmode') || name.includes('darkmode') || name.includes('moon') || name.includes('sun') ||
      name.includes('colortheme') || name.includes('systemmode') ||
      name.includes('cursor') || name.includes('desktop') || name.includes('mobile')) {
    return 'Interface';
  }
  
  // Symbols
  if (name.includes('heart') || name.includes('star') || name.includes('bookmark') || name.includes('pin') ||
      name.includes('flag') || name.includes('tag') || name.includes('badge') || name.includes('wreath')) {
    return 'Symbols';
  }
  
  // Time
  if (name.includes('clock') || name.includes('time') || name.includes('calendar') || name.includes('date')) {
    return 'Time';
  }
  
  // Security
  if (name.includes('lock') || name.includes('key') || name.includes('secure') || name.includes('private') ||
      name.includes('shield') || name.includes('protection') || (name.includes('api') && name.includes('key'))) {
    return 'Security';
  }
  
  // Default category
  return 'Other';
}

function pascalToKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function generateSearchTags(iconName) {
  const words = iconName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
    .split(' ')
    .filter(w => w.length > 0);

  const tags = new Set(words);

  // Add synonyms for common words
  words.forEach(word => {
    switch (word) {
      case 'x':
        tags.add('close');
        tags.add('delete');
        tags.add('remove');
        tags.add('cancel');
        tags.add('exit');
        break;
      case 'crossed':
      case 'cross':
        tags.add('close');
        tags.add('delete');
        tags.add('remove');
        break;
      case 'arrow':
        tags.add('direction');
        tags.add('navigation');
        break;
      case 'down':
        tags.add('bottom');
        break;
      case 'up':
        tags.add('top');
        break;
      case 'left':
        tags.add('back');
        tags.add('previous');
        break;
      case 'right':
        tags.add('forward');
        tags.add('next');
        break;
      case 'add':
        tags.add('plus');
        tags.add('create');
        tags.add('new');
        break;
      case 'remove':
      case 'delete':
        tags.add('minus');
        tags.add('trash');
        break;
      case 'member':
      case 'user':
        tags.add('person');
        tags.add('people');
        break;
      case 'settings':
        tags.add('config');
        tags.add('gear');
        tags.add('preferences');
        tags.add('options');
        break;
      case 'search':
        tags.add('find');
        tags.add('magnify');
        break;
      case 'edit':
        tags.add('modify');
        tags.add('pencil');
        tags.add('change');
        break;
      case 'save':
        tags.add('store');
        tags.add('download');
        break;
      case 'upload':
        tags.add('import');
        tags.add('add');
        break;
      case 'download':
        tags.add('export');
        tags.add('save');
        break;
    }
  });

  return Array.from(tags).join(', ');
}

// Читаем все иконки
const iconsDir = path.join(__dirname, '..', 'icons');
const iconFiles = fs.readdirSync(iconsDir)
  .filter(file => file.endsWith('.svg'))
  .map(file => file.replace('.svg', ''))
  .sort();

console.log(`Всего иконок: ${iconFiles.length}\n`);

// Проверяем категории
const categories = new Map();
const otherIcons = [];

iconFiles.forEach(iconName => {
  const category = getIconCategory(iconName);
  if (!categories.has(category)) {
    categories.set(category, []);
  }
  categories.get(category).push(iconName);
  
  if (category === 'Other') {
    otherIcons.push(iconName);
  }
});

// Выводим статистику по категориям
console.log('=== СТАТИСТИКА ПО КАТЕГОРИЯМ ===');
const sortedCategories = Array.from(categories.entries()).sort((a, b) => b[1].length - a[1].length);
sortedCategories.forEach(([category, icons]) => {
  console.log(`${category}: ${icons.length} иконок`);
});

console.log(`\n=== ИКОНКИ В КАТЕГОРИИ "Other" (${otherIcons.length}) ===`);
if (otherIcons.length > 0) {
  otherIcons.forEach(icon => {
    console.log(`  - ${icon}`);
  });
} else {
  console.log('  Все иконки попали в категории!');
}

// Проверяем описания (теги)
console.log(`\n=== ПРОВЕРКА ОПИСАНИЙ (ТЕГОВ) ===`);
let missingDescriptions = 0;
const sampleDescriptions = [];

iconFiles.slice(0, 10).forEach(iconName => {
  const tags = generateSearchTags(iconName);
  sampleDescriptions.push({ icon: iconName, tags });
  if (!tags || tags.length === 0) {
    missingDescriptions++;
  }
});

console.log('\nПримеры описаний (первые 10):');
sampleDescriptions.forEach(({ icon, tags }) => {
  console.log(`  ${icon}: ${tags}`);
});

// Проверяем, все ли иконки имеют описания
const allWithTags = iconFiles.every(iconName => {
  const tags = generateSearchTags(iconName);
  return tags && tags.length > 0;
});

console.log(`\nВсе иконки имеют описания (теги): ${allWithTags ? 'ДА' : 'НЕТ'}`);

// Итоговый отчет
console.log(`\n=== ИТОГОВЫЙ ОТЧЕТ ===`);
console.log(`✓ Всего иконок: ${iconFiles.length}`);
console.log(`✓ Категорий: ${categories.size}`);
console.log(`✓ Иконок в "Other": ${otherIcons.length} ${otherIcons.length > 0 ? '(ТРЕБУЕТ ВНИМАНИЯ)' : '(ВСЕ В КАТЕГОРИЯХ)'}`);
console.log(`✓ Все иконки имеют описания: ${allWithTags ? 'ДА' : 'НЕТ'}`);

