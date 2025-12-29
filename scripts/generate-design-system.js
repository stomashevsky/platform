/**
 * OpenAI Design System Generator
 * 
 * Generates openai-design-system.json with all color tokens
 * based on the OpenAI Apps SDK UI design system.
 * 
 * Source: https://openai.github.io/apps-sdk-ui/?path=/docs/foundations-design-tokens--docs
 * 
 * Usage: node scripts/generate-design-system.js
 */

const fs = require('fs');
const path = require('path');

// ============================================
// PRIMITIVE COLORS
// ============================================

const primitives = {
    base: {
        white: '#ffffff',
        black: '#000000'
    },

    // Grayscale (light mode values)
    gray: {
        '0': '#ffffff',
        '25': '#fcfcfc',
        '50': '#f9f9f9',
        '75': '#f3f3f3',
        '100': '#ededed',
        '150': '#dfdfdf',
        '200': '#c4c4c4',
        '250': '#b9b9b9',
        '300': '#afafaf',
        '350': '#9f9f9f',
        '400': '#8f8f8f',
        '450': '#767676',
        '500': '#5d5d5d',
        '550': '#4f4f4f',
        '600': '#414141',
        '650': '#393939',
        '700': '#303030',
        '750': '#292929',
        '800': '#212121',
        '850': '#1c1c1c',
        '900': '#181818',
        '925': '#161616',
        '950': '#131313',
        '975': '#101010',
        '1000': '#0d0d0d'
    },

    // Grayscale (dark mode - inverted)
    'gray dark': {
        '0': '#0d0d0d',
        '25': '#101010',
        '50': '#131313',
        '75': '#161616',
        '100': '#181818',
        '150': '#1c1c1c',
        '200': '#212121',
        '250': '#282828',
        '300': '#303030',
        '350': '#393939',
        '400': '#414141',
        '450': '#4f4f4f',
        '500': '#5d5d5d',
        '550': '#767676',
        '600': '#8f8f8f',
        '650': '#9f9f9f',
        '700': '#afafaf',
        '750': '#b9b9b9',
        '800': '#cdcdcd',
        '850': '#dcdcdc',
        '900': '#ededed',
        '925': '#f3f3f3',
        '950': '#f3f3f3',
        '975': '#f9f9f9',
        '1000': '#fff'
    },

    // Alpha (black-based for light mode)
    alpha: {
        '00': 'rgba(0, 0, 0, 0)',
        '02': 'rgba(0, 0, 0, 0.02)',
        '04': 'rgba(0, 0, 0, 0.04)',
        '05': 'rgba(0, 0, 0, 0.05)',
        '06': 'rgba(0, 0, 0, 0.06)',
        '08': 'rgba(0, 0, 0, 0.08)',
        '10': 'rgba(0, 0, 0, 0.1)',
        '12': 'rgba(0, 0, 0, 0.12)',
        '15': 'rgba(0, 0, 0, 0.15)',
        '16': 'rgba(0, 0, 0, 0.16)',
        '20': 'rgba(0, 0, 0, 0.2)',
        '25': 'rgba(0, 0, 0, 0.25)',
        '30': 'rgba(0, 0, 0, 0.3)',
        '35': 'rgba(0, 0, 0, 0.35)',
        '40': 'rgba(0, 0, 0, 0.4)',
        '50': 'rgba(0, 0, 0, 0.5)'
    },

    // Alpha white (for dark mode)
    'alpha-white': {
        '00': 'rgba(255, 255, 255, 0)',
        '02': 'rgba(255, 255, 255, 0.02)',
        '04': 'rgba(255, 255, 255, 0.04)',
        '05': 'rgba(255, 255, 255, 0.05)',
        '06': 'rgba(255, 255, 255, 0.06)',
        '08': 'rgba(255, 255, 255, 0.08)',
        '10': 'rgba(255, 255, 255, 0.1)',
        '12': 'rgba(255, 255, 255, 0.12)',
        '15': 'rgba(255, 255, 255, 0.15)',
        '16': 'rgba(255, 255, 255, 0.16)',
        '20': 'rgba(255, 255, 255, 0.2)',
        '25': 'rgba(255, 255, 255, 0.25)',
        '30': 'rgba(255, 255, 255, 0.3)',
        '35': 'rgba(255, 255, 255, 0.35)',
        '40': 'rgba(255, 255, 255, 0.4)',
        '50': 'rgba(255, 255, 255, 0.5)'
    },

    // Red
    red: {
        '25': '#fef0ef', '50': '#fdd9d6', '75': '#fcc5c1', '100': '#f9a19a',
        '200': '#f67d73', '300': '#f2594d', '400': '#e73a2d', '500': '#c6271b',
        '600': '#9d1f15', '700': '#781810', '800': '#56110c', '900': '#3b0c08',
        '950': '#290805', '1000': '#180503',
        'a25': 'rgba(198, 39, 27, 0.08)', 'a50': 'rgba(198, 39, 27, 0.16)',
        'a75': 'rgba(198, 39, 27, 0.24)', 'a100': 'rgba(198, 39, 27, 0.32)',
        'a200': 'rgba(198, 39, 27, 0.48)', 'a300': 'rgba(198, 39, 27, 0.64)'
    },

    // Orange
    orange: {
        '25': '#fef3e6', '50': '#fce2c3', '75': '#fad2a4', '100': '#f7b86e',
        '200': '#f39f39', '300': '#e88600', '400': '#d17800', '500': '#c54f00',
        '600': '#923c00', '700': '#6f2e00', '800': '#562300', '900': '#3a1800',
        '950': '#281000', '1000': '#180a00',
        'a25': 'rgba(197, 79, 0, 0.08)', 'a50': 'rgba(197, 79, 0, 0.16)',
        'a75': 'rgba(197, 79, 0, 0.24)', 'a100': 'rgba(197, 79, 0, 0.32)',
        'a200': 'rgba(197, 79, 0, 0.48)', 'a300': 'rgba(197, 79, 0, 0.64)'
    },

    // Yellow
    yellow: {
        '25': '#fef9eb', '50': '#fcefcc', '75': '#fae6af', '100': '#f5d782',
        '200': '#f0c855', '300': '#eaba28', '400': '#d9a800', '500': '#ad8600',
        '600': '#876900', '700': '#685100', '800': '#4b3b00', '900': '#332800',
        '950': '#241c00', '1000': '#161100',
        'a25': 'rgba(173, 134, 0, 0.08)', 'a50': 'rgba(173, 134, 0, 0.16)',
        'a75': 'rgba(173, 134, 0, 0.24)', 'a100': 'rgba(173, 134, 0, 0.32)',
        'a200': 'rgba(173, 134, 0, 0.48)', 'a300': 'rgba(173, 134, 0, 0.64)'
    },

    // Green
    green: {
        '25': '#e9fcf2', '50': '#c7f7de', '75': '#a8f1cb', '100': '#76e6ac',
        '200': '#45db8e', '300': '#15cf70', '400': '#00b85a', '500': '#009348',
        '600': '#007439', '700': '#005a2c', '800': '#004120', '900': '#002c16',
        '950': '#001f0f', '1000': '#001309',
        'a25': 'rgba(0, 147, 72, 0.08)', 'a50': 'rgba(0, 147, 72, 0.16)',
        'a75': 'rgba(0, 147, 72, 0.24)', 'a100': 'rgba(0, 147, 72, 0.32)',
        'a200': 'rgba(0, 147, 72, 0.48)', 'a300': 'rgba(0, 147, 72, 0.64)'
    },

    // Blue
    blue: {
        '25': '#eef6ff', '50': '#d4eaff', '75': '#bddeff', '100': '#97cbff',
        '200': '#70b7ff', '300': '#4aa4ff', '400': '#2491ff', '500': '#0073e6',
        '600': '#005bbb', '700': '#004691', '800': '#003269', '900': '#002349',
        '950': '#001833', '1000': '#000e1f',
        'a25': 'rgba(0, 115, 230, 0.08)', 'a50': 'rgba(0, 115, 230, 0.16)',
        'a75': 'rgba(0, 115, 230, 0.24)', 'a100': 'rgba(0, 115, 230, 0.32)',
        'a200': 'rgba(0, 115, 230, 0.48)', 'a300': 'rgba(0, 115, 230, 0.64)'
    },

    // Purple
    purple: {
        '25': '#f8f0ff', '50': '#eed9ff', '75': '#e5c6ff', '100': '#d6a4ff',
        '200': '#c782ff', '300': '#b85fff', '400': '#a939ff', '500': '#8d0ee3',
        '600': '#6f00b8', '700': '#55008e', '800': '#3c0066', '900': '#290047',
        '950': '#1d0033', '1000': '#11001f',
        'a25': 'rgba(141, 14, 227, 0.08)', 'a50': 'rgba(141, 14, 227, 0.16)',
        'a75': 'rgba(141, 14, 227, 0.24)', 'a100': 'rgba(141, 14, 227, 0.32)',
        'a200': 'rgba(141, 14, 227, 0.48)', 'a300': 'rgba(141, 14, 227, 0.64)'
    }
};

// ============================================
// SEMANTIC TOKENS DEFINITION
// Each token has: name, light value, dark value, scopes, description
// ============================================

const semanticTokens = {
    surface: {
        default: { light: 'gray.0', dark: 'gray.200', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-surface\nPage background, main container' },
        secondary: { light: 'gray.50', dark: 'gray.150', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-surface-secondary\nSecondary surface (cards, sidebars)' },
        tertiary: { light: 'gray.75', dark: 'gray.100', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-surface-tertiary\nTertiary surface (nested containers)' },
        elevated: {
            default: { light: 'gray.0', dark: 'gray.200', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-surface-elevated\nElevated surface (modals, dropdowns)' },
            secondary: { light: 'gray.50', dark: 'gray.150', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-surface-elevated-secondary\nElevated secondary surface (nested modals)' }
        }
    },

    background: {
        disabled: { light: 'alpha.05', dark: 'alpha-white.08', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-disabled\nDisabled background state' },
        soft: {
            primary: { light: 'gray.100', dark: 'gray.300', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-primary-soft\nButton primary soft background' },
            secondary: { light: 'gray.100', dark: 'gray.300', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-secondary-soft\nButton secondary soft background' },
            info: { light: 'blue.50', dark: 'blue.50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-info-soft\nButton info soft background' },
            warning: { light: 'orange.50', dark: 'orange.50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-warning-soft\nButton warning soft background' },
            caution: { light: 'yellow.50', dark: 'yellow.50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-caution-soft\nButton caution soft background' },
            danger: { light: 'red.50', dark: 'red.50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-danger-soft\nButton danger soft background' },
            success: { light: 'green.50', dark: 'green.50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-success-soft\nButton success soft background' },
            discovery: { light: 'purple.50', dark: 'purple.50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-discovery-soft\nButton discovery soft background' },
            hover: {
                primary: { light: 'gray.150', dark: 'gray.350', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-primary-soft-hover\nButton primary soft background hover' },
                secondary: { light: 'gray.150', dark: 'gray.350', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-secondary-soft-hover\nButton secondary soft background hover' },
                info: { light: 'blue.75', dark: 'blue.75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-info-soft-hover\nButton info soft background hover' },
                warning: { light: 'orange.75', dark: 'orange.75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-warning-soft-hover\nButton warning soft background hover' },
                caution: { light: 'yellow.75', dark: 'yellow.75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-caution-soft-hover\nButton caution soft background hover' },
                danger: { light: 'red.75', dark: 'red.75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-danger-soft-hover\nButton danger soft background hover' },
                success: { light: 'green.75', dark: 'green.75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-success-soft-hover\nButton success soft background hover' },
                discovery: { light: 'purple.75', dark: 'purple.75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-discovery-soft-hover\nButton discovery soft background hover' }
            },
            active: {
                primary: { light: 'gray.200', dark: 'gray.400', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-primary-soft-active\nButton primary soft background active' },
                secondary: { light: 'gray.200', dark: 'gray.400', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-secondary-soft-active\nButton secondary soft background active' },
                info: { light: 'blue.75', dark: 'blue.75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-info-soft-active\nButton info soft background active' },
                warning: { light: 'orange.75', dark: 'orange.75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-warning-soft-active\nButton warning soft background active' },
                caution: { light: 'yellow.75', dark: 'yellow.75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-caution-soft-active\nButton caution soft background active' },
                danger: { light: 'red.75', dark: 'red.75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-danger-soft-active\nButton danger soft background active' },
                success: { light: 'green.75', dark: 'green.75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-success-soft-active\nButton success soft background active' },
                discovery: { light: 'purple.75', dark: 'purple.75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-discovery-soft-active\nButton discovery soft background active' }
            },
            alt: {
                primary: { light: 'alpha.02', dark: 'alpha-white.04', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-primary-soft-alt\nButton primary soft background alt' },
                secondary: { light: 'alpha.02', dark: 'alpha-white.04', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-secondary-soft-alt\nButton secondary soft background alt' }
            },
            alpha: {
                primary: { light: 'alpha.08', dark: 'alpha-white.12', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-primary-soft-alpha\nButton primary soft background alpha' },
                secondary: { light: 'alpha.08', dark: 'alpha-white.12', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-secondary-soft-alpha\nButton secondary soft background alpha' },
                info: { light: 'blue.a50', dark: 'blue.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-info-soft-alpha\nButton info soft background alpha' },
                warning: { light: 'orange.a50', dark: 'orange.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-warning-soft-alpha\nButton warning soft background alpha' },
                caution: { light: 'yellow.a50', dark: 'yellow.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-caution-soft-alpha\nButton caution soft background alpha' },
                danger: { light: 'red.a50', dark: 'red.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-danger-soft-alpha\nButton danger soft background alpha' },
                success: { light: 'green.a50', dark: 'green.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-success-soft-alpha\nButton success soft background alpha' },
                discovery: { light: 'purple.a50', dark: 'purple.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-discovery-soft-alpha\nButton discovery soft background alpha' },
                hover: {
                    primary: { light: 'alpha.12', dark: 'alpha-white.16', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-primary-soft-alpha-hover\nButton primary soft background alpha hover' },
                    secondary: { light: 'alpha.12', dark: 'alpha-white.16', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-secondary-soft-alpha-hover\nButton secondary soft background alpha hover' },
                    info: { light: 'blue.a75', dark: 'blue.a75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-info-soft-alpha-hover\nButton info soft background alpha hover' },
                    warning: { light: 'orange.a75', dark: 'orange.a75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-warning-soft-alpha-hover\nButton warning soft background alpha hover' },
                    caution: { light: 'yellow.a75', dark: 'yellow.a75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-caution-soft-alpha-hover\nButton caution soft background alpha hover' },
                    danger: { light: 'red.a75', dark: 'red.a75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-danger-soft-alpha-hover\nButton danger soft background alpha hover' },
                    success: { light: 'green.a75', dark: 'green.a75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-success-soft-alpha-hover\nButton success soft background alpha hover' },
                    discovery: { light: 'purple.a75', dark: 'purple.a75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-discovery-soft-alpha-hover\nButton discovery soft background alpha hover' }
                },
                active: {
                    primary: { light: 'alpha.16', dark: 'alpha-white.20', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-primary-soft-alpha-active\nButton primary soft background alpha active' },
                    secondary: { light: 'alpha.16', dark: 'alpha-white.20', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-secondary-soft-alpha-active\nButton secondary soft background alpha active' },
                    info: { light: 'blue.a75', dark: 'blue.a75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-info-soft-alpha-active\nButton info soft background alpha active' },
                    warning: { light: 'orange.a75', dark: 'orange.a75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-warning-soft-alpha-active\nButton warning soft background alpha active' },
                    caution: { light: 'yellow.a75', dark: 'yellow.a75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-caution-soft-alpha-active\nButton caution soft background alpha active' },
                    danger: { light: 'red.a75', dark: 'red.a75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-danger-soft-alpha-active\nButton danger soft background alpha active' },
                    success: { light: 'green.a75', dark: 'green.a75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-success-soft-alpha-active\nButton success soft background alpha active' },
                    discovery: { light: 'purple.a75', dark: 'purple.a75', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-discovery-soft-alpha-active\nButton discovery soft background alpha active' }
                }
            }
        },
        surface: {
            primary: { light: 'alpha.05', dark: 'alpha-white.08', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-primary-surface\nAlert/Badge primary surface background' },
            info: { light: 'blue.a25', dark: 'blue.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-info-surface\nAlert/Badge info surface background' },
            warning: { light: 'orange.a25', dark: 'orange.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-warning-surface\nAlert/Badge warning surface background' },
            caution: { light: 'yellow.a25', dark: 'yellow.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-caution-surface\nAlert/Badge caution surface background' },
            danger: { light: 'red.a25', dark: 'red.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-danger-surface\nAlert/Badge danger surface background' },
            success: { light: 'green.a25', dark: 'green.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-success-surface\nAlert/Badge success surface background' },
            discovery: { light: 'purple.a25', dark: 'purple.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-discovery-surface\nAlert/Badge discovery surface background' }
        },
        solid: {
            primary: { light: 'gray.900', dark: 'gray dark.950', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-primary-solid\nButton primary solid background' },
            secondary: { light: 'gray.500', dark: 'gray dark.400', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-secondary-solid\nButton secondary solid background' },
            info: { light: 'blue.400', dark: 'blue.400', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-info-solid\nButton info solid background' },
            warning: { light: 'orange.500', dark: 'orange.500', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-warning-solid\nButton warning solid background' },
            caution: { light: 'yellow.600', dark: 'yellow.600', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-caution-solid\nButton caution solid background' },
            danger: { light: 'red.500', dark: 'red.500', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-danger-solid\nButton danger solid background' },
            success: { light: 'green.400', dark: 'green.400', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-success-solid\nButton success solid background' },
            discovery: { light: 'purple.400', dark: 'purple.400', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-discovery-solid\nButton discovery solid background' },
            hover: {
                primary: { light: 'gray.700', dark: 'gray dark.900', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-primary-solid-hover\nButton primary solid background hover' },
                secondary: { light: 'gray.600', dark: 'gray dark.450', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-secondary-solid-hover\nButton secondary solid background hover' },
                info: { light: 'blue.500', dark: 'blue.500', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-info-solid-hover\nButton info solid background hover' },
                warning: { light: 'orange.600', dark: 'orange.600', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-warning-solid-hover\nButton warning solid background hover' },
                caution: { light: 'yellow.700', dark: 'yellow.700', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-caution-solid-hover\nButton caution solid background hover' },
                danger: { light: 'red.600', dark: 'red.600', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-danger-solid-hover\nButton danger solid background hover' },
                success: { light: 'green.500', dark: 'green.500', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-success-solid-hover\nButton success solid background hover' },
                discovery: { light: 'purple.500', dark: 'purple.500', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-discovery-solid-hover\nButton discovery solid background hover' }
            },
            active: {
                primary: { light: 'gray.600', dark: 'gray dark.850', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-primary-solid-active\nButton primary solid background active' },
                secondary: { light: 'gray.700', dark: 'gray dark.500', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-secondary-solid-active\nButton secondary solid background active' },
                info: { light: 'blue.500', dark: 'blue.500', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-info-solid-active\nButton info solid background active' },
                warning: { light: 'orange.600', dark: 'orange.600', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-warning-solid-active\nButton warning solid background active' },
                caution: { light: 'yellow.700', dark: 'yellow.700', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-caution-solid-active\nButton caution solid background active' },
                danger: { light: 'red.600', dark: 'red.600', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-danger-solid-active\nButton danger solid background active' },
                success: { light: 'green.500', dark: 'green.500', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-success-solid-active\nButton success solid background active' },
                discovery: { light: 'purple.500', dark: 'purple.500', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-discovery-solid-active\nButton discovery solid background active' }
            }
        },
        outline: {
            hover: {
                primary: { light: 'alpha.02', dark: 'alpha-white.04', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-primary-outline-hover\nButton primary outline background hover' },
                secondary: { light: 'alpha.02', dark: 'alpha-white.04', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-secondary-outline-hover\nButton secondary outline background hover' },
                info: { light: 'blue.a25', dark: 'blue.a25', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-info-outline-hover\nButton info outline background hover' },
                warning: { light: 'orange.a25', dark: 'orange.a25', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-warning-outline-hover\nButton warning outline background hover' },
                caution: { light: 'yellow.a25', dark: 'yellow.a25', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-caution-outline-hover\nButton caution outline background hover' },
                danger: { light: 'red.a25', dark: 'red.a25', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-danger-outline-hover\nButton danger outline background hover' },
                success: { light: 'green.a25', dark: 'green.a25', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-success-outline-hover\nButton success outline background hover' },
                discovery: { light: 'purple.a25', dark: 'purple.a25', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-discovery-outline-hover\nButton discovery outline background hover' }
            },
            active: {
                primary: { light: 'alpha.04', dark: 'alpha-white.06', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-primary-outline-active\nButton primary outline background active' },
                secondary: { light: 'alpha.04', dark: 'alpha-white.06', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-secondary-outline-active\nButton secondary outline background active' },
                info: { light: 'blue.a25', dark: 'blue.a25', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-info-outline-active\nButton info outline background active' },
                warning: { light: 'orange.a25', dark: 'orange.a25', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-warning-outline-active\nButton warning outline background active' },
                caution: { light: 'yellow.a25', dark: 'yellow.a25', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-caution-outline-active\nButton caution outline background active' },
                danger: { light: 'red.a25', dark: 'red.a25', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-danger-outline-active\nButton danger outline background active' },
                success: { light: 'green.a25', dark: 'green.a25', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-success-outline-active\nButton success outline background active' },
                discovery: { light: 'purple.a25', dark: 'purple.a25', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-discovery-outline-active\nButton discovery outline background active' }
            }
        },
        ghost: {
            hover: {
                primary: { light: 'alpha.08', dark: 'alpha-white.12', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-primary-ghost-hover\nButton primary ghost background hover' },
                secondary: { light: 'alpha.08', dark: 'alpha-white.12', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-secondary-ghost-hover\nButton secondary ghost background hover' },
                info: { light: 'blue.a50', dark: 'blue.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-info-ghost-hover\nButton info ghost background hover' },
                warning: { light: 'orange.a50', dark: 'orange.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-warning-ghost-hover\nButton warning ghost background hover' },
                caution: { light: 'yellow.a50', dark: 'yellow.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-caution-ghost-hover\nButton caution ghost background hover' },
                danger: { light: 'red.a50', dark: 'red.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-danger-ghost-hover\nButton danger ghost background hover' },
                success: { light: 'green.a50', dark: 'green.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-success-ghost-hover\nButton success ghost background hover' },
                discovery: { light: 'purple.a50', dark: 'purple.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-discovery-ghost-hover\nButton discovery ghost background hover' }
            },
            active: {
                primary: { light: 'alpha.12', dark: 'alpha-white.16', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-primary-ghost-active\nButton primary ghost background active' },
                secondary: { light: 'alpha.12', dark: 'alpha-white.16', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-secondary-ghost-active\nButton secondary ghost background active' },
                info: { light: 'blue.a50', dark: 'blue.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-info-ghost-active\nButton info ghost background active' },
                warning: { light: 'orange.a50', dark: 'orange.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-warning-ghost-active\nButton warning ghost background active' },
                caution: { light: 'yellow.a50', dark: 'yellow.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-caution-ghost-active\nButton caution ghost background active' },
                danger: { light: 'red.a50', dark: 'red.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-danger-ghost-active\nButton danger ghost background active' },
                success: { light: 'green.a50', dark: 'green.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-success-ghost-active\nButton success ghost background active' },
                discovery: { light: 'purple.a50', dark: 'purple.a50', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-background-discovery-ghost-active\nButton discovery ghost background active' }
            }
        }
    },

    border: {
        default: { light: 'alpha.10', dark: 'alpha-white.12', scopes: ['STROKE_COLOR'], desc: '--color-border\nDefault border color' },
        disabled: { light: 'alpha.06', dark: 'alpha-white.06', scopes: ['STROKE_COLOR'], desc: '--color-border-disabled\nDisabled border state' },
        soft: {
            alt: {
                primary: { light: 'alpha.06', dark: 'alpha-white.06', scopes: ['STROKE_COLOR'], desc: '--color-border-primary-soft-alt\nButton primary soft border alt' },
                secondary: { light: 'alpha.06', dark: 'alpha-white.06', scopes: ['STROKE_COLOR'], desc: '--color-border-secondary-soft-alt\nButton secondary soft border alt' }
            }
        },
        surface: {
            primary: { light: 'alpha.05', dark: 'alpha-white.08', scopes: ['STROKE_COLOR'], desc: '--color-border-primary-surface\nAlert/Badge primary surface border' },
            info: { light: 'blue.a25', dark: 'blue.a50', scopes: ['STROKE_COLOR'], desc: '--color-border-info-surface\nAlert/Badge info surface border' },
            warning: { light: 'orange.a25', dark: 'orange.a50', scopes: ['STROKE_COLOR'], desc: '--color-border-warning-surface\nAlert/Badge warning surface border' },
            caution: { light: 'yellow.a25', dark: 'yellow.a50', scopes: ['STROKE_COLOR'], desc: '--color-border-caution-surface\nAlert/Badge caution surface border' },
            danger: { light: 'red.a25', dark: 'red.a50', scopes: ['STROKE_COLOR'], desc: '--color-border-danger-surface\nAlert/Badge danger surface border' },
            success: { light: 'green.a25', dark: 'green.a50', scopes: ['STROKE_COLOR'], desc: '--color-border-success-surface\nAlert/Badge success surface border' },
            discovery: { light: 'purple.a25', dark: 'purple.a50', scopes: ['STROKE_COLOR'], desc: '--color-border-discovery-surface\nAlert/Badge discovery surface border' }
        },
        outline: {
            primary: { light: 'alpha.16', dark: 'alpha-white.25', scopes: ['STROKE_COLOR'], desc: '--color-border-primary-outline\nButton primary outline border' },
            secondary: { light: 'alpha.16', dark: 'alpha-white.25', scopes: ['STROKE_COLOR'], desc: '--color-border-secondary-outline\nButton secondary outline border' },
            info: { light: 'blue.500', dark: 'blue.500', scopes: ['STROKE_COLOR'], desc: '--color-border-info-outline\nButton info outline border' },
            warning: { light: 'orange.500', dark: 'orange.500', scopes: ['STROKE_COLOR'], desc: '--color-border-warning-outline\nButton warning outline border' },
            caution: { light: 'yellow.700', dark: 'yellow.700', scopes: ['STROKE_COLOR'], desc: '--color-border-caution-outline\nButton caution outline border' },
            danger: { light: 'red.500', dark: 'red.500', scopes: ['STROKE_COLOR'], desc: '--color-border-danger-outline\nButton danger outline border' },
            success: { light: 'green.500', dark: 'green.500', scopes: ['STROKE_COLOR'], desc: '--color-border-success-outline\nButton success outline border' },
            discovery: { light: 'purple.500', dark: 'purple.500', scopes: ['STROKE_COLOR'], desc: '--color-border-discovery-outline\nButton discovery outline border' },
            hover: {
                primary: { light: 'alpha.20', dark: 'alpha-white.30', scopes: ['STROKE_COLOR'], desc: '--color-border-primary-outline-hover\nButton primary outline border hover' },
                secondary: { light: 'alpha.20', dark: 'alpha-white.30', scopes: ['STROKE_COLOR'], desc: '--color-border-secondary-outline-hover\nButton secondary outline border hover' },
                info: { light: 'blue.500', dark: 'blue.500', scopes: ['STROKE_COLOR'], desc: '--color-border-info-outline-hover\nButton info outline border hover' },
                warning: { light: 'orange.500', dark: 'orange.500', scopes: ['STROKE_COLOR'], desc: '--color-border-warning-outline-hover\nButton warning outline border hover' },
                caution: { light: 'yellow.700', dark: 'yellow.700', scopes: ['STROKE_COLOR'], desc: '--color-border-caution-outline-hover\nButton caution outline border hover' },
                danger: { light: 'red.500', dark: 'red.500', scopes: ['STROKE_COLOR'], desc: '--color-border-danger-outline-hover\nButton danger outline border hover' },
                success: { light: 'green.500', dark: 'green.500', scopes: ['STROKE_COLOR'], desc: '--color-border-success-outline-hover\nButton success outline border hover' },
                discovery: { light: 'purple.500', dark: 'purple.500', scopes: ['STROKE_COLOR'], desc: '--color-border-discovery-outline-hover\nButton discovery outline border hover' }
            }
        }
    },

    text: {
        default: { light: 'gray.1000', dark: 'gray dark.1000', scopes: ['TEXT_FILL'], desc: '--color-text\nPrimary text color' },
        secondary: { light: 'gray.500', dark: 'gray dark.550', scopes: ['TEXT_FILL'], desc: '--color-text-secondary\nSecondary text color' },
        tertiary: { light: 'gray.400', dark: 'gray dark.500', scopes: ['TEXT_FILL'], desc: '--color-text-tertiary\nTertiary text color' },
        disabled: { light: 'alpha.25', dark: 'alpha-white.30', scopes: ['TEXT_FILL'], desc: '--color-text-disabled\nDisabled text color' },
        inverse: { light: 'gray.0', dark: 'gray dark.0', scopes: ['TEXT_FILL'], desc: '--color-text-inverse\nInverse text color (on dark backgrounds)' },
        soft: {
            primary: { light: 'gray.700', dark: 'gray dark.700', scopes: ['TEXT_FILL'], desc: '--color-text-primary-soft\nButton primary soft text' },
            secondary: { light: 'gray.700', dark: 'gray dark.700', scopes: ['TEXT_FILL'], desc: '--color-text-secondary-soft\nButton secondary soft text' },
            info: { light: 'blue.700', dark: 'blue.200', scopes: ['TEXT_FILL'], desc: '--color-text-info-soft\nButton info soft text' },
            warning: { light: 'orange.700', dark: 'orange.400', scopes: ['TEXT_FILL'], desc: '--color-text-warning-soft\nButton warning soft text' },
            caution: { light: 'yellow.800', dark: 'yellow.400', scopes: ['TEXT_FILL'], desc: '--color-text-caution-soft\nButton caution soft text' },
            danger: { light: 'red.600', dark: 'red.400', scopes: ['TEXT_FILL'], desc: '--color-text-danger-soft\nButton danger soft text' },
            success: { light: 'green.600', dark: 'green.300', scopes: ['TEXT_FILL'], desc: '--color-text-success-soft\nButton success soft text' },
            discovery: { light: 'purple.600', dark: 'purple.300', scopes: ['TEXT_FILL'], desc: '--color-text-discovery-soft\nButton discovery soft text' }
        },
        surface: {
            primary: { light: 'gray.700', dark: 'gray dark.700', scopes: ['TEXT_FILL'], desc: '--color-text-primary-surface\nAlert/Badge primary surface text' },
            info: { light: 'blue.700', dark: 'blue.200', scopes: ['TEXT_FILL'], desc: '--color-text-info-surface\nAlert/Badge info surface text' },
            warning: { light: 'orange.700', dark: 'orange.400', scopes: ['TEXT_FILL'], desc: '--color-text-warning-surface\nAlert/Badge warning surface text' },
            caution: { light: 'yellow.800', dark: 'yellow.400', scopes: ['TEXT_FILL'], desc: '--color-text-caution-surface\nAlert/Badge caution surface text' },
            danger: { light: 'red.600', dark: 'red.400', scopes: ['TEXT_FILL'], desc: '--color-text-danger-surface\nAlert/Badge danger surface text' },
            success: { light: 'green.600', dark: 'green.300', scopes: ['TEXT_FILL'], desc: '--color-text-success-surface\nAlert/Badge success surface text' },
            discovery: { light: 'purple.600', dark: 'purple.300', scopes: ['TEXT_FILL'], desc: '--color-text-discovery-surface\nAlert/Badge discovery surface text' }
        },
        solid: {
            primary: { light: 'base.white', dark: 'base.white', scopes: ['TEXT_FILL'], desc: '--color-text-primary-solid\nButton primary solid text' },
            secondary: { light: 'base.white', dark: 'base.white', scopes: ['TEXT_FILL'], desc: '--color-text-secondary-solid\nButton secondary solid text' },
            info: { light: 'base.white', dark: 'base.white', scopes: ['TEXT_FILL'], desc: '--color-text-info-solid\nButton info solid text' },
            warning: { light: 'base.white', dark: 'base.white', scopes: ['TEXT_FILL'], desc: '--color-text-warning-solid\nButton warning solid text' },
            caution: { light: 'base.white', dark: 'base.white', scopes: ['TEXT_FILL'], desc: '--color-text-caution-solid\nButton caution solid text' },
            danger: { light: 'base.white', dark: 'base.white', scopes: ['TEXT_FILL'], desc: '--color-text-danger-solid\nButton danger solid text' },
            success: { light: 'base.white', dark: 'base.white', scopes: ['TEXT_FILL'], desc: '--color-text-success-solid\nButton success solid text' },
            discovery: { light: 'base.white', dark: 'base.white', scopes: ['TEXT_FILL'], desc: '--color-text-discovery-solid\nButton discovery solid text' }
        },
        outline: {
            primary: { light: 'gray.700', dark: 'gray dark.700', scopes: ['TEXT_FILL'], desc: '--color-text-primary-outline\nButton primary outline text' },
            secondary: { light: 'gray.700', dark: 'gray dark.700', scopes: ['TEXT_FILL'], desc: '--color-text-secondary-outline\nButton secondary outline text' },
            info: { light: 'blue.500', dark: 'blue.500', scopes: ['TEXT_FILL'], desc: '--color-text-info-outline\nButton info outline text' },
            warning: { light: 'orange.500', dark: 'orange.500', scopes: ['TEXT_FILL'], desc: '--color-text-warning-outline\nButton warning outline text' },
            caution: { light: 'yellow.700', dark: 'yellow.700', scopes: ['TEXT_FILL'], desc: '--color-text-caution-outline\nButton caution outline text' },
            danger: { light: 'red.500', dark: 'red.500', scopes: ['TEXT_FILL'], desc: '--color-text-danger-outline\nButton danger outline text' },
            success: { light: 'green.500', dark: 'green.500', scopes: ['TEXT_FILL'], desc: '--color-text-success-outline\nButton success outline text' },
            discovery: { light: 'purple.500', dark: 'purple.500', scopes: ['TEXT_FILL'], desc: '--color-text-discovery-outline\nButton discovery outline text' }
        },
        ghost: {
            primary: { light: 'gray.700', dark: 'gray dark.700', scopes: ['TEXT_FILL'], desc: '--color-text-primary-ghost\nButton primary ghost text' },
            secondary: { light: 'gray.500', dark: 'gray dark.550', scopes: ['TEXT_FILL'], desc: '--color-text-secondary-ghost\nButton secondary ghost text' },
            info: { light: 'blue.500', dark: 'blue.500', scopes: ['TEXT_FILL'], desc: '--color-text-info-ghost\nButton info ghost text' },
            warning: { light: 'orange.500', dark: 'orange.500', scopes: ['TEXT_FILL'], desc: '--color-text-warning-ghost\nButton warning ghost text' },
            caution: { light: 'yellow.700', dark: 'yellow.700', scopes: ['TEXT_FILL'], desc: '--color-text-caution-ghost\nButton caution ghost text' },
            danger: { light: 'red.500', dark: 'red.500', scopes: ['TEXT_FILL'], desc: '--color-text-danger-ghost\nButton danger ghost text' },
            success: { light: 'green.500', dark: 'green.500', scopes: ['TEXT_FILL'], desc: '--color-text-success-ghost\nButton success ghost text' },
            discovery: { light: 'purple.500', dark: 'purple.500', scopes: ['TEXT_FILL'], desc: '--color-text-discovery-ghost\nButton discovery ghost text' },
            hover: {
                info: { light: 'blue.500', dark: 'blue.500', scopes: ['TEXT_FILL'], desc: '--color-text-info-ghost-hover\nButton info ghost text hover' },
                warning: { light: 'orange.500', dark: 'orange.500', scopes: ['TEXT_FILL'], desc: '--color-text-warning-ghost-hover\nButton warning ghost text hover' },
                caution: { light: 'yellow.700', dark: 'yellow.700', scopes: ['TEXT_FILL'], desc: '--color-text-caution-ghost-hover\nButton caution ghost text hover' },
                danger: { light: 'red.500', dark: 'red.500', scopes: ['TEXT_FILL'], desc: '--color-text-danger-ghost-hover\nButton danger ghost text hover' },
                success: { light: 'green.500', dark: 'green.500', scopes: ['TEXT_FILL'], desc: '--color-text-success-ghost-hover\nButton success ghost text hover' },
                discovery: { light: 'purple.500', dark: 'purple.500', scopes: ['TEXT_FILL'], desc: '--color-text-discovery-ghost-hover\nButton discovery ghost text hover' }
            }
        }
    },

    icon: {
        default: { light: 'gray.500', dark: 'gray dark.550', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-icon\nDefault icon color' },
        secondary: { light: 'gray.400', dark: 'gray dark.500', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-icon-secondary\nSecondary icon color' },
        tertiary: { light: 'gray.350', dark: 'gray dark.450', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-icon-tertiary\nTertiary icon color' },
        disabled: { light: 'alpha.25', dark: 'alpha-white.30', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-icon-disabled\nDisabled icon color' },
        inverse: { light: 'gray.0', dark: 'gray dark.0', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-icon-inverse\nInverse icon color (on dark backgrounds)' },
        info: { light: 'blue.500', dark: 'blue.400', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-icon-info\nInfo icon color' },
        warning: { light: 'orange.500', dark: 'orange.400', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-icon-warning\nWarning icon color' },
        caution: { light: 'yellow.600', dark: 'yellow.400', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-icon-caution\nCaution icon color' },
        danger: { light: 'red.500', dark: 'red.400', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-icon-danger\nDanger icon color' },
        success: { light: 'green.500', dark: 'green.400', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-icon-success\nSuccess icon color' },
        discovery: { light: 'purple.500', dark: 'purple.400', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--color-icon-discovery\nDiscovery icon color' }
    },

    ring: {
        default: { light: 'blue.200', dark: 'blue.700', scopes: ['EFFECT_COLOR'], desc: '--color-ring\nDefault focus ring color' }
    }
};

// ============================================
// COMPONENT-SPECIFIC TOKENS
// Tokens used by specific UI components
// ============================================

const componentTokens = {
    // Switch component
    switch: {
        track: {
            color: { light: 'gray.150', dark: 'gray.400', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--switch-track-color\nSwitch track background (unchecked)' },
            hover: { light: 'gray.200', dark: 'gray.450', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--switch-track-color-hover\nSwitch track background hover (unchecked)' },
            checked: { light: 'gray.900', dark: 'blue.400', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--switch-track-color-checked\nSwitch track background (checked)' },
            disabled: { light: 'gray.100', dark: 'gray.300', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--switch-track-color-disabled\nSwitch track background (disabled)' },
            checkedDisabled: { light: 'gray.300', dark: 'blue.700', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--switch-track-color-checked-disabled\nSwitch track background (checked + disabled)' }
        },
        thumb: {
            color: { light: 'gray.0', dark: 'gray.1000', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--switch-thumb-color\nSwitch thumb color' },
            disabled: { light: 'gray.0', dark: 'gray.800', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--switch-thumb-color-disabled\nSwitch thumb color (disabled)' }
        }
    },

    // Slider component
    slider: {
        track: {
            color: { light: 'gray.150', dark: 'gray.400', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--slider-track-color\nSlider track background' }
        },
        range: {
            color: { light: 'gray.450', dark: 'gray.600', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--slider-range-color\nSlider filled range color' }
        }
    },

    // Segmented Control component
    segmentedControl: {
        background: { light: 'gray.100', dark: 'gray.0', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--segmented-control-background\nSegmented control container background' },
        thumb: {
            background: { light: 'gray.0', dark: 'gray.300', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--segmented-control-thumb-background\nSegmented control active thumb background' }
        },
        option: {
            highlight: { light: 'gray.200', dark: 'gray.300', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--segmented-control-option-highlight-background-color\nSegmented control option highlight' }
        }
    },

    // Input component
    input: {
        outline: {
            borderHover: { light: 'alpha.25', dark: 'alpha.30', scopes: ['STROKE_COLOR'], desc: '--input-outline-border-color-hover\nInput border color on hover' }
        },
        border: {
            invalid: { light: 'red.500', dark: 'red.600', scopes: ['STROKE_COLOR'], desc: '--input-border-color-invalid\nInput border color when invalid' }
        }
    },

    // Menu component
    menu: {
        item: {
            background: { light: 'alpha.08', dark: 'alpha.10', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--menu-item-background-color\nMenu item hover background' }
        }
    },

    // Avatar component
    avatar: {
        image: {
            border: { light: 'alpha.04', dark: 'alpha.15', scopes: ['STROKE_COLOR'], desc: '--avatar-image-border-color\nAvatar image border color' }
        }
    },

    // Link component
    link: {
        primary: {
            text: { light: 'blue.500', dark: 'blue.300', scopes: ['TEXT_FILL'], desc: '--link-primary-text-color\nPrimary link text color' }
        }
    },

    // Checkbox component
    checkbox: {
        border: { light: 'alpha.25', dark: 'alpha.30', scopes: ['STROKE_COLOR'], desc: '--checkbox-border-color\nCheckbox border color' },
        background: {
            checked: { light: 'gray.900', dark: 'gray.0', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--checkbox-background-color-checked\nCheckbox background when checked' }
        },
        checkmark: { light: 'gray.0', dark: 'gray.900', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--checkbox-checkmark-color\nCheckbox checkmark color' }
    },

    // Radio component
    radio: {
        border: { light: 'alpha.25', dark: 'alpha.30', scopes: ['STROKE_COLOR'], desc: '--radio-border-color\nRadio button border color' },
        dot: { light: 'gray.900', dark: 'gray.0', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--radio-dot-color\nRadio button dot color when selected' }
    },

    // Tooltip component
    tooltip: {
        background: { light: 'gray.900', dark: 'gray.100', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--tooltip-background-color\nTooltip background color' },
        text: { light: 'gray.0', dark: 'gray.900', scopes: ['TEXT_FILL'], desc: '--tooltip-text-color\nTooltip text color' }
    },

    // Popover component
    popover: {
        background: { light: 'gray.0', dark: 'gray.200', scopes: ['FRAME_FILL', 'SHAPE_FILL'], desc: '--popover-background-color\nPopover background color' },
        border: { light: 'alpha.10', dark: 'alpha.12', scopes: ['STROKE_COLOR'], desc: '--popover-border-color\nPopover border color' }
    }
};

// ============================================
// GENERATOR FUNCTIONS
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

function createPrimitiveToken(value, desc) {
    return {
        '$scopes': ['ALL_SCOPES'],
        '$hiddenFromPublishing': true,
        '$description': desc,
        '$type': 'color',
        '$value': value
    };
}

function processSemanticTokens(tokens, mode = 'Light') {
    const result = {};

    for (const [key, value] of Object.entries(tokens)) {
        if (value.light !== undefined && value.dark !== undefined) {
            // This is a leaf token
            const tokenValue = mode === 'Light' ? value.light : value.dark;
            result[key] = createToken(tokenValue, value.scopes, value.desc);
        } else {
            // This is a nested object
            result[key] = processSemanticTokens(value, mode);
        }
    }

    return result;
}

function generatePrimitives() {
    const result = {};

    for (const [paletteName, colors] of Object.entries(primitives)) {
        result[paletteName] = {};
        for (const [step, value] of Object.entries(colors)) {
            const cssVarName = `--${paletteName.replace(' ', '-')}-${step}`;
            result[paletteName][step] = createPrimitiveToken(value, cssVarName);
        }
    }

    return result;
}

function generateDesignSystem() {
    // Generate semantic tokens for both modes
    const lightSemanticTokens = processSemanticTokens(semanticTokens, 'Light');
    const darkSemanticTokens = processSemanticTokens(semanticTokens, 'Dark');

    // Generate component tokens for both modes
    const lightComponentTokens = processSemanticTokens(componentTokens, 'Light');
    const darkComponentTokens = processSemanticTokens(componentTokens, 'Dark');

    // Generate primitive colors
    const primitiveColors = generatePrimitives();

    // Combine into final structure
    const output = [
        {
            'color': {
                'modes': {
                    'Light': { ...lightSemanticTokens, component: lightComponentTokens },
                    'Dark': { ...darkSemanticTokens, component: darkComponentTokens }
                }
            }
        },
        {
            'color primitive': {
                'modes': {
                    'Value': primitiveColors
                }
            }
        }
    ];

    return output;
}

// ============================================
// MAIN EXECUTION
// ============================================

const outputPath = path.join(__dirname, '..', 'reference', 'openai-design-system.json');
const designSystem = generateDesignSystem();

fs.writeFileSync(outputPath, JSON.stringify(designSystem, null, 2));

console.log('✅ Generated openai-design-system.json');
console.log(`   Path: ${outputPath}`);
console.log(`   Size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);
