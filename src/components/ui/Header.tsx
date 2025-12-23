'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Header component - PIXEL PERFECT match to OpenAI Platform
 * 
 * ALL VALUES EXTRACTED FROM platform.openai.com via CDP
 * Sources: 
 *   - reference/header-v3.json (gaps, hover states, nav items)
 *   - reference/header-complete.json (project selector positions)
 * 
 * КРИТИЧЕСКИ ВАЖНО: ВСЕ значения из извлечённых данных!
 */

// ============================================
// EXTRACTED VALUES (объединены из v3 и complete)
// ============================================

/**
 * EXTRACTED VALUES - из navbar-complete.json и header-complete.json
 * 
 * Все значения извлечены из platform.openai.com через CDP!
 * Дата извлечения: 2025-12-23
 */
const EXTRACTED = {
  // FONTS
  fonts: {
    family: '"OpenAI Sans", helvetica, sans-serif',
  },
  
  // LAYOUT - точные позиции из оригинала
  layout: {
    headerHeight: 54,
    headerPaddingLeft: 12, // Извлечено: 0px 12px
    headerPaddingRight: 12, // Извлечено: 0px 12px
  },
  
  // PROJECT SELECTOR - ТОЧНЫЕ значения из оригинала (2025-12-23)
  projectSelector: {
    // Кнопка Personal (включает аватарку + текст + chevron)
    // padding: "0px 10px 0px 6px", borderRadius: "8px", gap: "8px"
    personalButtonContainer: {
      padding: '0px 10px 0px 6px', // top right bottom left
      paddingTop: '0px',
      paddingRight: '10px',
      paddingBottom: '0px',
      paddingLeft: '6px',
      borderRadius: '8px',
      gap: 8, // между элементами внутри
      height: 32,
    },
    
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
    
    personalButton: {
      // Text styles
      fontSize: '14px',
      fontWeight: 600,
      color: '#282828',
      letterSpacing: '-0.16px',
      lineHeight: '24px',
      // Gap между текстом и иконкой
      textToIconGap: 8,
    },
    
    separator: {
      text: '/',
      fontSize: '14px',
      fontWeight: 400,
      color: '#8f8f8f',
      // marginLeft/marginRight извлечены как "0px", 
      // но визуально есть gap - он создаётся parent flex gap
      marginLeft: 8,
      marginRight: 8,
    },
    
    // Кнопка Default project
    // padding: "0px 10px", borderRadius: "8px", gap: "8px", height: 32px
    projectTypeButtonContainer: {
      padding: '0px 10px',
      borderRadius: '8px',
      gap: 8,
      height: 32,
    },
    
    projectTypeButton: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#282828',
      lineHeight: '24px',
      letterSpacing: '-0.16px',
      textToIconGap: 8,
    },
  },
  
  // NAVIGATION - из navbar-complete.json
  navigation: {
    item: {
      fontSize: '14px',
      padding: '6px',
      borderRadius: '8px',
      lineHeight: '21px',
      letterSpacing: '-0.16px',
    },
    active: {
      fontWeight: 600, // Dashboard - активный элемент
      color: '#0d0d0d',
    },
    inactive: {
      fontWeight: 400, // Docs, API reference - неактивные
      color: '#5d5d5d',
    },
    // HOVER - при наведении цвет меняется на #0d0d0d
    hover: {
      color: '#0d0d0d',
      backgroundColor: 'transparent',
    },
  },
  
  // GAPS - из navbar-complete.json
  gaps: {
    navItemGap: 11, // между Dashboard, Docs, API reference
    lastNavToSettings: 10, // от API reference до settings
    settingsToAvatar: 16, // от settings до user avatar
  },
  
  // SETTINGS BUTTON
  settingsButton: {
    width: 28,
    height: 28,
    borderRadius: '100%',
    color: '#0d0d0d',
  },
  
  // USER AVATAR - правая аватарка
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: '9999px',
    backgroundColor: '#181818', // Fallback - темнее, как просил юзер
    overflow: 'hidden',
  },
  
  // EXPAND ICON - иконка раскрытия в кнопках Personal/Default project
  expandIcon: {
    width: 8,
    height: 12,
    color: '#5d5d5d',
  },
} as const;

// ============================================
// SVG ICONS - FULL outerHTML from reference/header-v3.json
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

// Expand icon - 8x12, viewBox 0 0 10 16, color #5d5d5d
const ExpandIcon = () => (
  <svg 
    width={EXTRACTED.expandIcon.width}
    height={EXTRACTED.expandIcon.height}
    viewBox="0 0 10 16" 
    fill="currentColor"
    style={{ color: EXTRACTED.expandIcon.color }}
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M4.34151 0.747423C4.71854 0.417526 5.28149 0.417526 5.65852 0.747423L9.65852 4.24742C10.0742 4.61111 10.1163 5.24287 9.75259 5.6585C9.38891 6.07414 8.75715 6.11626 8.34151 5.75258L5.00001 2.82877L1.65852 5.75258C1.24288 6.11626 0.61112 6.07414 0.247438 5.6585C-0.116244 5.24287 -0.0741267 4.61111 0.34151 4.24742L4.34151 0.747423ZM0.246065 10.3578C0.608879 9.94139 1.24055 9.89795 1.65695 10.2608L5.00001 13.1737L8.34308 10.2608C8.75948 9.89795 9.39115 9.94139 9.75396 10.3578C10.1168 10.7742 10.0733 11.4058 9.65695 11.7687L5.65695 15.2539C5.28043 15.582 4.7196 15.582 4.34308 15.2539L0.343082 11.7687C-0.0733128 11.4058 -0.116749 10.7742 0.246065 10.3578Z" />
  </svg>
);

// ============================================
// HEADER COMPONENT
// ============================================

export interface HeaderProps {
  className?: string;
  /** URL изображения аватарки пользователя */
  userAvatarSrc?: string;
  /** Имя пользователя для alt текста */
  userName?: string;
  /** Callback при клике на аватарку */
  onAvatarClick?: () => void;
  /** Callback для hamburger menu (mobile) */
  onMenuToggle?: () => void;
  /** Состояние mobile меню */
  isMobileMenuOpen?: boolean;
}

// Hamburger icon for mobile - inline to avoid import issues
const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 6h16M4 12h16" />
  </svg>
);

export function Header({ 
  className,
  userAvatarSrc,
  userName = 'User',
  onAvatarClick,
  onMenuToggle,
  isMobileMenuOpen,
}: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const handleAvatarClick = () => {
    if (onAvatarClick) {
      onAvatarClick();
    } else {
      setIsUserMenuOpen(!isUserMenuOpen);
    }
  };
  
  return (
    <header
      className={cn('flex items-center justify-between', className)}
      style={{
        height: EXTRACTED.layout.headerHeight,
        fontFamily: EXTRACTED.fonts.family,
        paddingLeft: EXTRACTED.layout.headerPaddingLeft,
        paddingRight: EXTRACTED.layout.headerPaddingRight,
      }}
    >
      {/* LEFT SECTION - Project Selector */}
      <div 
        className="flex items-center"
      >
        {/* Personal Button - Avatar + Text + Icon as ONE button */}
        {/* EXACT: padding: 0px 10px 0px 6px, borderRadius: 8px, gap: 8px, height: 32px */}
        <button 
          className="flex items-center transition-colors"
          style={{ 
            gap: EXTRACTED.projectSelector.personalButtonContainer.gap,
            padding: EXTRACTED.projectSelector.personalButtonContainer.padding,
            borderRadius: EXTRACTED.projectSelector.personalButtonContainer.borderRadius,
            height: EXTRACTED.projectSelector.personalButtonContainer.height,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {/* Avatar "P" */}
          <div
            className="flex items-center justify-center shrink-0"
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
          
          {/* Text + Expand icon */}
          <div 
            className="flex items-center"
            style={{ gap: EXTRACTED.projectSelector.personalButton.textToIconGap }}
          >
            <span
              style={{
                fontSize: EXTRACTED.projectSelector.personalButton.fontSize,
                fontWeight: EXTRACTED.projectSelector.personalButton.fontWeight,
                color: EXTRACTED.projectSelector.personalButton.color,
                letterSpacing: EXTRACTED.projectSelector.personalButton.letterSpacing,
                lineHeight: EXTRACTED.projectSelector.personalButton.lineHeight,
              }}
            >
              Personal
            </span>
            <ExpandIcon />
          </div>
        </button>
        
        {/* Separator */}
        <span
          style={{
            fontSize: EXTRACTED.projectSelector.separator.fontSize,
            fontWeight: EXTRACTED.projectSelector.separator.fontWeight,
            color: EXTRACTED.projectSelector.separator.color,
            marginLeft: EXTRACTED.projectSelector.separator.marginLeft,
            marginRight: EXTRACTED.projectSelector.separator.marginRight,
          }}
        >
          /
        </span>
        
        {/* Default Project Button */}
        {/* EXACT: padding: 0px 10px, borderRadius: 8px, gap: 8px, height: 32px */}
        <button 
          className="flex items-center transition-colors"
          style={{ 
            gap: EXTRACTED.projectSelector.projectTypeButtonContainer.gap,
            padding: EXTRACTED.projectSelector.projectTypeButtonContainer.padding,
            borderRadius: EXTRACTED.projectSelector.projectTypeButtonContainer.borderRadius,
            height: EXTRACTED.projectSelector.projectTypeButtonContainer.height,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span
            style={{
              fontSize: EXTRACTED.projectSelector.projectTypeButton.fontSize,
              fontWeight: EXTRACTED.projectSelector.projectTypeButton.fontWeight,
              color: EXTRACTED.projectSelector.projectTypeButton.color,
              lineHeight: EXTRACTED.projectSelector.projectTypeButton.lineHeight,
              letterSpacing: EXTRACTED.projectSelector.projectTypeButton.letterSpacing,
            }}
          >
            Default project
          </span>
          <ExpandIcon />
        </button>
      </div>
      
      {/* RIGHT SECTION - Navigation + Settings + Avatar (Desktop) */}
      {/* Hidden on mobile (< 768px), shown on desktop */}
      <div 
        className="hidden md:flex items-center"
        style={{ gap: EXTRACTED.gaps.navItemGap }}
      >
        {/* Navigation Items */}
        <nav 
          className="flex items-center"
          style={{ gap: EXTRACTED.gaps.navItemGap }}
        >
          {/* Dashboard - Active */}
          <a
            href="/chat"
            style={{
              fontSize: EXTRACTED.navigation.item.fontSize,
              padding: EXTRACTED.navigation.item.padding,
              borderRadius: EXTRACTED.navigation.item.borderRadius,
              lineHeight: EXTRACTED.navigation.item.lineHeight,
              letterSpacing: EXTRACTED.navigation.item.letterSpacing,
              fontWeight: EXTRACTED.navigation.active.fontWeight,
              color: EXTRACTED.navigation.active.color,
              textDecoration: 'none',
            }}
          >
            Dashboard
          </a>
          
          {/* Docs - Inactive with hover */}
          <a
            href="/docs"
            className="transition-colors"
            style={{
              fontSize: EXTRACTED.navigation.item.fontSize,
              padding: EXTRACTED.navigation.item.padding,
              borderRadius: EXTRACTED.navigation.item.borderRadius,
              lineHeight: EXTRACTED.navigation.item.lineHeight,
              letterSpacing: EXTRACTED.navigation.item.letterSpacing,
              fontWeight: EXTRACTED.navigation.inactive.fontWeight,
              color: EXTRACTED.navigation.inactive.color,
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = EXTRACTED.navigation.hover.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = EXTRACTED.navigation.inactive.color;
            }}
          >
            Docs
          </a>
          
          {/* API reference - Inactive with hover */}
          <a
            href="/docs/api-reference/introduction"
            className="transition-colors"
            style={{
              fontSize: EXTRACTED.navigation.item.fontSize,
              padding: EXTRACTED.navigation.item.padding,
              borderRadius: EXTRACTED.navigation.item.borderRadius,
              lineHeight: EXTRACTED.navigation.item.lineHeight,
              letterSpacing: EXTRACTED.navigation.item.letterSpacing,
              fontWeight: EXTRACTED.navigation.inactive.fontWeight,
              color: EXTRACTED.navigation.inactive.color,
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = EXTRACTED.navigation.hover.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = EXTRACTED.navigation.inactive.color;
            }}
          >
            API reference
          </a>
        </nav>
        
        {/* Settings Button */}
        <a
          href="/settings"
          className="flex items-center justify-center transition-colors"
          style={{
            width: EXTRACTED.settingsButton.width,
            height: EXTRACTED.settingsButton.height,
            borderRadius: EXTRACTED.settingsButton.borderRadius,
            color: EXTRACTED.settingsButton.color,
            marginLeft: EXTRACTED.gaps.lastNavToSettings - EXTRACTED.gaps.navItemGap,
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#dfdfdf';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <SettingsIcon />
        </a>
        
        {/* User Avatar */}
        <button
          onClick={handleAvatarClick}
          className="flex items-center justify-center shrink-0 transition-colors"
          style={{
            width: EXTRACTED.userAvatar.width,
            height: EXTRACTED.userAvatar.height,
            borderRadius: EXTRACTED.userAvatar.borderRadius,
            backgroundColor: EXTRACTED.userAvatar.backgroundColor,
            overflow: EXTRACTED.userAvatar.overflow,
            marginLeft: EXTRACTED.gaps.settingsToAvatar - EXTRACTED.gaps.navItemGap,
          }}
          aria-label={`User menu for ${userName}`}
        >
          {userAvatarSrc ? (
            // Показываем изображение пользователя
            <img
              src={userAvatarSrc}
              alt={userName}
              className="w-full h-full object-cover"
              style={{ borderRadius: EXTRACTED.userAvatar.borderRadius }}
            />
          ) : (
            // Fallback - серый круг как в оригинале когда нет фото
            <div 
              className="w-full h-full"
              style={{ backgroundColor: EXTRACTED.userAvatar.backgroundColor }}
            />
          )}
        </button>
      </div>
      
      {/* MOBILE - Hamburger menu button */}
      {/* Shown on mobile (< 768px), hidden on desktop */}
      {/* OpenAI exact: 22x22px hamburger icon */}
      <button
        onClick={onMenuToggle}
        className="flex md:hidden items-center justify-center"
        style={{
          width: 28,
          height: 28,
          color: '#0d0d0d',
        }}
        aria-label="Toggle menu"
      >
        <HamburgerIcon />
      </button>
    </header>
  );
}

export default Header;
