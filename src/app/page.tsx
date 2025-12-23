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
          projectName="Personal"
          projectType="Default project"
          activeNav="dashboard"
          onNavClick={(item) => console.log('Nav:', item)}
        />
      </div>
      
      {/* Main layout - начинается под header */}
      <div className="pt-[54px]">
        <div className="relative flex">
          {/* Sidebar - absolute position */}
          {/* EXPANDED: left 8px, width 210px */}
          {/* COLLAPSED: left 0px (!), width 64px - sidebar moves to viewport edge */}
          <div
            className="absolute"
            style={{
              top: 0,
              left: sidebarCollapsed ? '0px' : '8px',  // Collapsed: moves to edge!
              width: sidebarCollapsed ? '64px' : '210px',
              height: 'calc(100vh - 54px)',
            }}
          >
            <Sidebar 
              activeItem={activeItem}
              onItemClick={setActiveItem}
              showCreditsCard={showCredits}
              onCreditsClose={() => setShowCredits(false)}
              onBilling={() => console.log('Go to billing')}
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>
          
          {/* Content Card - белая карточка справа от sidebar */}
          {/* EXPANDED: sidebar left 8px + sidebar width 210px = 218px (NO extra gap!) */}
          {/* COLLAPSED: 64px (collapsed sidebar width) */}
          <main
            className="bg-white border border-[#ededed] overflow-hidden"
            style={{
              marginLeft: sidebarCollapsed ? '64px' : '218px',
              width: sidebarCollapsed ? 'calc(100vw - 64px - 8px)' : '834px',
              height: 'calc(100vh - 54px)',
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
