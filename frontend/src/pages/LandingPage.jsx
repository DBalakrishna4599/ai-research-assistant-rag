import React, { useState } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { BookOpen, Shield, Cpu, Zap, X, ChevronRight, Lock, Eye } from 'lucide-react';

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(null); // 'signin' | 'signup' | null

  const features = [
    {
      icon: <Shield className="w-5 h-5 text-indigo-400" />,
      badge: "Compliance",
      title: "Data Sandboxing",
      description: "Documents are isolated within user-specific spaces. No crossover, no leakage, and zero multi-tenant directory bleeding."
    },
    {
      icon: <Cpu className="w-5 h-5 text-indigo-400" />,
      badge: "Privacy",
      title: "Local Cloud Inference",
      description: "Computed using Qwen 2.5 on your private Google Cloud VM instance. Your intellectual assets never leave your secure perimeter."
    },
    {
      icon: <Zap className="w-5 h-5 text-indigo-400" />,
      badge: "Precision",
      title: "Strict Retrieval-RAG",
      description: "Guided by BGE Small vector embeddings. Every answer is backed by original document chunks, preventing hallucinations."
    }
  ];

  return (
    <div className="min-h-screen bg-[#07080b] text-[#f3f4f6] flex flex-col justify-between relative overflow-hidden">
      
      {/* Premium Background Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-20%] w-[60vw] h-[60vw] bg-[radial-gradient(circle,rgba(79,70,229,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[60vw] h-[60vw] bg-[radial-gradient(circle,rgba(79,70,229,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      {/* Grid Pattern Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#14151b_1px,transparent_1px),linear-gradient(to_bottom,#14151b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* Navigation */}
      <header className="border-b border-[#16171f] bg-[#07080b]/60 backdrop-blur-md relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20 shadow-inner">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              AI Research Assistant
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowAuthModal('signin')}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-all px-3 py-2 rounded-lg hover:bg-[#111218]/50"
            >
              Log In
            </button>
            <button 
              onClick={() => setShowAuthModal('signup')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all shadow-md shadow-indigo-600/15 border border-indigo-500/20 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Body */}
      <main className="max-w-7xl mx-auto px-6 py-24 flex-grow flex flex-col items-center justify-center text-center relative z-10">
        
        {/* Glowing Badge */}
        <div className="inline-flex items-center space-x-2 bg-[#111218] border border-[#1e202c] px-3.5 py-1.5 rounded-full text-xs text-indigo-300 mb-8 shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="font-medium tracking-wide uppercase text-[10px]">Strictly Local Qwen 2.5 Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl leading-tight">
          Isolate Your Intelligence. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-indigo-400 to-indigo-500">
            Analyze PDFs Locally.
          </span>
        </h1>

        <p className="mt-6 text-base text-zinc-400 max-w-2xl leading-relaxed">
          Upload proprietary reports, transcripts, or academic literature. Interact securely with your library via an isolated RAG pipeline hosted directly on your GCP instance.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <button 
            onClick={() => setShowAuthModal('signup')}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-xl shadow-indigo-600/20 border border-indigo-500/20 active:scale-95"
          >
            <span>Create Secure Workspace</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowAuthModal('signin')}
            className="w-full sm:w-auto bg-[#111218] hover:bg-[#14151e] border border-[#1e202c] hover:border-zinc-700 font-semibold px-7 py-3.5 rounded-xl transition-all active:scale-95"
          >
            Access Console
          </button>
        </div>

        {/* Dynamic Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-28 w-full max-w-5xl">
          {features.map((feat, idx) => (
            <div 
              key={idx} 
              className="bg-[#111218]/40 border border-[#16171f] hover:border-indigo-500/20 p-8 rounded-2xl text-left backdrop-blur-sm transition-all group hover:bg-[#111218]/75"
            >
              <div className="bg-[#0d0e14] w-10 h-10 rounded-xl flex items-center justify-center border border-[#1e202c] mb-6 group-hover:border-indigo-500/10 transition-all">
                {feat.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400/80 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded">
                {feat.badge}
              </span>
              <h3 className="font-bold text-base mt-3 mb-2">{feat.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#16171f] bg-[#07080b]/40 py-8 relative z-10 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-6">
          <p>© {new Date().getFullYear()} AI Research Assistant. Self-Hosted Deployment.</p>
        </div>
      </footer>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 transition-all">
          <div className="relative max-w-md w-full bg-[#111218] border border-[#1e202c] rounded-2xl p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowAuthModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#16171f] transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Embedded Clerk Component */}
            <div className="flex justify-center pt-4">
              {showAuthModal === 'signin' ? (
                <SignIn 
                  routing="hash"
                  signUpUrl="/#signup"
                  appearance={{
                    variables: {
                      colorPrimary: '#4f46e5',
                      colorBackground: '#111218',
                      colorText: '#f3f4f6',
                      colorTextSecondary: '#9ca3af',
                      colorInputBackground: '#07080b',
                      colorInputText: '#f3f4f6',
                      colorBorder: '#1e202c'
                    },
                    elements: {
                      card: "shadow-none border-none bg-transparent p-0",
                      headerTitle: "text-[#f3f4f6]",
                      headerSubtitle: "text-[#9ca3af]",
                      socialButtonsBlockButton: "bg-[#07080b] border border-[#1e202c] text-[#f3f4f6] hover:bg-[#07080b]/80",
                      dividerText: "text-[#9ca3af]",
                      formFieldLabel: "text-[#f3f4f6]",
                      formFieldInput: "bg-[#07080b] border-[#1e202c] text-[#f3f4f6]",
                      footerActionText: "text-[#9ca3af]",
                      footerActionLink: "text-indigo-400 hover:text-indigo-300"
                    }
                  }}
                />
              ) : (
                <SignUp 
                  routing="hash"
                  signInUrl="/#signin"
                  appearance={{
                    variables: {
                      colorPrimary: '#4f46e5',
                      colorBackground: '#111218',
                      colorText: '#f3f4f6',
                      colorTextSecondary: '#9ca3af',
                      colorInputBackground: '#07080b',
                      colorInputText: '#f3f4f6',
                      colorBorder: '#1e202c'
                    },
                    elements: {
                      card: "shadow-none border-none bg-transparent p-0",
                      headerTitle: "text-[#f3f4f6]",
                      headerSubtitle: "text-[#9ca3af]",
                      socialButtonsBlockButton: "bg-[#07080b] border border-[#1e202c] text-[#f3f4f6] hover:bg-[#07080b]/80",
                      dividerText: "text-[#9ca3af]",
                      formFieldLabel: "text-[#f3f4f6]",
                      formFieldInput: "bg-[#07080b] border-[#1e202c] text-[#f3f4f6]",
                      footerActionText: "text-[#9ca3af]",
                      footerActionLink: "text-indigo-400 hover:text-indigo-300"
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}