'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { 
  ChatIcon,
  AppsIcon,
  AgentBuilderIcon,
  AudioIcon,
  ImagesIcon,
  VideosIcon,
  AssistantsIcon,
  UsageIcon,
  ApiKeysIcon,
  LogsIcon,
  StorageIcon,
  BatchesIcon,
  EvaluationIcon,
  FineTuningIcon,
  SidebarCollapseIcon,
} from '@/components/icons';

/**
 * Sidebar matching OpenAI Platform EXACTLY
 * 
 * Extracted CSS Classes from OpenAI (December 2024):
 * 
 * aside.JiHZk: width 210px, padding 14px 0 0, display flex column
 * div.uDpF9: flexGrow 1 (scrollable container)
 * div.sQbJC: margin 0 0 0 -8px, padding 0 12px 16px, overflow auto
 * div.pb-3: width 194px, padding 0 0 12px (section container)
 * div.z3hHU: padding 6px 12px 6px 4px (footer)
 * 
 * h3.cTBD-: width 194px, height 22px, padding 0 12px 8px
 *           fontSize 13px, fontWeight 500, color #8f8f8f, lineHeight 14px
 * 
 * a.k-D0f._8xE3c: width 194px, height 32px, margin 0 0 4px
 *                 display flex, alignItems center, position relative
 *                 fontSize 14px, fontWeight 400, lineHeight 20px
 *                 color #282828 (inactive), #181818 (active)
 *                 ::before bg #dfdfdf (active), borderRadius 6px
 * 
 * span.J42DB: width 32px, height 20px, margin 0 2px 0 4px
 *             display flex, alignItems center, justifyContent center, flexShrink 0
 * 
 * span.lp65A: display block, overflow hidden, flexShrink 1
 * 
 * button._8xE3c: width 40px, height 32px, position relative
 *                ::before bg #dfdfdf, borderRadius 6px
 * 
 * div.eE5Hy: width 194px, margin 8px 0, padding 6px 12px 10px
 *            backgroundColor #f3f3f3, borderRadius 8px
 */

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
  href?: string;
}

// Menu item - OpenAI uses <a> tags, we use button for onClick
// a.k-D0f._8xE3c (inactive) / a.k-D0f._8xE3c.rZ3k- (active)
// 
// OpenAI hover uses OPACITY on ::before, not background-color change:
// - Normal (inactive): opacity 0 (invisible)
// - Hover: opacity 0.5 (semi-transparent)
// - Active: opacity 1 (fully visible)
// ::before background is always #dfdfdf
function SidebarItem({ icon, label, active, collapsed, onClick }: SidebarItemProps) {
  if (collapsed) {
    // Collapsed mode - icon only button
    // button._8xE3c: width 40px, height 32px, centered icon
    return (
      <button
        onClick={onClick}
        title={label}
        style={{
          width: '40px',
          height: '32px',
          margin: '0px 0px 4px',
          padding: '0',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className={cn(
          'before:absolute before:inset-0 before:rounded-[6px] before:bg-[#dfdfdf]',
          'before:transition-[opacity,background-color,transform,box-shadow,color]',
          'before:duration-150 before:ease-[cubic-bezier(0.19,1,0.22,1)]',
          // OpenAI uses opacity: 0 → 0.5 → 1
          active ? 'before:opacity-100' : 'before:opacity-0 hover:before:opacity-50'
        )}
      >
        <span 
          className="relative z-10 flex items-center justify-center"
          style={{ 
            width: '20px', 
            height: '20px',
            color: active ? '#181818' : '#282828',
          }}
        >
          {icon}
        </span>
      </button>
    );
  }

  // Expanded mode - exact OpenAI styles
  // a.k-D0f._8xE3c: width 194px, height 32px, margin 0 0 4px
  return (
    <button
      onClick={onClick}
      style={{
        width: '194px',
        height: '32px',
        margin: '0px 0px 4px',
        padding: '0px',
        background: 'transparent',
        border: 'none',
        cursor: active ? 'default' : 'pointer',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '20px',
        letterSpacing: '-0.16px',
        textAlign: 'left',
        color: active ? '#181818' : '#282828',
      }}
      className={cn(
        'before:absolute before:inset-0 before:rounded-[6px] before:bg-[#dfdfdf]',
        'before:transition-[opacity,background-color,transform,box-shadow,color]',
        'before:duration-150 before:ease-[cubic-bezier(0.19,1,0.22,1)]',
        // OpenAI uses opacity: 0 → 0.5 → 1
        active ? 'before:opacity-100' : 'before:opacity-0 hover:before:opacity-50'
      )}
    >
      {/* span.J42DB: width 32px, height 20px, margin 0 2px 0 4px */}
      <span 
        className="relative z-10 flex items-center justify-center flex-shrink-0"
        style={{ 
          width: '32px', 
          height: '20px',
          margin: '0px 2px 0px 4px',
        }}
      >
        {icon}
      </span>
      {/* span.lp65A: display block, overflow hidden */}
      <span 
        className="relative z-10 block overflow-hidden flex-shrink"
        style={{ 
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </span>
    </button>
  );
}

interface SidebarSectionProps {
  title?: string;
  children: ReactNode;
  collapsed?: boolean;
}

// Section container - div.pb-3
// In collapsed state: title stays in DOM with visibility:hidden to preserve vertical positions
function SidebarSection({ title, children, collapsed }: SidebarSectionProps) {
  // div.pb-3: width 194px (expanded) / 40px (collapsed), padding 0 0 12px
  // h3.cTBD-: width 194px, height 22px, padding 0 12px 8px
  return (
    <div style={{ 
      width: collapsed ? '40px' : '194px',
      padding: '0px 0px 12px',
      margin: '0px',
    }}>
      {title && (
        <h3 
          style={{
            width: collapsed ? '40px' : '194px',
            height: '22px',
            padding: '0px 12px 8px',
            margin: '0px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#8f8f8f',
            lineHeight: '14px',
            letterSpacing: '-0.16px',
            // CRITICAL: visibility:hidden keeps element in layout, icons don't jump
            visibility: collapsed ? 'hidden' : 'visible',
          }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

// No visible divider in OpenAI - sections have padding-bottom instead
function SidebarDivider({ collapsed }: { collapsed?: boolean }) {
  return null;
}

interface AddCreditsCardProps {
  onClose?: () => void;
  onBilling?: () => void;
}

// div.eE5Hy: width 194px, margin 8px 0, padding 6px 12px 10px
// Title: fontSize 14px, fontWeight 600, color #282828
// Description: fontSize 14px, color #5d5d5d
// Close button: 22x22px, icon 16x16
// Arrow icon: 20x20
function AddCreditsCard({ onClose, onBilling }: AddCreditsCardProps) {
  return (
    <div 
      style={{ 
        width: '194px',
        margin: '8px 0px',
        padding: '6px 12px 10px',
        backgroundColor: '#f3f3f3',
        borderRadius: '8px',
        border: '1px solid rgba(0,0,0,0.1)',
        fontSize: '14px',
        lineHeight: '21px',
        letterSpacing: '-0.16px',
        color: '#282828',
        cursor: 'pointer',
      }}
      onClick={onBilling}
    >
      {/* Header row with title, arrow, and close button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Title with arrow */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <strong style={{ fontWeight: 600, color: '#282828' }}>Add credits</strong>
          {/* Arrow icon - 20x20 */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#282828' }}>
            <path fillRule="evenodd" d="M9.293 7.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414-1.414L12.586 12 9.293 8.707a1 1 0 0 1 0-1.414Z" clipRule="evenodd" />
          </svg>
        </div>
        
        {/* Close button - 22x22px with 16x16 icon */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          style={{ 
            width: '22px',
            height: '22px',
            padding: '0',
            background: 'transparent', 
            border: 'none', 
            cursor: 'pointer', 
            color: '#8f8f8f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="hover:text-[#0d0d0d] rounded-[6px] hover:bg-[#ededed] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M5.636 5.636a1 1 0 0 1 1.414 0l4.95 4.95 4.95-4.95a1 1 0 0 1 1.414 1.414L13.414 12l4.95 4.95a1 1 0 0 1-1.414 1.414L12 13.414l-4.95 4.95a1 1 0 0 1-1.414-1.414l4.95-4.95-4.95-4.95a1 1 0 0 1 0-1.414Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Description */}
      <span style={{ 
        display: 'block',
        fontSize: '14px', 
        color: '#5d5d5d', 
        lineHeight: '21px',
        marginTop: '4px',
      }}>
        Run your next API request by adding credits.
      </span>
      
      {/* Button container */}
      <div style={{ marginTop: '12px' }}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onBilling?.();
          }}
          style={{
            height: '28px',
            padding: '0 13.3px',
            backgroundColor: '#181818',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            color: '#ffffff',
          }}
          className="hover:bg-[#0d0d0d] transition-colors"
        >
          Go to Billing
        </button>
      </div>
    </div>
  );
}

export interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
  showCreditsCard?: boolean;
  onCreditsClose?: () => void;
  onBilling?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function Sidebar({ 
  activeItem = 'chat',
  onItemClick,
  showCreditsCard = true,
  onCreditsClose,
  onBilling,
  collapsed = false,
  onToggle,
  className 
}: SidebarProps) {
  const handleItemClick = (item: string) => {
    onItemClick?.(item);
  };

  // aside.JiHZk: width 210px, padding 14px 0 0, display flex column
  // OpenAI sidebar: overflow visible, but content uses flexShrink to fit
  return (
    <aside
      style={{
        width: collapsed ? '64px' : '210px',
        padding: '14px 0px 0px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible', // OpenAI exact: overflow visible (allows negative margin content)
      }}
      className={cn(
        'h-full bg-transparent',
        className
      )}
    >
      {/* Scrollable menu area - OpenAI: flexGrow 1, overflow-y auto */}
      {/* Menu items scroll while footer stays fixed at bottom */}
      {/* Scrollbar hidden but scrolling works (like OpenAI) */}
      <div 
        className="sidebar-scroll-area"
        style={{
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: '0%',
          minHeight: 0, // Critical for flex + overflow to work together!
          width: '218px', // OpenAI exact: 218px (210 sidebar + 8px negative margin)
          margin: '0px 0px 0px -8px', // Constant - prevents icon jump
          padding: '0px 12px 16px 12px', // Constant - prevents icon jump
          overflowX: 'hidden',
          overflowY: 'auto',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)', // OpenAI: separator is borderBottom on scroll container
          boxSizing: 'border-box', // OpenAI uses border-box
        }}
      >
          {/* Create Section */}
          <SidebarSection title="Create" collapsed={collapsed}>
            <SidebarItem 
              icon={<ChatIcon size={20} />}
              label="Chat"
              active={activeItem === 'chat'}
              collapsed={collapsed}
              onClick={() => handleItemClick('chat')}
            />
            <SidebarItem 
              icon={<AppsIcon size={20} />}
              label="ChatGPT Apps"
              active={activeItem === 'apps'}
              collapsed={collapsed}
              onClick={() => handleItemClick('apps')}
            />
            <SidebarItem 
              icon={<AgentBuilderIcon size={20} />}
              label="Agent Builder"
              active={activeItem === 'agent-builder'}
              collapsed={collapsed}
              onClick={() => handleItemClick('agent-builder')}
            />
            <SidebarItem 
              icon={<AudioIcon size={20} />}
              label="Audio"
              active={activeItem === 'audio'}
              collapsed={collapsed}
              onClick={() => handleItemClick('audio')}
            />
            <SidebarItem 
              icon={<ImagesIcon size={20} />}
              label="Images"
              active={activeItem === 'images'}
              collapsed={collapsed}
              onClick={() => handleItemClick('images')}
            />
            <SidebarItem 
              icon={<VideosIcon size={20} />}
              label="Videos"
              active={activeItem === 'videos'}
              collapsed={collapsed}
              onClick={() => handleItemClick('videos')}
            />
            <SidebarItem 
              icon={<AssistantsIcon size={20} />}
              label="Assistants"
              active={activeItem === 'assistants'}
              collapsed={collapsed}
              onClick={() => handleItemClick('assistants')}
            />
          </SidebarSection>
          
          <SidebarDivider collapsed={collapsed} />
          
          {/* Manage Section */}
          <SidebarSection title="Manage" collapsed={collapsed}>
            <SidebarItem 
              icon={<UsageIcon size={20} />}
              label="Usage"
              active={activeItem === 'usage'}
              collapsed={collapsed}
              onClick={() => handleItemClick('usage')}
            />
            <SidebarItem 
              icon={<ApiKeysIcon size={20} />}
              label="API keys"
              active={activeItem === 'api-keys'}
              collapsed={collapsed}
              onClick={() => handleItemClick('api-keys')}
            />
            <SidebarItem 
              icon={<LogsIcon size={20} />}
              label="Logs"
              active={activeItem === 'logs'}
              collapsed={collapsed}
              onClick={() => handleItemClick('logs')}
            />
            <SidebarItem 
              icon={<StorageIcon size={20} />}
              label="Storage"
              active={activeItem === 'storage'}
              collapsed={collapsed}
              onClick={() => handleItemClick('storage')}
            />
            <SidebarItem 
              icon={<BatchesIcon size={20} />}
              label="Batches"
              active={activeItem === 'batches'}
              collapsed={collapsed}
              onClick={() => handleItemClick('batches')}
            />
          </SidebarSection>
          
          <SidebarDivider collapsed={collapsed} />
          
          {/* Optimize Section */}
          <SidebarSection title="Optimize" collapsed={collapsed}>
            <SidebarItem 
              icon={<EvaluationIcon size={20} />}
              label="Evaluation"
              active={activeItem === 'evaluation'}
              collapsed={collapsed}
              onClick={() => handleItemClick('evaluation')}
            />
            <SidebarItem 
              icon={<FineTuningIcon size={20} />}
              label="Fine-tuning"
              active={activeItem === 'fine-tuning'}
              collapsed={collapsed}
              onClick={() => handleItemClick('fine-tuning')}
            />
          </SidebarSection>
      </div>
      
      {/* Footer: constant padding - prevents jump on collapse */}
      <div 
        style={{ 
          padding: '6px 12px 6px 4px', // Constant - matches scroll container positioning
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Add Credits card - hidden when collapsed */}
        {!collapsed && showCreditsCard && (
          <AddCreditsCard 
            onClose={onCreditsClose}
            onBilling={onBilling}
          />
        )}
        
        {/* Collapse button - button._8xE3c: width 40px, height 32px */}
        {/* OpenAI hover uses opacity: 0 → 0.5, bg always #dfdfdf */}
        <div>
          <button 
            onClick={onToggle}
            style={{
              width: '40px',
              height: '32px',
              padding: '0px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#282828',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
            className={cn(
              'before:absolute before:inset-0 before:rounded-[6px] before:bg-[#dfdfdf]',
              'before:transition-[opacity,background-color,transform,box-shadow,color]',
              'before:duration-150 before:ease-[cubic-bezier(0.19,1,0.22,1)]',
              'before:opacity-0 hover:before:opacity-50'
            )}
          >
            <span className="relative z-10">
              <SidebarCollapseIcon size={20} />
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}

// Export sub-components for custom usage
export { SidebarItem, SidebarSection, SidebarDivider, AddCreditsCard };
