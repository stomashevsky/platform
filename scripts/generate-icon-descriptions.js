const fs = require('fs');
const path = require('path');

/**
 * Generate human-readable description for an icon based on its name
 */
function generateIconDescription(iconName) {
  const name = iconName.toLowerCase();
  const words = iconName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .split(' ')
    .filter(w => w.length > 0)
    .map(w => w.toLowerCase());

  // Helper function to check if name includes any of the patterns
  const includesAny = (patterns) => patterns.some(p => name.includes(p));

  // Navigation
  if (includesAny(['arrow', 'chevron', 'caret', 'back', 'forward', 'next', 'previous'])) {
    if (includesAny(['left'])) return 'Arrow pointing left for navigation';
    if (includesAny(['right'])) return 'Arrow pointing right for navigation';
    if (includesAny(['up'])) return 'Arrow pointing up for navigation';
    if (includesAny(['down'])) return 'Arrow pointing down for navigation';
    return 'Navigation arrow icon';
  }

  // Actions - Add
  if (includesAny(['add', 'plus', 'create', 'new'])) {
    if (includesAny(['member', 'user'])) return 'Add user or member icon';
    if (includesAny(['source'])) return 'Add source icon';
    return 'Add or create new item icon';
  }

  // Actions - Remove/Delete
  if (includesAny(['delete', 'remove', 'minus', 'clear', 'trash'])) {
    if (includesAny(['account'])) return 'Delete account icon';
    return 'Delete or remove item icon';
  }

  // Actions - Edit
  if (includesAny(['edit', 'pencil', 'modify', 'change', 'write'])) {
    return 'Edit or modify content icon';
  }

  // Actions - Copy
  if (includesAny(['copy', 'duplicate', 'clone', 'clipboard'])) {
    return 'Copy or duplicate item icon';
  }

  // Actions - Download/Save
  if (includesAny(['download', 'save', 'export'])) {
    return 'Download or save file icon';
  }

  // Actions - Upload
  if (includesAny(['upload', 'import'])) {
    return 'Upload or import file icon';
  }

  // Actions - Search
  if (includesAny(['search', 'magnify', 'find', 'telescope'])) {
    return 'Search or find content icon';
  }

  // Media controls
  if (includesAny(['play', 'pause', 'stop', 'rewind', 'forward', 'skip'])) {
    if (includesAny(['play'])) return 'Play media icon';
    if (includesAny(['pause'])) return 'Pause media icon';
    if (includesAny(['stop'])) return 'Stop media icon';
    return 'Media control icon';
  }

  // Media - Video
  if (includesAny(['video', 'caption', 'image'])) {
    if (includesAny(['caption'])) return 'Video or image caption icon';
    if (includesAny(['video'])) return 'Video content icon';
    if (includesAny(['image'])) return 'Image or picture icon';
    return 'Media content icon';
  }

  // Media - Audio/Voice
  if (includesAny(['mic', 'microphone', 'voice', 'sound', 'audio', 'speak', 'speech'])) {
    if (includesAny(['off', 'mute'])) return 'Microphone or sound muted icon';
    if (includesAny(['on', 'filled'])) return 'Microphone or sound enabled icon';
    return 'Microphone or voice recording icon';
  }

  // Communication
  if (includesAny(['chat', 'message', 'mail', 'email', 'comment', 'forum', 'notification', 'bell'])) {
    if (includesAny(['bell'])) return 'Notification bell icon';
    if (includesAny(['chat'])) return 'Chat or messaging icon';
    if (includesAny(['mail', 'email'])) return 'Email or mail icon';
    return 'Communication icon';
  }

  // Files
  if (includesAny(['file', 'document', 'folder', 'archive', 'clipboard', 'page', 'notebook', 'notepad'])) {
    if (includesAny(['folder'])) return 'Folder icon';
    if (includesAny(['file'])) return 'File or document icon';
    if (includesAny(['notebook', 'notepad'])) return 'Notebook or notepad icon';
    return 'File or document icon';
  }

  // Users
  if (includesAny(['user', 'member', 'person', 'people', 'group', 'avatar', 'profile'])) {
    if (includesAny(['avatar'])) return 'User avatar or profile icon';
    if (includesAny(['group', 'people'])) return 'Group of users icon';
    return 'User or member icon';
  }

  // Settings
  if (includesAny(['settings', 'config', 'gear', 'preferences', 'options', 'customize'])) {
    return 'Settings or configuration icon';
  }

  // Status - Success
  if (includesAny(['check', 'success', 'complete', 'done'])) {
    return 'Success or completed action icon';
  }

  // Status - Error
  if (includesAny(['error', 'warning', 'alert', 'exclamation'])) {
    return 'Error or warning icon';
  }

  // Status - Info
  if (includesAny(['info', 'help', 'question'])) {
    return 'Information or help icon';
  }

  // AI & Automation
  if (includesAny(['agent', 'assistant', 'ai', 'brain', 'automation', 'bot', 'sparkle', 'bolt', 'flash'])) {
    if (includesAny(['agent', 'assistant'])) return 'AI agent or assistant icon';
    if (includesAny(['sparkle', 'bolt'])) return 'AI or magic feature icon';
    return 'AI or automation icon';
  }

  // Analytics
  if (includesAny(['chart', 'graph', 'analytics', 'data', 'statistics', 'metrics', 'bar'])) {
    return 'Analytics or data visualization icon';
  }

  // Interface
  if (includesAny(['menu', 'hamburger', 'sidebar', 'collapse', 'expand', 'minimize', 'maximize', 'dock', 'dropdown'])) {
    if (includesAny(['menu', 'hamburger'])) return 'Menu or hamburger icon';
    if (includesAny(['collapse', 'expand'])) return 'Collapse or expand icon';
    return 'Interface element icon';
  }

  // Interface - View
  if (includesAny(['eye', 'view', 'visible', 'hidden', 'show', 'hide'])) {
    if (includesAny(['off', 'closed'])) return 'Hide or view hidden icon';
    return 'View or show content icon';
  }

  // Interface - Link
  if (includesAny(['link', 'chain', 'connect', 'external'])) {
    if (includesAny(['external'])) return 'External link icon';
    if (includesAny(['disabled', 'off'])) return 'Link disabled icon';
    return 'Link or connection icon';
  }

  // Interface - Home
  if (includesAny(['home'])) {
    return 'Home or main page icon';
  }

  // Interface - History
  if (includesAny(['history', 'time', 'clock'])) {
    if (includesAny(['history'])) return 'History or previous actions icon';
    if (includesAny(['clock', 'time'])) return 'Time or clock icon';
    return 'Time-related icon';
  }

  // Interface - Filter
  if (includesAny(['filter'])) {
    return 'Filter or search filter icon';
  }

  // Symbols
  if (includesAny(['heart', 'star', 'bookmark', 'pin', 'flag', 'tag', 'badge'])) {
    if (includesAny(['heart'])) return 'Favorite or like icon';
    if (includesAny(['star'])) return 'Star or featured icon';
    if (includesAny(['bookmark', 'pin'])) return 'Bookmark or pin icon';
    return 'Symbol or marker icon';
  }

  // Time and calendar
  if (includesAny(['calendar', 'date'])) {
    return 'Calendar or date icon';
  }

  // Security
  if (includesAny(['lock', 'key', 'secure', 'private', 'shield', 'protection'])) {
    if (includesAny(['lock', 'key'])) return 'Lock or security icon';
    if (includesAny(['shield'])) return 'Security shield icon';
    return 'Security or protection icon';
  }

  // Code/Development
  if (includesAny(['code', 'function', 'variable', 'script'])) {
    return 'Code or development icon';
  }

  // Grid/Layout
  if (includesAny(['grid', 'layout', 'table'])) {
    return 'Grid or layout icon';
  }

  // Globe/World
  if (includesAny(['globe', 'world', 'earth', 'internet'])) {
    return 'Globe or world icon';
  }

  // Light/Dark mode
  if (includesAny(['light', 'dark', 'moon', 'sun'])) {
    if (includesAny(['light'])) return 'Light mode icon';
    if (includesAny(['dark', 'moon'])) return 'Dark mode icon';
    return 'Theme or mode icon';
  }

  // Music
  if (includesAny(['music', 'sound'])) {
    return 'Music or sound icon';
  }

  // Education
  if (includesAny(['education', 'graduate', 'graduation', 'book', 'learning'])) {
    return 'Education or learning icon';
  }

  // Business
  if (includesAny(['business', 'building', 'workspace'])) {
    return 'Business or workspace icon';
  }

  // Generate default description from name
  const readableName = words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return `${readableName} icon`;
}

// Main function
const iconsDir = path.join(__dirname, '..', 'icons');
const iconFiles = fs.readdirSync(iconsDir)
  .filter(file => file.endsWith('.svg'))
  .map(file => file.replace('.svg', ''))
  .sort();

console.log(`Generating descriptions for ${iconFiles.length} icons...`);

const descriptions = {};

iconFiles.forEach(iconName => {
  descriptions[iconName] = {
    description: generateIconDescription(iconName),
    tags: [] // Will be populated separately or can use generateSearchTags
  };
});

// Save to JSON file
const outputPath = path.join(__dirname, '..', 'reference', 'icon-descriptions.json');
fs.writeFileSync(outputPath, JSON.stringify(descriptions, null, 2), 'utf-8');

console.log(`✅ Generated descriptions for ${iconFiles.length} icons`);
console.log(`   Saved to: ${outputPath}`);

// Statistics
const uniqueDescriptions = new Set(Object.values(descriptions).map(d => d.description));
console.log(`   Unique descriptions: ${uniqueDescriptions.size}`);

