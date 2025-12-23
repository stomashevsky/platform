'use client';

import { cn } from '@/lib/utils';

/**
 * Header component - PIXEL PERFECT match to OpenAI Platform
 * 
 * ALL VALUES EXTRACTED FROM platform.openai.com via CDP
 * Source: reference/header-v2.json + reference/header-complete.json
 * 
 * ⚠️  НИКАКИХ УГАДАННЫХ ЗНАЧЕНИЙ - ВСЁ из getComputedStyle()
 */

// ============================================
// EXTRACTED VALUES FROM reference/header-v2.json
// ============================================

const EXTRACTED = {
  // FONTS - from header-v2.json
  fonts: {
    family: '"OpenAI Sans", helvetica, sans-serif',
    letterSpacing: '-0.16px',
  },
  
  // HEADER - from header-v2.json
  header: {
    height: 54,
  },
  
  // PROJECT SELECTOR - from header-v2.json + header-complete.json
  projectSelector: {
    avatar: {
      width: 25,
      height: 25,
      borderRadius: '9999px',
      backgroundColor: '#181818',
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: '24px',
    },
    personalText: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#282828',
      letterSpacing: '-0.16px',
    },
    separator: {
      fontSize: '14px',
      fontWeight: 400,
      color: '#8f8f8f',
    },
    projectType: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#282828',
    },
  },
  
  // NAVIGATION - from header-v2.json
  navigation: {
    item: {
      fontSize: '14px',
      padding: '6px',
      borderRadius: '8px',
      lineHeight: '21px',
      letterSpacing: '-0.16px',
    },
    active: {
      fontWeight: 600,
      color: '#0d0d0d',
    },
    inactive: {
      fontWeight: 400,
      color: '#5d5d5d',
    },
    hover: {
      color: '#101010', // rgb(16, 16, 16)
    },
  },
  
  // GAPS - from header-v2.json
  gaps: {
    navItems: 11,
    lastNavToSettings: 10,
    settingsToAvatar: 16,
  },
  
  // SETTINGS BUTTON - from header-v2.json
  settingsButton: {
    width: 28,
    height: 28,
    borderRadius: '100%',
    color: '#0d0d0d',
  },
  
  // USER AVATAR - from header-v2.json
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: '9999px',
    backgroundColor: '#ededed',
  },
} as const;

// ============================================
// SVG ICONS - FULL outerHTML from reference/header-v2.json
// ============================================

// Settings icon - 20x20, viewBox 0 0 24 24
const SettingsIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path fillRule="evenodd" d="M11.568 3.5a1 1 0 0 0-.863.494l-.811 1.381A3.001 3.001 0 0 1 7.33 6.856l-1.596.013a1 1 0 0 0-.858.501l-.439.761a1 1 0 0 0-.004.992l.792 1.4a3 3 0 0 1 0 2.954l-.792 1.4a1 1 0 0 0 .004.992l.439.76a1 1 0 0 0 .858.502l1.596.013a3 3 0 0 1 2.564 1.48l.811 1.382a1 1 0 0 0 .863.494h.87a1 1 0 0 0 .862-.494l.812-1.381a3.001 3.001 0 0 1 2.563-1.481l1.596-.013a1 1 0 0 0 .86-.501l.438-.761a1 1 0 0 0 .004-.992l-.793-1.4a3 3 0 0 1 0-2.954l.793-1.4a1 1 0 0 0-.004-.992l-.439-.76a1 1 0 0 0-.858-.502l-1.597-.013a3 3 0 0 1-2.563-1.48L13.3 3.993a1 1 0 0 0-.862-.494h-.87ZM8.98 2.981A3.001 3.001 0 0 1 11.568 1.5h.87c1.064 0 2.049.564 2.588 1.481l.811 1.382a1 1 0 0 0 .855.494l1.596.013a3 3 0 0 1 2.575 1.502l.44.76a3 3 0 0 1 .011 2.975l-.792 1.4a1 1 0 0 0 0 .985l.792 1.401a3 3 0 0 1-.012 2.974l-.439.761a3.001 3.001 0 0 1-2.575 1.503l-1.597.012a1 1 0 0 0-.854.494l-.811 1.382a3.001 3.001 0 0 1-2.588 1.481h-.87a3.001 3.001 0 0 1-2.588-1.481l-.811-1.382a1 1 0 0 0-.855-.494l-1.596-.012a3.001 3.001 0 0 1-2.576-1.503l-.438-.76a3 3 0 0 1-.013-2.975l.793-1.4a1 1 0 0 0 0-.985l-.793-1.4a3 3 0 0 1 .013-2.975l.438-.761A3.001 3.001 0 0 1 5.718 4.87l1.596-.013a1 1 0 0 0 .855-.494l.81-1.382Z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M12.003 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM8.502 12a3.5 3.5 0 1 1 7 .001 3.5 3.5 0 0 1-7-.001Z" clipRule="evenodd" />
  </svg>
);

// Expand icon - 8x12, viewBox 0 0 10 16
const ExpandIcon = () => (
  <svg 
    width="8" 
    height="12" 
    viewBox="0 0 10 16" 
    fill="currentColor"
    style={{ color: '#5d5d5d' }}
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M4.34151 0.747423C4.71854 0.417526 5.28149 0.417526 5.65852 0.747423L9.65852 4.24742C10.0742 4.61111 10.1163 5.24287 9.75259 5.6585C9.38891 6.07414 8.75715 6.11626 8.34151 5.75258L5.00001 2.82877L1.65852 5.75258C1.24288 6.11626 0.61112 6.07414 0.247438 5.6585C-0.116244 5.24287 -0.0741267 4.61111 0.34151 4.24742L4.34151 0.747423ZM0.246065 10.3578C0.608879 9.94139 1.24055 9.89795 1.65695 10.2608L5.00001 13.1737L8.34308 10.2608C8.75948 9.89795 9.39115 9.94139 9.75396 10.3578C10.1168 10.7742 10.0733 11.4058 9.65695 11.7687L5.65695 15.2539C5.28043 15.582 4.7196 15.582 4.34308 15.2539L0.343082 11.7687C-0.0733128 11.4058 -0.116749 10.7742 0.246065 10.3578Z" />
  </svg>
);

// ============================================
// HEADER COMPONENT
// ============================================

export interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn('flex items-center justify-between', className)}
      style={{
        height: EXTRACTED.header.height,
        fontFamily: EXTRACTED.fonts.family,
      }}
    >
      {/* LEFT SECTION - Project Selector */}
      <div className="flex items-center">
        {/* Avatar */}
        <div
          className="flex items-center justify-center"
          style={{
            width: EXTRACTED.projectSelector.avatar.width,
            height: EXTRACTED.projectSelector.avatar.height,
            borderRadius: EXTRACTED.projectSelector.avatar.borderRadius,
            backgroundColor: EXTRACTED.projectSelector.avatar.backgroundColor,
            color: EXTRACTED.projectSelector.avatar.color,
            fontSize: EXTRACTED.projectSelector.avatar.fontSize,
            fontWeight: EXTRACTED.projectSelector.avatar.fontWeight,
            lineHeight: EXTRACTED.projectSelector.avatar.lineHeight,
          }}
        >
          P
        </div>
        
        {/* Personal Button */}
        <button className="flex items-center ml-2">
          <span
            style={{
              fontSize: EXTRACTED.projectSelector.personalText.fontSize,
              fontWeight: EXTRACTED.projectSelector.personalText.fontWeight,
              color: EXTRACTED.projectSelector.personalText.color,
              letterSpacing: EXTRACTED.projectSelector.personalText.letterSpacing,
            }}
          >
            Personal
          </span>
          <span className="ml-1">
            <ExpandIcon />
          </span>
        </button>
        
        {/* Separator */}
        <span
          className="mx-2"
          style={{
            fontSize: EXTRACTED.projectSelector.separator.fontSize,
            fontWeight: EXTRACTED.projectSelector.separator.fontWeight,
            color: EXTRACTED.projectSelector.separator.color,
          }}
        >
          /
        </span>
        
        {/* Default Project Button */}
        <button className="flex items-center">
          <span
            style={{
              fontSize: EXTRACTED.projectSelector.projectType.fontSize,
              fontWeight: EXTRACTED.projectSelector.projectType.fontWeight,
              color: EXTRACTED.projectSelector.projectType.color,
            }}
          >
            Default project
          </span>
          <span className="ml-1">
            <ExpandIcon />
          </span>
        </button>
      </div>
      
      {/* RIGHT SECTION - Navigation + Settings + Avatar */}
      <div 
        className="flex items-center"
        style={{ gap: EXTRACTED.gaps.navItems }}
      >
        {/* Navigation Items */}
        <nav 
          className="flex items-center"
          style={{ gap: EXTRACTED.gaps.navItems }}
        >
          {/* Dashboard - Active */}
          <a
            href="/chat"
            className="transition-colors"
            style={{
              fontSize: EXTRACTED.navigation.item.fontSize,
              padding: EXTRACTED.navigation.item.padding,
              borderRadius: EXTRACTED.navigation.item.borderRadius,
              lineHeight: EXTRACTED.navigation.item.lineHeight,
              letterSpacing: EXTRACTED.navigation.item.letterSpacing,
              fontWeight: EXTRACTED.navigation.active.fontWeight,
              color: EXTRACTED.navigation.active.color,
            }}
          >
            Dashboard
          </a>
          
          {/* Docs - Inactive */}
          <a
            href="/docs"
            className="transition-colors hover:text-[#101010]"
            style={{
              fontSize: EXTRACTED.navigation.item.fontSize,
              padding: EXTRACTED.navigation.item.padding,
              borderRadius: EXTRACTED.navigation.item.borderRadius,
              lineHeight: EXTRACTED.navigation.item.lineHeight,
              letterSpacing: EXTRACTED.navigation.item.letterSpacing,
              fontWeight: EXTRACTED.navigation.inactive.fontWeight,
              color: EXTRACTED.navigation.inactive.color,
            }}
          >
            Docs
          </a>
          
          {/* API reference - Inactive */}
          <a
            href="/docs/api-reference/introduction"
            className="transition-colors hover:text-[#101010]"
            style={{
              fontSize: EXTRACTED.navigation.item.fontSize,
              padding: EXTRACTED.navigation.item.padding,
              borderRadius: EXTRACTED.navigation.item.borderRadius,
              lineHeight: EXTRACTED.navigation.item.lineHeight,
              letterSpacing: EXTRACTED.navigation.item.letterSpacing,
              fontWeight: EXTRACTED.navigation.inactive.fontWeight,
              color: EXTRACTED.navigation.inactive.color,
            }}
          >
            API reference
          </a>
        </nav>
        
        {/* Settings Button */}
        <a
          href="/settings"
          className="flex items-center justify-center transition-colors hover:opacity-70"
          style={{
            width: EXTRACTED.settingsButton.width,
            height: EXTRACTED.settingsButton.height,
            borderRadius: EXTRACTED.settingsButton.borderRadius,
            color: EXTRACTED.settingsButton.color,
            marginLeft: EXTRACTED.gaps.lastNavToSettings - EXTRACTED.gaps.navItems, // adjust for parent gap
          }}
        >
          <SettingsIcon />
        </a>
        
        {/* User Avatar */}
        <button
          className="flex items-center justify-center overflow-hidden"
          style={{
            width: EXTRACTED.userAvatar.width,
            height: EXTRACTED.userAvatar.height,
            borderRadius: EXTRACTED.userAvatar.borderRadius,
            backgroundColor: EXTRACTED.userAvatar.backgroundColor,
            marginLeft: EXTRACTED.gaps.settingsToAvatar - EXTRACTED.gaps.navItems, // adjust for parent gap
          }}
        >
          {/* User image or initials would go here */}
        </button>
      </div>
    </header>
  );
}

export default Header;
