import React from 'react';
import { UserButton } from '@clerk/clerk-react';
import { BookOpen, Compass, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { activeDocument } = useApp();

  return (
    <header className="h-16 border-b border-[#16171f] bg-[#07080b]/80 backdrop-blur-md px-6 flex items-center justify-between z-20 sticky top-0">
      
      {/* Brand Identity */}
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/25">
          <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
        </div>
        <span className="font-bold text-sm tracking-tight hidden sm:inline-block bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
          AI Research Assistant
        </span>
      </div>

      {/* Dynamic Context Target Tracker */}
      <div className="flex items-center max-w-xs sm:max-w-md md:max-w-lg truncate">
        {activeDocument ? (
          <div className="flex items-center space-x-2 bg-indigo-500/5 border border-indigo-500/15 text-indigo-300 px-3 py-1.5 rounded-full text-[10px] tracking-wide font-medium truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="truncate">Active: {activeDocument.filename}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 bg-[#111218] border border-[#1e202c] text-zinc-400 px-3 py-1.5 rounded-full text-[10px] tracking-wide font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            <span>Active: Entire Library Mode</span>
          </div>
        )}
      </div>

      {/* User Actions */}
      <div className="flex items-center space-x-4">
        <a 
          href="https://github.com/DBalakrishna4599/ai-research-assistant-rag" 
          target="_blank" 
          rel="noreferrer" 
          className="text-zinc-500 hover:text-white transition-all p-1.5 rounded-lg hover:bg-[#111218]/50"
          title="Repository"
        >
          <Compass className="w-4 h-4" />
        </a>
        
        {/* Profile Button Wrapper */}
        <div className="flex items-center justify-center border border-[#1e202c] p-1 rounded-full bg-[#0d0e14]">
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              variables: {
                colorBackground: '#111218',
                colorText: '#f3f4f6',
                colorTextSecondary: '#9ca3af',
                colorBorder: '#1e202c'
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}