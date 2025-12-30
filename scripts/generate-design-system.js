/**
 * OpenAI Design System Generator
 * 
 * Reads existing openai-design-system.json, adds component tokens,
 * normalizes alpha keys (removes leading zeros for proper sorting),
 * and updates ALL references to match.
 * 
 * Usage: node scripts/generate-design-system.js
 */

const fs = require('fs');
const path = require('path');

// ============================================
// COMPONENT-SPECIFIC TOKENS
// ============================================

const componentTokens = {
    switch: {
        track: {
            color: { light: 'gray.150', dark: 'gray dark.400', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--switch-track-color\nSwitch track background (unchecked)' },
            hover: { light: 'gray.200', dark: 'gray dark.450', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--switch-track-color-hover\nSwitch track background hover (unchecked)' },
            checked: { light: 'gray.900', dark: 'blue.400', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--switch-track-color-checked\nSwitch track background (checked)' },
            disabled: { light: 'gray.100', dark: 'gray dark.300', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--switch-track-color-disabled\nSwitch track background (disabled)' },
            checkedDisabled: { light: 'gray.300', dark: 'blue.700', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--switch-track-color-checked-disabled\nSwitch track background (checked + disabled)' }
        },
        thumb: {
            color: { light: 'gray.0', dark: 'gray dark.1000', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--switch-thumb-color\nSwitch thumb color' },
            disabled: { light: 'gray.0', dark: 'gray dark.800', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--switch-thumb-color-disabled\nSwitch thumb color (disabled)' }
        }
    },
    slider: {
        track: { color: { light: 'gray.150', dark: 'gray dark.400', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--slider-track-color\nSlider track background' } },
        range: { color: { light: 'gray.450', dark: 'gray dark.600', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--slider-range-color\nSlider filled range color' } }
    },
    segmentedControl: {
        background: { light: 'gray.100', dark: 'gray dark.0', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--segmented-control-background\nSegmented control container background' },
        thumb: { background: { light: 'gray.0', dark: 'gray dark.300', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--segmented-control-thumb-background\nSegmented control active thumb background' } },
        option: { highlight: { light: 'gray.200', dark: 'gray dark.300', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--segmented-control-option-highlight-background-color\nSegmented control option highlight' } }
    },
    input: {
        outline: { borderHover: { light: 'alpha.25', dark: 'alpha-white.30', scopes: ['STROKE_COLOR'], desc: '--input-outline-border-color-hover\nInput border color on hover' } },
        border: { invalid: { light: 'red.500', dark: 'red.600', scopes: ['STROKE_COLOR'], desc: '--input-border-color-invalid\nInput border color when invalid' } }
    },
    menu: { item: { background: { light: 'alpha.8', dark: 'alpha-white.10', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--menu-item-background-color\nMenu item hover background' } } },
    avatar: { image: { border: { light: 'alpha.4', dark: 'alpha-white.15', scopes: ['STROKE_COLOR'], desc: '--avatar-image-border-color\nAvatar image border color' } } },
    link: { primary: { text: { light: 'blue.500', dark: 'blue.300', scopes: ['TEXT_FILL'], desc: '--link-primary-text-color\nPrimary link text color' } } },
    checkbox: {
        border: { light: 'alpha.25', dark: 'alpha-white.30', scopes: ['STROKE_COLOR'], desc: '--checkbox-border-color\nCheckbox border color' },
        background: { checked: { light: 'gray.900', dark: 'gray dark.0', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--checkbox-background-color-checked\nCheckbox background when checked' } },
        checkmark: { light: 'gray.0', dark: 'gray dark.900', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--checkbox-checkmark-color\nCheckbox checkmark color' }
    },
    radio: {
        border: { light: 'alpha.25', dark: 'alpha-white.30', scopes: ['STROKE_COLOR'], desc: '--radio-border-color\nRadio button border color' },
        dot: { light: 'gray.900', dark: 'gray dark.0', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--radio-dot-color\nRadio button dot color when selected' }
    },
    tooltip: {
        background: { light: 'gray.900', dark: 'gray dark.100', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--tooltip-background-color\nTooltip background color' },
        text: { light: 'gray.0', dark: 'gray dark.900', scopes: ['TEXT_FILL'], desc: '--tooltip-text-color\nTooltip text color' }
    },
    popover: {
        background: { light: 'gray.0', dark: 'gray dark.200', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--popover-background-color\nPopover background color' },
        border: { light: 'alpha.10', dark: 'alpha-white.12', scopes: ['STROKE_COLOR'], desc: '--popover-border-color\nPopover border color' }
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function createToken(value, scopes, desc) {
    return {
        '$scopes': scopes,
        '$description': desc,
        '$type': 'color',
        '$libraryName': '',
        '$collectionName': 'color primitive',
        '$value': `{${value}}`
    };
}

function processComponentTokens(tokens, mode = 'Light') {
    const result = {};
    for (const [key, value] of Object.entries(tokens)) {
        if (value.light !== undefined && value.dark !== undefined) {
            const tokenValue = mode === 'Light' ? value.light : value.dark;
            result[key] = createToken(tokenValue, value.scopes, value.desc);
        } else {
            result[key] = processComponentTokens(value, mode);
        }
    }
    return result;
}

// ============================================
// CUSTOM JSON SERIALIZATION
// Preserves correct key order for numeric palette keys
// ============================================

const NUMERIC_PALETTES = ['gray', 'gray dark', 'alpha', 'alpha-white', 'red', 'orange', 'yellow', 'green', 'blue', 'purple'];

function sortPaletteKeys(keys) {
    return [...keys].sort((a, b) => {
        // Handle 'aXX' keys (like a25, a50) - put them after numeric keys
        const aIsAlpha = a.startsWith('a') && !isNaN(parseInt(a.slice(1)));
        const bIsAlpha = b.startsWith('a') && !isNaN(parseInt(b.slice(1)));

        if (aIsAlpha && bIsAlpha) return parseInt(a.slice(1)) - parseInt(b.slice(1));
        if (aIsAlpha) return 1;
        if (bIsAlpha) return -1;

        return parseInt(a) - parseInt(b);
    });
}

function serializeWithOrder(obj, indent = 2, depth = 0, parentKey = '') {
    const pad = ' '.repeat(indent * depth);
    const padInner = ' '.repeat(indent * (depth + 1));

    if (obj === null) return 'null';
    if (typeof obj !== 'object') return JSON.stringify(obj);

    if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]';
        const items = obj.map(item => padInner + serializeWithOrder(item, indent, depth + 1, ''));
        return '[\n' + items.join(',\n') + '\n' + pad + ']';
    }

    let keys = Object.keys(obj);
    if (keys.length === 0) return '{}';

    // Sort keys for numeric palettes
    if (NUMERIC_PALETTES.includes(parentKey)) {
        keys = sortPaletteKeys(keys);
    }

    const items = keys.map(key => {
        const val = serializeWithOrder(obj[key], indent, depth + 1, key);
        return padInner + JSON.stringify(key) + ': ' + val;
    });

    return '{\n' + items.join(',\n') + '\n' + pad + '}';
}

// ============================================
// MAIN
// ============================================

const filePath = path.join(__dirname, '..', 'reference', 'openai-design-system.json');

// Read existing file
let fileContent = fs.readFileSync(filePath, 'utf8');

// STEP 1: Normalize ALL references (remove leading zeros from alpha references)
// This matches: {alpha.00}, {alpha.02}, {alpha.04}, {alpha.05}, {alpha.06}, {alpha.08}
// And converts to: {alpha.0}, {alpha.2}, {alpha.4}, {alpha.5}, {alpha.6}, {alpha.8}
fileContent = fileContent.replace(/\{(alpha|alpha-white)\.0([0-9])\}/g, '{$1.$2}');

// Now parse
const data = JSON.parse(fileContent);

// STEP 2: Normalize primitive keys (remove leading zeros)
const primitives = data[1]?.['color primitive']?.modes?.Value;
if (primitives) {
    for (const p of ['alpha', 'alpha-white']) {
        if (primitives[p]) {
            const oldPalette = primitives[p];
            const newPalette = {};
            const keys = Object.keys(oldPalette);
            for (const k of keys) {
                // Remove leading zero if present (e.g., "08" -> "8", "00" -> "0")
                const newK = k.startsWith('0') && k.length > 1 ? k.slice(1) : k;
                newPalette[newK] = oldPalette[k];
            }
            primitives[p] = newPalette;
        }
    }
}

// STEP 3: Add/update component tokens
const lightComponentTokens = processComponentTokens(componentTokens, 'Light');
const darkComponentTokens = processComponentTokens(componentTokens, 'Dark');

if (data[0]?.color?.modes) {
    data[0].color.modes.Light.component = lightComponentTokens;
    data[0].color.modes.Dark.component = darkComponentTokens;
}

// Write with correct key ordering
fs.writeFileSync(filePath, serializeWithOrder(data, 2));

console.log('✅ Updated openai-design-system.json');
console.log('   - Normalized alpha keys (00 -> 0, 08 -> 8) for automatic sorting.');
console.log('   - Updated ALL references to match new key names.');
console.log(`   Path: ${filePath}`);
