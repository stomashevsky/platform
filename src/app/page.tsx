'use client';

import { useState } from 'react';
import { Header } from '@/components/ui/Header';
import { Sidebar } from '@/components/ui/Sidebar';
import { Button } from '@/components/ui/Button';
import { Chip, ChipGroup } from '@/components/ui/Chip';
import { PlusIcon, ChatIcon } from '@/components/icons';

/**
 * Demo page replicating OpenAI Platform Chat interface EXACTLY
 * 
 * Layout структура (извлечено из platform.openai.com December 2024):
 * 
 * - Header: position fixed, top 0, left 8px, right 8px
 *   height 54px, padding 0px 12px
 *   display flex, justify-content space-between
 * 
 * - Sidebar: position absolute, left 0, top 54px (под header)
 *   width 210px, height calc(100vh - 54px)
 *   padding 14px 0px 0px
 *   display flex, flex-direction column
 * 
 * - Content Card: position static
 *   margin-left 218px (8px sidebar offset + 210px sidebar width, NO extra gap)
 *   width 834px, height calc(100vh - 54px)
 *   bg #ffffff, border 1px solid #ededed, border-radius 8px
 * 
 * - Page background: #f3f3f3
 * - Page margins: 8px left, 8px right
 */

export default function Home() {
  const [activeItem, setActiveItem] = useState('chat');
  const [showCredits, setShowCredits] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      {/* Header - fixed, точная позиция как в OpenAI */}
      <div
        className="fixed top-0 z-10"
        style={{
          left: '8px',
          right: '8px',
        }}
      >
        <Header 
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          isMobileMenuOpen={mobileMenuOpen}
        />
      </div>
      
      {/* Main layout - начинается под header */}
      <div className="h-[calc(100vh-54px)] mt-[54px] overflow-hidden">
        <div className="relative h-full">
          {/* Sidebar - absolute position on desktop, overlay on mobile */}
          {/* OpenAI mobile: sidebar visibility: hidden, shown as overlay when hamburger clicked */}
          
          {/* Mobile overlay backdrop */}
          {mobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          
          {/* Sidebar container */}
          <div
            className={`
              absolute transition-all duration-200
              md:block
              ${mobileMenuOpen ? 'fixed z-50 left-0' : 'hidden md:block'}
            `}
            style={{
              top: mobileMenuOpen ? '54px' : '0px', // On mobile, start from header bottom; desktop: 0px (sidebar has own padding)
              left: mobileMenuOpen ? '0px' : '8px', // Always 8px - like OpenAI
              width: sidebarCollapsed && !mobileMenuOpen ? '64px' : '210px',
              height: mobileMenuOpen ? 'calc(100vh - 54px)' : 'calc(100% - 16px)',
              ...(mobileMenuOpen && { 
                backgroundColor: '#f3f3f3',
                paddingBottom: '8px',
              }),
            }}
          >
            <Sidebar 
              activeItem={activeItem}
              onItemClick={(item) => {
                setActiveItem(item);
                setMobileMenuOpen(false); // Close menu on item click
              }}
              showCreditsCard={showCredits}
              onCreditsClose={() => setShowCredits(false)}
              onBilling={() => console.log('Go to billing')}
              collapsed={sidebarCollapsed && !mobileMenuOpen}
              onToggle={() => {
                if (mobileMenuOpen) {
                  setMobileMenuOpen(false);
                } else {
                  setSidebarCollapsed(!sidebarCollapsed);
                }
              }}
            />
          </div>
          
          {/* Content Card - белая карточка справа от sidebar */}
          {/* OpenAI exact: card.left = 218px (8px + 210px sidebar), rightGap = 8px, NO gap between sidebar and card */}
          {/* On mobile: full width with 8px margins */}
          
          {/* Mobile content - full width */}
          <main
            className="md:hidden absolute bg-white border border-[#ededed] overflow-hidden transition-all duration-200"
            style={{
              top: '8px',
              left: '8px',
              right: '8px',
              bottom: '8px',
              borderRadius: '8px',
            }}
          >
            {/* Page header внутри card */}
            <div className="px-4 py-4 border-b border-[#ededed]">
              <h1 
                className="font-semibold text-[#282828]"
                style={{
                  fontSize: '18px',
                  lineHeight: '28px',
                  letterSpacing: '-0.16px',
                }}
              >
                Chat prompts
              </h1>
            </div>
            
            {/* Content area - центрированный empty state */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
              {/* Chat icon */}
              <div className="w-14 h-14 rounded-xl border border-[#ededed] flex items-center justify-center mb-4">
                <ChatIcon size={28} className="text-[#8f8f8f]" />
              </div>
              
              {/* Title */}
              <h2 className="text-[20px] font-semibold text-[#0d0d0d] mb-4 text-center">
                Create a chat prompt
              </h2>
              
              {/* Actions row - stacked on mobile */}
              <div className="flex flex-col items-center gap-3 mb-4 w-full px-4">
                <Button 
                  variant="primary" 
                  size="md"
                  icon={<PlusIcon size={16} />}
                >
                  Create
                </Button>
                
                <div className="flex items-center h-10 px-4 pr-2 bg-white border border-[#ededed] rounded-full w-full max-w-[250px]">
                  <input 
                    type="text"
                    placeholder="Generate..."
                    className="flex-1 bg-transparent text-[14px] text-[#0d0d0d] placeholder:text-[#8f8f8f] outline-none"
                  />
                  <button className="ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-[#0d0d0d] text-white">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Suggestion chips - wrap on mobile */}
              <div className="flex flex-wrap justify-center gap-2 px-4">
                <Chip>Trip planner</Chip>
                <Chip>Image generator</Chip>
                <Chip>Code debugger</Chip>
                <Chip>Research assistant</Chip>
                <Chip>Decision helper</Chip>
              </div>
            </div>
          </main>
          
          {/* Desktop content - with sidebar offset */}
          {/* Note: right: 0 because parent container doesn't include scrollbar width (~8px) */}
          {/* This creates the visual 8px gap on the right side */}
          <main
            className="hidden md:block absolute bg-white border border-[#ededed] overflow-hidden transition-all duration-200"
            style={{
              top: '8px',
              left: sidebarCollapsed ? '64px' : '218px', // 8px left margin + 210px sidebar width
              right: '0px', // Parent already excludes scrollbar, so 0 = ~8px visual gap
              bottom: '8px',
              borderRadius: '8px',
            }}
          >
            {/* Page header внутри card - OpenAI exact: 20px, 600, #282828, letterSpacing -0.16px */}
            <div className="px-8 py-6 border-b border-[#ededed]">
              <h1 
                className="font-semibold text-[#282828]"
                style={{
                  fontSize: '20px',
                  lineHeight: '30px',
                  letterSpacing: '-0.16px',
                }}
              >
                Chat prompts
              </h1>
            </div>
            
            {/* Content area - центрированный empty state */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
              {/* Chat icon */}
              <div className="w-16 h-16 rounded-2xl border border-[#ededed] flex items-center justify-center mb-6">
                <ChatIcon size={32} className="text-[#8f8f8f]" />
              </div>
              
              {/* Title */}
              <h2 className="text-[24px] font-semibold text-[#0d0d0d] mb-6">
                Create a chat prompt
              </h2>
              
              {/* Actions row */}
              <div className="flex items-center gap-3 mb-6">
                {/* Create button */}
                <Button 
                  variant="primary" 
                  size="md"
                  icon={<PlusIcon size={16} />}
                >
                  Create
                </Button>
                
                {/* Generate input */}
                <div className="flex items-center h-10 px-4 pr-2 bg-white border border-[#ededed] rounded-full min-w-[200px]">
                  <input 
                    type="text"
                    placeholder="Generate..."
                    className="flex-1 bg-transparent text-[14px] text-[#0d0d0d] placeholder:text-[#8f8f8f] outline-none"
                  />
                  <button className="ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-[#0d0d0d] text-white">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Suggestion chips */}
              <ChipGroup className="justify-center">
                <Chip>Trip planner</Chip>
                <Chip>Image generator</Chip>
                <Chip>Code debugger</Chip>
              </ChipGroup>
              
              <ChipGroup className="justify-center mt-2">
                <Chip>Research assistant</Chip>
                <Chip>Decision helper</Chip>
              </ChipGroup>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
