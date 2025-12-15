
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Timer } from './components/Timer';
import { LetterDisplay } from './components/LetterDisplay';
import { generateQuestion, getSantaResponse, fallbacks } from './services/geminiService';
import { Question, GameState, MaskedChar, ChatMessage, WordData } from './types';
import { AUDIO_CONFIG } from './config/audio';
import { Gift, Snowflake, RefreshCw, Play, Lightbulb, SkipForward, Bell, Cloud, Star, Moon, Volume2, VolumeX, MessageCircle, X, Send, User, BookOpen, ChevronDown, ChevronUp, Calendar, Globe, ExternalLink, History, Palette, Sparkles, Home, Zap, Award, Coins, Loader2, List, Keyboard, ArrowUp, Delete, GraduationCap, TrendingUp, Gamepad2, ShoppingBag, HelpCircle, Flame, Wine } from 'lucide-react';

const TOTAL_TIME = 30;
const HINT_PENALTY = 5;
const INITIAL_SKIPS = 3;

// --- Vector Art Components ---

const HouseArt = () => (
  <div className="relative w-32 h-24 md:w-48 md:h-32 transform scale-75 md:scale-100 origin-bottom">
    {/* Chimney - Added */}
    <div className="absolute -top-10 right-4 w-8 h-10 bg-red-900 border-2 border-red-950 z-10 flex flex-col items-center">
        <div className="w-full h-2 bg-red-950/50 mb-1"></div>
        <div className="w-full h-2 bg-red-950/50 mb-1"></div>
        <div className="absolute -top-2 w-[120%] h-3 bg-white rounded-sm shadow-sm"></div>
    </div>

    <div className="absolute -top-6 -left-2 w-[110%] h-14 bg-white skew-x-12 rounded-lg z-20 shadow-md border-b-4 border-slate-200"></div>
    <div className="absolute top-2 left-0 w-full h-full bg-[#5D4037] z-10 flex items-end justify-between px-4 pb-0 rounded-sm shadow-lg">
        <div className="w-10 h-16 bg-[#3E2723] rounded-t-full border-2 border-[#281815] relative">
           <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full absolute top-8 right-1 shadow-[0_0_5px_rgba(234,179,8,0.8)]"></div>
        </div>
        <div className="w-12 h-10 bg-yellow-600 border-4 border-[#3E2723] mb-4 grid grid-cols-2 shadow-[0_0_15px_rgba(234,179,8,0.6)]">
            <div className="bg-yellow-300/80 animate-pulse"></div>
            <div className="bg-yellow-300/90"></div>
        </div>
    </div>
  </div>
);

const SnowmanArt = () => (
    <div className="relative flex flex-col items-center transform scale-75 md:scale-100 origin-bottom">
        {/* Head */}
        <div className="w-8 h-8 bg-white rounded-full relative z-30 shadow-sm">
            <div className="absolute top-2 left-2 w-1 h-1 bg-black rounded-full"></div>
            <div className="absolute top-2 right-2 w-1 h-1 bg-black rounded-full"></div>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[8px] border-b-orange-500 rotate-90"></div>
        </div>
        {/* Body Middle */}
        <div className="w-12 h-12 bg-white rounded-full -mt-2 relative z-20 shadow-md flex flex-col items-center justify-center gap-2 pt-1">
             <div className="w-1.5 h-1.5 bg-black rounded-full opacity-80"></div>
             <div className="w-1.5 h-1.5 bg-black rounded-full opacity-80"></div>
             {/* Stick Arms */}
             <div className="absolute top-4 -left-6 w-8 h-1 bg-[#5D4037] rotate-[20deg]"></div>
             <div className="absolute top-4 -right-6 w-8 h-1 bg-[#5D4037] -rotate-[20deg]"></div>
        </div>
        {/* Body Bottom */}
        <div className="w-16 h-16 bg-white rounded-full -mt-3 relative z-10 shadow-lg"></div>
        {/* Scarf */}
        <div className="absolute top-[22px] w-14 h-3 bg-red-600 rounded-full z-40 rotate-[-5deg]"></div>
        <div className="absolute top-[25px] left-8 w-3 h-8 bg-red-600 rounded-full z-30 rotate-[10deg]"></div>
    </div>
);

const ChurchArt = () => (
    <div className="relative w-24 h-32 md:w-32 md:h-40 flex flex-col items-center transform scale-75 md:scale-100 origin-bottom">
        <div className="w-0 h-0 border-l-[35px] border-l-transparent border-r-[35px] border-r-transparent border-b-[70px] border-b-[#475569] relative z-20 drop-shadow-lg">
             <div className="absolute -top-2 -left-0.5 w-1 h-3 bg-yellow-400"></div>
        </div>
        <div className="w-28 h-24 bg-[#64748b] relative z-10 flex justify-center items-end pb-0 shadow-lg">
             <div className="absolute -top-3 w-32 h-6 bg-white rounded-full border-b-2 border-slate-300"></div>
             <div className="w-10 h-14 bg-[#331c11] rounded-t-full relative top-0 border border-slate-700"></div>
             <div className="absolute top-6 left-3 w-5 h-10 bg-yellow-400 rounded-t-full shadow-[0_0_10px_rgba(250,204,21,0.5)] border-2 border-slate-700"></div>
             <div className="absolute top-6 right-3 w-5 h-10 bg-yellow-400 rounded-t-full shadow-[0_0_10px_rgba(250,204,21,0.5)] border-2 border-slate-700"></div>
        </div>
    </div>
);

const PineTree = ({ scale = 1, withLights = false }: { scale?: number, withLights?: boolean }) => (
    <div className="relative flex flex-col items-center" style={{ transform: `scale(${scale})` }}>
        {withLights && <Star className="absolute -top-6 text-yellow-300 w-8 h-8 animate-spin-slow drop-shadow-[0_0_10px_rgba(253,224,71,0.8)] z-30" fill="currentColor" />}
        <div className="w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-b-[40px] border-b-[#0f3923] relative z-20 -mb-4 drop-shadow-sm">
             <div className="absolute top-6 -left-3 w-1 h-1 bg-white rounded-full opacity-60"></div>
        </div>
        <div className="w-0 h-0 border-l-[35px] border-l-transparent border-r-[35px] border-r-transparent border-b-[50px] border-b-[#165B33] relative z-10 -mb-4 drop-shadow-sm">
             {withLights && (
                <>
                  <div className="absolute top-8 left-2 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <div className="absolute top-6 -left-4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-75"></div>
                  <div className="absolute top-4 -left-2 w-full h-10 border-b-2 border-yellow-400/30 rounded-full rotate-12 pointer-events-none"></div>
                </>
             )}
        </div>
        <div className="w-0 h-0 border-l-[45px] border-l-transparent border-r-[45px] border-r-transparent border-b-[60px] border-b-[#0f3923] relative z-0 drop-shadow-sm">
             {withLights && (
                <>
                  <div className="absolute top-8 -left-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                  <div className="absolute top-10 right-4 w-2 h-2 bg-red-400 rounded-full animate-pulse delay-300"></div>
                   <div className="absolute top-4 left-6 w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-500"></div>
                </>
             )}
        </div>
        <div className="w-6 h-8 bg-[#3E2723] -mt-1"></div>
        {withLights && (
            <div className="absolute bottom-0 flex gap-1 z-20">
                <Gift className="w-6 h-6 text-red-600 fill-current" />
                <Gift className="w-5 h-5 text-yellow-500 fill-current" />
            </div>
        )}
    </div>
);

const SantaSleigh = () => (
    <div className="relative flex items-end">
        <div className="relative z-20 mr-2">
             <div className="absolute -top-5 left-2 w-6 h-8 bg-red-600 rounded-t-full flex justify-center items-start">
                  <div className="w-full h-2 bg-white mt-2"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></div> 
                  <div className="absolute top-2 w-4 h-3 bg-[#ffe0bd] rounded-full"></div> 
                  <div className="absolute top-4 w-6 h-4 bg-white rounded-full shadow-sm"></div> 
             </div>
             <div className="w-16 h-8 bg-red-800 rounded-b-2xl rounded-tr-xl border-t-2 border-yellow-500 relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-black/10"></div>
             </div>
             <div className="absolute -bottom-2 -left-1 w-20 h-1 bg-slate-300 rounded-full rotate-[-5deg]">
                 <div className="absolute left-0 -top-2 w-1 h-3 bg-slate-300"></div>
                 <div className="absolute right-4 -top-2 w-1 h-3 bg-slate-300"></div>
             </div>
             <div className="absolute -top-3 right-1 w-4 h-4 bg-green-600 rounded-sm rotate-12 z-[-1]"></div>
        </div>
        <div className="w-12 h-[1px] bg-white/60 absolute bottom-5 left-[3.5rem] rotate-[-10deg] z-0"></div>
        <div className="flex gap-1 relative z-10 ml-4">
           {[1, 2].map((i) => (
             <div key={i} className="relative w-8 h-6 bg-[#5D4037] rounded-lg">
                <div className="absolute -top-2 right-0 w-4 h-4 bg-[#5D4037] rounded-full">
                   <div className="absolute -top-3 right-0 w-1 h-4 bg-[#3E2723] rotate-45"></div>
                   <div className="absolute -top-3 right-2 w-1 h-4 bg-[#3E2723] -rotate-12"></div>
                   {i === 2 && <div className="absolute top-1 right-[-2px] w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_red]"></div>}
                </div>
                <div className="absolute bottom-[-4px] left-1 w-1 h-3 bg-[#3E2723] animate-pulse"></div>
                <div className="absolute bottom-[-4px] right-2 w-1 h-3 bg-[#3E2723] animate-pulse delay-75"></div>
             </div>
           ))}
        </div>
    </div>
);

const ScenicBackground = ({ isPlayingCutscene }: { isPlayingCutscene: boolean }) => (
  <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-[#0B1026]">
    <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0B1026] to-[#1e293b]"></div>
    {[...Array(20)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white animate-twinkle" style={{
            top: `${Math.random() * 50}%`,
            left: `${Math.random() * 100}%`,
            width: Math.random() > 0.5 ? '2px' : '3px',
            height: Math.random() > 0.5 ? '2px' : '3px',
            animationDelay: `${Math.random() * 2}s`
        }}></div>
    ))}
    <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-48 h-48 md:w-64 md:h-64 bg-[#FDF6E3] rounded-full shadow-[0_0_120px_40px_rgba(253,246,227,0.5)] z-0">
        <div className="absolute inset-0 rounded-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
    </div>
    
    {/* High Flying Santa (Ambient) - Hidden when cutscene plays */}
    <div className={`absolute top-[20%] left-0 w-full z-10 animate-fly-orbit opacity-90 pointer-events-none transition-opacity duration-500 ${isPlayingCutscene ? 'opacity-0' : 'opacity-90'}`}>
        <div className="flex items-center justify-center transform scale-75 md:scale-100">
             <SantaSleigh />
        </div>
    </div>

    <div className="absolute bottom-0 left-0 w-full h-[45%] z-10">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full text-[#1e293b] fill-current" preserveAspectRatio="none">
            <path d="M0,160 C320,300, 420,0, 740,160 C1060,320, 1340,60, 1440,120 V320 H0 Z"></path>
        </svg>
    </div>
    <div className="absolute bottom-0 left-0 w-full h-[35%] z-20">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full text-[#94a3b8] fill-current" preserveAspectRatio="none">
            <path d="M0,192 C220,100, 500,250, 800,150 C1100,50, 1300,200, 1440,100 V320 H0 Z"></path>
        </svg>
        <div className="absolute bottom-[25%] left-[10%] md:left-[15%]"><HouseArt /></div>
        <div className="absolute bottom-[25%] left-[3%] md:left-[8%] transform scale-75 z-20"><SnowmanArt /></div>
        <div className="absolute bottom-[35%] right-[5%] md:right-[15%]"><ChurchArt /></div>
        <div className="absolute bottom-[28%] left-[5%] transform scale-75"><PineTree scale={0.8} /></div>
        <div className="absolute bottom-[32%] left-[28%] transform scale-50"><PineTree scale={0.6} /></div>
        <div className="absolute bottom-[40%] right-[25%] transform scale-75"><PineTree scale={0.8} /></div>
    </div>
    <div className="absolute bottom-0 left-0 w-full h-[20%] z-30">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full text-[#f1f5f9] fill-current drop-shadow-lg" preserveAspectRatio="none">
             <path d="M0,128 C300,250, 600,0, 900,150 C1200,300, 1380,100, 1440,160 V320 H0 Z"></path>
        </svg>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 transform scale-125 md:scale-150 z-40">
             <PineTree scale={1.5} withLights={true} />
        </div>
        <div className="absolute bottom-0 left-0 transform scale-100"><PineTree scale={1.2} /></div>
        <div className="absolute bottom-4 right-4 transform scale-110"><PineTree scale={1.3} /></div>
    </div>
  </div>
);

const CutsceneOverlay = ({ onComplete }: { onComplete: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 4000); 
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-black/60 animate-fade-out delay-[3.5s]"></div>
            
            {/* Santa Animation Container - Positioned to align with the house in background */}
            <div className="absolute bottom-[25%] left-[10%] md:left-[15%] w-32 h-24 z-50">
                {/* 1. Sleigh flies in and lands */}
                <div className="absolute top-0 left-0 w-full h-full animate-sleigh-land origin-center">
                    <SantaSleigh />
                </div>
                
                {/* 2. Santa enters chimney (delayed) - Simple visual of Santa appearing and dropping */}
                <div className="absolute -top-12 right-6 z-40 animate-santa-chimney-in opacity-0" style={{ animationDelay: '2.8s' }}>
                    <div className="w-6 h-8 bg-red-600 rounded-t-full flex justify-center">
                        <div className="w-4 h-4 bg-white rounded-full mt-1"></div>
                        <div className="absolute top-2 w-6 h-2 bg-black"></div>
                        <div className="absolute -right-2 top-2 w-2 h-4 bg-red-600 rotate-45"></div>
                    </div>
                </div>
            </div>

            <div className="absolute top-20 w-full text-center text-white font-display text-2xl animate-pulse shadow-black drop-shadow-md">
                ...Santa is landing...
            </div>
        </div>
    );
};

const VictorySanta = () => (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 animate-pop-up">
        <div className="relative w-64 h-64 md:w-80 md:h-80">
            <div className="absolute -top-16 -right-10 bg-white p-4 rounded-2xl rounded-bl-none shadow-xl border-4 border-xmas-red transform rotate-6 animate-bounce">
                <span className="text-3xl font-display font-bold text-xmas-red">โฮ่ โฮ่ โฮ่!</span>
            </div>
            <div className="w-full h-full flex flex-col items-center justify-end drop-shadow-2xl">
                 <div className="w-40 h-48 bg-red-600 rounded-t-full relative shadow-inner">
                      <div className="w-32 h-32 bg-pink-200 rounded-full absolute top-4 left-4 z-10">
                          <div className="w-full h-1/2 bg-white absolute bottom-0 rounded-b-full border-t border-slate-100 shadow-sm"></div>
                          <div className="w-4 h-4 bg-red-300 rounded-full absolute top-14 left-1/2 -translate-x-1/2 z-20 shadow-sm"></div>
                          <div className="flex gap-8 justify-center mt-10">
                              <div className="w-3 h-3 bg-black rounded-full"></div>
                              <div className="w-3 h-3 bg-black rounded-full"></div>
                          </div>
                      </div>
                      <div className="absolute -top-10 left-0 w-40 h-20 bg-red-600 rounded-t-full z-20">
                          <div className="absolute bottom-0 w-full h-6 bg-white"></div>
                          <div className="absolute -right-6 top-10 w-12 h-12 bg-white rounded-full shadow-sm"></div>
                      </div>
                 </div>
            </div>
        </div>
    </div>
);

const GameCompletedView = ({ onBackToMenu }: { onBackToMenu: () => void }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="relative z-50 flex flex-col items-center animate-pop-up">
                 <div className="relative w-72 h-72 md:w-96 md:h-96">
                    <div className="absolute -top-20 right-0 left-0 mx-auto w-64 bg-white p-6 rounded-3xl shadow-2xl border-4 border-xmas-red transform -rotate-2 animate-float text-center z-50">
                        <h2 className="text-3xl font-display font-bold text-xmas-red mb-2">โฮ่ โฮ่ โฮ่</h2>
                        <p className="text-slate-800 font-bold text-xl">เกมจบแล้วจ้า~</p>
                        <p className="text-slate-500 text-sm mt-1">เก่งมากเด็กดี!</p>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-xmas-red"></div>
                    </div>
                    <div className="w-full h-full flex flex-col items-center justify-end drop-shadow-2xl mt-10">
                         <div className="w-56 h-64 bg-red-600 rounded-t-full relative shadow-inner">
                              <div className="w-44 h-44 bg-pink-200 rounded-full absolute top-6 left-6 z-10">
                                  <div className="w-full h-1/2 bg-white absolute bottom-0 rounded-b-full border-t border-slate-100 shadow-sm"></div>
                                  <div className="w-6 h-6 bg-red-300 rounded-full absolute top-20 left-1/2 -translate-x-1/2 z-20 shadow-sm"></div>
                                  <div className="flex gap-10 justify-center mt-14">
                                      <div className="w-4 h-4 bg-black rounded-full"></div>
                                      <div className="w-4 h-4 bg-black rounded-full"></div>
                                  </div>
                              </div>
                              <div className="absolute -top-14 left-0 w-56 h-28 bg-red-600 rounded-t-full z-20">
                                  <div className="absolute bottom-0 w-full h-8 bg-white"></div>
                                  <div className="absolute -right-8 top-14 w-16 h-16 bg-white rounded-full shadow-sm"></div>
                              </div>
                         </div>
                    </div>
                 </div>
                 <button onClick={onBackToMenu} className="mt-8 px-8 py-3 bg-white text-xmas-red rounded-full font-bold shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:bg-slate-100 hover:scale-105 transition-all flex items-center gap-2 border-2 border-red-200">
                    <Home size={20} /> กลับหน้าเริ่มต้น
                 </button>
            </div>
        </div>
    );
};

const WordListModal = ({ onClose }: { onClose: () => void }) => {
    // Group words by category
    const groupedWords = fallbacks.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, WordData[]>);

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
            <div className="relative w-full max-w-3xl bg-[#0f172a] border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-pop-up">
                <div className="relative p-6 bg-gradient-to-r from-green-900 to-green-800 border-b border-white/10 shrink-0">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm shadow-lg"><List size={32} className="text-xmas-gold" /></div>
                            <div><h2 className="text-2xl md:text-3xl font-display font-bold text-white drop-shadow-md">คำศัพท์ทั้งหมด</h2><p className="text-xs md:text-sm text-green-200">รายการคำศัพท์ในเกม (เฉพาะรายการหลัก)</p></div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"><X size={28} /></button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide text-slate-200">
                    <div className="space-y-8">
                        {Object.entries(groupedWords).map(([category, words]) => (
                            <div key={category}>
                                <h3 className="flex items-center gap-2 text-xl font-bold text-xmas-gold border-b border-white/10 pb-2 mb-4 sticky top-0 bg-[#0f172a] z-10 py-2 shadow-sm">
                                    <Sparkles size={18} className="text-yellow-400" /> หมวด: {category}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {words.map((item, index) => (
                                        <div key={index} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-white text-lg">{item.word}</h4>
                                            </div>
                                            <p className="text-sm text-slate-400 font-light italic">"{item.hint}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChevronForwardWrapper = () => <ChevronUp className="rotate-90 text-white/50" />;

const ThaiKeyboard = ({ onKeyPress, onDelete, isShifted, toggleShift, isVisible, onToggleVisibility }: any) => {
    const rowsNormal = [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['ๆ', 'ไ', 'ำ', 'พ', 'ะ', 'ั', 'ี', 'ร', 'น', 'ย', 'บ', 'ล', 'ฃ'],
        ['ฟ', 'ห', 'ก', 'ด', 'เ', '้', '่', 'า', 'ส', 'ว', 'ง'],
        ['ผ', 'ป', 'แ', 'อ', 'ิ', 'ื', 'ท', 'ม', 'ใ', 'ฝ']
    ];
    const rowsShifted = [
        ['+', '๑', '๒', '๓', '๔', 'ู', '฿', '๕', '๖', '๗', '๘', '๙'],
        ['๐', '"', 'ฎ', 'ฑ', 'ธ', 'ํ', '๊', 'ณ', 'ฯ', 'ญ', 'ฐ', ',', 'ฅ'],
        ['ฤ', 'ฆ', 'ฏ', 'โ', 'ฌ', '็', '๋', 'ษ', 'ศ', 'ซ', '.'],
        ['(', ')', 'ฉ', 'ฮ', 'ฺ', '์', '?', 'ฒ', 'ฬ', 'ฦ']
    ];

    const currentRows = isShifted ? rowsShifted : rowsNormal;

    if (!isVisible) {
        return (
            <button 
                onClick={onToggleVisibility}
                className="fixed bottom-4 right-4 z-[100] w-12 h-12 bg-white text-slate-800 rounded-full shadow-lg flex items-center justify-center border-2 border-slate-200 opacity-80 hover:opacity-100 transition-opacity"
            >
                <Keyboard size={24} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 w-full bg-slate-200 p-1 pb-6 z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.1)] touch-none select-none">
            <div className="flex justify-center mb-1">
                <button onClick={onToggleVisibility} className="w-12 h-1.5 bg-slate-400 rounded-full opacity-50 hover:opacity-100 mt-2 mb-1"></button>
            </div>
            {currentRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-1 mb-1">
                    {row.map((char) => (
                        <button
                            key={char}
                            onClick={() => onKeyPress(char)}
                            className="flex-1 bg-white rounded-md h-10 md:h-12 text-lg md:text-xl font-bold shadow-sm active:bg-slate-300 active:scale-95 transition-transform text-slate-800 flex items-center justify-center"
                            style={{ maxWidth: '9%' }}
                        >
                            {char}
                        </button>
                    ))}
                </div>
            ))}
            <div className="flex justify-center gap-1 px-1">
                 <button onClick={toggleShift} className={`flex-[1.5] rounded-md h-10 md:h-12 font-bold shadow-sm flex items-center justify-center ${isShifted ? 'bg-blue-500 text-white' : 'bg-slate-300 text-slate-700'}`}>
                    <ArrowUp size={20} />
                 </button>
                 <button onClick={() => onKeyPress(' ')} className="flex-[4] bg-white rounded-md h-10 md:h-12 font-bold shadow-sm active:bg-slate-300 text-slate-500 text-sm">SPACE</button>
                 <button onClick={onDelete} className="flex-[1.5] bg-slate-300 text-slate-700 rounded-md h-10 md:h-12 font-bold shadow-sm flex items-center justify-center active:bg-slate-400">
                    <Delete size={20} />
                 </button>
            </div>
        </div>
    );
};

const SantaChat = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'โฮ่ โฮ่ โฮ่! สวัสดีจ้ะเด็กดี มีอะไรอยากคุยกับลุงซานต้าไหม?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await getSantaResponse(process.env.API_KEY, messages, userMsg.text);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[80vh] animate-pop-up">
        <div className="bg-red-600 p-4 flex items-center justify-between shadow-md z-10">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-green-500 overflow-hidden relative">
                   <div className="absolute top-2 w-6 h-4 bg-[#ffe0bd] rounded-full"></div>
                   <div className="absolute bottom-0 w-8 h-4 bg-white"></div>
                   <div className="absolute top-0 w-full h-3 bg-red-600"></div>
              </div>
              <div>
                 <h3 className="font-bold text-white text-lg">Santa Claus</h3>
                 <p className="text-red-100 text-xs flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online</p>
              </div>
           </div>
           <button onClick={onClose} className="text-white/80 hover:text-white transition-colors"><X size={24} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-slate-100 space-y-4">
           {messages.map((msg, idx) => (
             <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-red-500 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none shadow-sm border border-slate-200'}`}>
                   <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                </div>
             </div>
           ))}
           {isLoading && (
              <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 flex gap-1 items-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                  </div>
              </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-200">
           <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="พิมพ์ข้อความหาซานต้า..." 
                className="flex-1 px-4 py-3 bg-slate-100 rounded-full border border-slate-200 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200 transition-all text-sm md:text-base text-slate-800"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95 flex items-center justify-center relative"
              >
                 <Send size={20} className={isLoading ? 'opacity-0' : 'opacity-100'} />
                 {isLoading && <Loader2 size={20} className="absolute animate-spin" />}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const ChristmasInfoModal = ({ onClose }: { onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState<'history' | 'facts'>('history');

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-[#0f172a] border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-pop-up">
                {/* Header */}
                <div className="relative p-6 bg-gradient-to-r from-red-900 to-red-800 border-b border-white/10 shrink-0">
                    <div className="absolute top-0 right-0 p-4 opacity-20"><Snowflake size={120} /></div>
                    <div className="flex items-center justify-between relative z-10 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm shadow-lg"><BookOpen size={32} className="text-xmas-gold" /></div>
                            <div><h2 className="text-2xl md:text-3xl font-display font-bold text-white drop-shadow-md">เกร็ดความรู้คริสต์มาส</h2><p className="text-xs md:text-sm text-red-200">เรื่องราวน่ารู้ เทศกาลแห่งความสุข</p></div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"><X size={28} /></button>
                    </div>
                    {/* Tabs */}
                    <div className="flex gap-2 relative z-10 p-1 bg-black/20 rounded-xl">
                        <button onClick={() => setActiveTab('history')} className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${activeTab === 'history' ? 'bg-white text-red-900 shadow-md' : 'text-red-200 hover:text-white hover:bg-white/10'}`}>ประวัติ & ที่มา</button>
                        <button onClick={() => setActiveTab('facts')} className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${activeTab === 'facts' ? 'bg-white text-red-900 shadow-md' : 'text-red-200 hover:text-white hover:bg-white/10'}`}>5 เรื่องจริง</button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide text-slate-200 leading-relaxed">
                    {activeTab === 'history' && (
                        <div className="space-y-8 animate-fade-in">
                            <section>
                                <p className="text-sm md:text-base text-slate-300 mb-4 indent-8">
                                    เทศกาลคริสต์มาสซึ่งจัดขึ้นในวันที่ 25 ธันวาคมของทุกปี เป็นการเฉลิมฉลองการประสูติของพระเยซูคริสต์ และถือเป็นวันหยุดทางศาสนาและวัฒนธรรมที่สำคัญสำหรับผู้คนหลายพันล้านคนทั่วโลก ข้อมูลจากแหล่งที่มาแสดงให้เห็นว่าประเพณีคริสต์มาสในปัจจุบันนั้น <strong>มีรากฐานที่ซับซ้อนและมีการผสมผสานระหว่างธรรมเนียมของศาสนาคริสต์และพิธีกรรมเพเกินโบราณ</strong>
                                </p>
                            </section>

                            <section>
                                <h3 className="flex items-center gap-2 text-lg font-bold text-xmas-gold border-b border-white/10 pb-2 mb-3">
                                    <Flame size={20} className="text-orange-400" /> 1. ต้นกำเนิดจากพิธีกรรมเพเกินโบราณ
                                </h3>
                                <div className="space-y-4 text-sm md:text-base text-slate-300">
                                    <p>ประเพณีและธรรมเนียมของคริสต์มาสมีความเกี่ยวข้องอย่างใกล้ชิดกับเทศกาลเพเกินโบราณสองเทศกาลที่จัดขึ้นในช่วงฤดูหนาว:</p>
                                    <ul className="list-disc list-inside space-y-2 ml-2">
                                        <li><strong>Yule (ตรุษฝรั่ง):</strong> วันหยุดสแกนดิเนเวียโบราณ เฉลิมฉลองในช่วงเหมายัน (Winter Solstice) ถือเป็น "เทศกาลแห่งแสงสว่าง" มีธรรมเนียมการจุดเทียน การเลี้ยงฉลอง (หัวหมู) และการเผาขอนไม้ Yule เพื่อสื่อถึงความอบอุ่นและชีวิต</li>
                                        <li><strong>Saturnalia:</strong> เทศกาลโรมันโบราณอุทิศแด่เทพเจ้า Saturn (17-25 ธ.ค.) โดดเด่นด้วยงานรื่นเริง การเลี้ยงฉลอง การสลับบทบาททางสังคม และการให้ของขวัญแก่คนยากจน</li>
                                    </ul>
                                    <p className="text-xs text-slate-400 mt-2">*วันที่ 25 ธ.ค. ยังตรงกับวันเกิดของเทพเจ้าแห่งดวงอาทิตย์ผู้ไม่ถูกพิชิต (Sol Invictus) ในกรุงโรมอีกด้วย</p>
                                </div>
                            </section>

                            <section>
                                <h3 className="flex items-center gap-2 text-lg font-bold text-xmas-gold border-b border-white/10 pb-2 mb-3">
                                    <Calendar size={20} className="text-blue-400" /> 2. การกำหนดวันที่ 25 ธันวาคม
                                </h3>
                                <p className="text-sm md:text-base text-slate-300 mb-3">
                                    พระคัมภีร์ไบเบิลไม่ได้ระบุวันที่ชัดเจน การกำหนดวันที่ 25 ธันวาคม มีสองทฤษฎีหลัก:
                                </p>
                                <div className="bg-white/5 p-4 rounded-xl border-l-4 border-yellow-500 text-sm space-y-3">
                                    <div>
                                        <strong className="text-yellow-200 block mb-1">1. ทฤษฎีการปรับเข้ากับเทศกาลเพเกิน (Pagan Assimilation):</strong>
                                        <p>คริสตจักรเลือกวันนี้เพื่อให้ตรงกับเทศกาลฤดูหนาวเดิม (Saturnalia, Sol Invictus) เพื่อให้การเปลี่ยนศาสนาง่ายขึ้น และแทนที่การเฉลิมฉลองเดิมด้วยความเชื่อใหม่</p>
                                    </div>
                                    <div>
                                        <strong className="text-yellow-200 block mb-1">2. ทฤษฎีการคำนวณทางเทววิทยา (Theological Calculation):</strong>
                                        <p>คำนวณจากความเชื่อที่ว่าพระเยซูทรงปฏิสนธิและสิ้นพระชนม์ในวันเดียวกัน (25 มีนาคม) เมื่อนับไป 9 เดือน วันประสูติจึงตกวันที่ 25 ธันวาคมพอดี</p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="flex items-center gap-2 text-lg font-bold text-xmas-gold border-b border-white/10 pb-2 mb-3">
                                    <Globe size={20} className="text-green-400" /> 3. ประเพณีและบริบทสมัยใหม่
                                </h3>
                                <ul className="space-y-3 text-sm text-slate-300">
                                    <li className="flex gap-2">
                                        <User size={16} className="text-red-400 shrink-0 mt-1" />
                                        <span><strong>ซานตาคลอส:</strong> มาจากนักบุญนิโคลัสผู้ใจดี ภาพลักษณ์ชุดแดงเคราขาวในปัจจุบันถูกสร้างและได้รับความนิยมในสหรัฐฯ ช่วงศตวรรษที่ 19-20</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <Home size={16} className="text-green-400 shrink-0 mt-1" />
                                        <span><strong>ต้นคริสต์มาส:</strong> เริ่มในเยอรมนี (ศ.16) แพร่หลายโดยราชวงศ์อังกฤษ (ยุควิกตอเรีย) สื่อถึงตรีเอกานุภาพและชีวิตใหม่</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <TrendingUp size={16} className="text-yellow-400 shrink-0 mt-1" />
                                        <span><strong>เศรษฐกิจ & สังคม:</strong> เป็นช่วงทำกำไรสูงสุดของธุรกิจค้าปลีก แต่ปัจจุบันผู้คนเริ่มกังวลเรื่องค่าครองชีพ และรูปแบบการฉลองเปลี่ยนไปเน้นความสวยงามบนโซเชียลมากขึ้น</span>
                                    </li>
                                </ul>
                            </section>

                            <div className="bg-blue-900/30 p-4 rounded-xl border border-blue-500/30 mt-6">
                                <h4 className="flex items-center gap-2 font-bold text-blue-200 mb-2 text-sm">
                                    <HelpCircle size={16} /> เกร็ดน่ารู้: ปฏิทินจูเลียน
                                </h4>
                                <p className="text-xs text-blue-100 leading-relaxed">
                                    คริสตจักรออร์ทอดอกซ์บางแห่ง (เช่น ในรัสเซีย) ยังใช้ <strong>ปฏิทินจูเลียน</strong> ซึ่งช้ากว่าปฏิทินสากลปัจจุบัน (เกรโกเรียน) อยู่ 13 วัน ทำให้วันคริสต์มาสของพวกเขา (25 ธ.ค. ตามปฏิทินเดิม) ตรงกับวันที่ <strong>7 มกราคม</strong> ในปฏิทินสากล
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'facts' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                <h4 className="font-bold text-lg text-green-300 mb-2 flex items-center gap-2">
                                    <Zap size={20} /> 1. วันที่ 25 ธันวาคม: การคำนวณหรือการทับซ้อน?
                                </h4>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    วันที่ 25 ธ.ค. อาจไม่ได้มาจากการลอกเลียนแบบเพเกินเพียงอย่างเดียว แต่มีรากฐานจากการคำนวณของนักเทววิทยายุคแรกที่เชื่อว่าวันสิ้นพระชนม์ (25 มี.ค.) เป็นวันเดียวกับวันที่ทรงปฏิสนธิ เมื่อบวกไป 9 เดือนจึงเป็นวันประสูติ อย่างไรก็ตาม การทับซ้อนกับเทศกาล Saturnalia และวันเกิดเทพสุริยัน ก็ช่วยให้การเปลี่ยนศาสนาง่ายขึ้นมาก
                                </p>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                <h4 className="font-bold text-lg text-yellow-300 mb-2 flex items-center gap-2">
                                    <Wine size={20} /> 2. ธรรมเนียมยอดฮิตเคย "นอกรีต"
                                </h4>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    หลายธรรมเนียมที่เรามองว่าศักดิ์สิทธิ์ เคยถูกคริสตจักรต่อต้าน! <strong>มิสเซิลโท</strong> เคยเป็นพืชศักดิ์สิทธิ์ของพวกดรูอิด และ <strong>"เทศกาลคนโง่"</strong> ที่ล้อเลียนพิธีกรรมศาสนา ซึ่งสืบทอดมาจาก Saturnalia ต้องใช้เวลาหลายศตวรรษกว่าจะปราบปรามได้
                                </p>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                <h4 className="font-bold text-lg text-red-300 mb-2 flex items-center gap-2">
                                    <Award size={20} /> 3. ต้นคริสต์มาส ดังได้เพราะ "อินฟลูเอนเซอร์"
                                </h4>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    ต้นคริสต์มาสเป็น "ของนำเข้า" จากเยอรมนี แต่โด่งดังไปทั่วโลกเพราะ <strong>พระราชินีวิกตอเรีย</strong> และเจ้าชายอัลเบิร์ตแห่งอังกฤษ เมื่อภาพราชวงศ์ฉลองรอบต้นคริสต์มาสถูกเผยแพร่ในปี 1848 ก็กลายเป็นกระแสไวรัลทันที
                                </p>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                <h4 className="font-bold text-lg text-blue-300 mb-2 flex items-center gap-2">
                                    <User size={20} /> 4. ซานตาคลอส "รีแบรนด์" นับครั้งไม่ถ้วน
                                </h4>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    นักบุญนิโคลัสตัวจริงผอมสูง! ภาพจำ "ลุงอ้วนชุดแดงใจดี" ที่เราเห็นปัจจุบัน ถูกสร้างและตอกย้ำโดยนักวาดการ์ตูน Thomas Nast และโฆษณาของ <strong>Coca-Cola</strong> ในช่วงทศวรรษ 1920-1930 จนกลายเป็นสากล
                                </p>
                            </div>

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                <h4 className="font-bold text-lg text-purple-300 mb-2 flex items-center gap-2">
                                    <ShoppingBag size={20} /> 5. จากศาสนา สู่ปรากฏการณ์เศรษฐกิจ
                                </h4>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    ปัจจุบันคริสต์มาสวิวัฒนาการไปไกลกว่ารากฐานศาสนา กลายเป็นเทศกาลระดับโลกที่สะท้อนภาพสังคมและเศรษฐกิจ บางมุมมองเห็นว่าเป็น "ทุนนิยม" ที่เน้นการถ่ายรูปโซเชียลมากกว่าความอบอุ่นดั้งเดิม แต่ก็ปฏิเสธไม่ได้ว่าเป็นช่วงเวลาสำคัญที่สุดของธุรกิจทั่วโลก
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    status: 'menu',
    score: 0,
    currentLevel: 1,
    timeLeft: TOTAL_TIME,
    skipsLeft: INITIAL_SKIPS
  });
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [maskedWord, setMaskedWord] = useState<MaskedChar[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isWrongAnimation, setIsWrongAnimation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingCutscene, setIsPlayingCutscene] = useState(false);
  const [showSantaPopup, setShowSantaPopup] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showWordListModal, setShowWordListModal] = useState(false);
  
  // Track used words to prevent repetition
  const [usedWords, setUsedWords] = useState<string[]>([]);
  
  // Hint State
  const [isHintLoading, setIsHintLoading] = useState(false);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Audio State
  const [isMuted, setIsMuted] = useState(false);
  const [bgmIndex, setBgmIndex] = useState(() => Math.floor(Math.random() * AUDIO_CONFIG.bgm.length));
  
  // Audio Refs
  const bgmRef = useRef<HTMLAudioElement>(null);
  const ambientRef = useRef<HTMLAudioElement>(null);
  const sfxVictoryRef = useRef<HTMLAudioElement>(null);
  const sfxHintRef = useRef<HTMLAudioElement>(null);
  const sfxSantaVoiceRef = useRef<HTMLAudioElement>(null);
  const sfxBellsRef = useRef<HTMLAudioElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  // Assets Loading
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [showEnterButton, setShowEnterButton] = useState(false);

  // Keyboard State (Mobile)
  const [isShifted, setIsShifted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(true);

  const canAffordHint = gameState.timeLeft > HINT_PENALTY;
  const canSkip = gameState.skipsLeft > 0;

  // Detect Mobile & Tablet
  useEffect(() => {
    const checkMobile = () => {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        setIsMobile(isTouch && window.innerWidth <= 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // --- ASSET PRELOADER ---
  useEffect(() => {
    const preloadAudio = async () => {
       const audioFiles = [
          ...AUDIO_CONFIG.bgm,
          AUDIO_CONFIG.ambient, // Add ambient to preloader
          AUDIO_CONFIG.sfx.victory,
          AUDIO_CONFIG.sfx.hint,
          AUDIO_CONFIG.sfx.flyingSantaVoice,
          AUDIO_CONFIG.sfx.flyingBells
       ];
       const total = audioFiles.length;
       let loaded = 0;

       // Parallel fetch
       const promises = audioFiles.map(src => {
           return fetch(src)
              .then(response => {
                  if(response.ok) {
                      loaded++;
                      setLoadProgress(Math.floor((loaded / total) * 100));
                  } else {
                      console.warn("Failed to load audio:", src);
                  }
              })
              .catch(err => console.warn("Error loading audio:", src, err));
       });

       await Promise.all(promises);
       setAssetsLoaded(true);
       setTimeout(() => {
           setShowEnterButton(true);
       }, 500);
    };

    preloadAudio();
  }, []);

  // --- Audio Handlers ---
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  useEffect(() => {
    if (bgmRef.current) { bgmRef.current.muted = isMuted; bgmRef.current.volume = 0.3; }
    // Ambient sound: Low volume loop
    if (ambientRef.current) { ambientRef.current.muted = isMuted; ambientRef.current.volume = 0.15; }
    
    if (sfxVictoryRef.current) { sfxVictoryRef.current.muted = isMuted; sfxVictoryRef.current.volume = 0.8; }
    if (sfxHintRef.current) { sfxHintRef.current.muted = isMuted; sfxHintRef.current.volume = 0.8; }
    
    // Lower volume for Santa voice and Bells as requested (Distant feeling)
    if (sfxSantaVoiceRef.current) { sfxSantaVoiceRef.current.muted = isMuted; sfxSantaVoiceRef.current.volume = 0.2; }
    if (sfxBellsRef.current) { sfxBellsRef.current.muted = isMuted; sfxBellsRef.current.volume = 0.2; }
  }, [isMuted]);

  useEffect(() => {
    // Reload BGM only if status is NOT loading (i.e., we are in menu or game)
    if (bgmRef.current && assetsLoaded && !showEnterButton) {
        // Ensure loop is enabled for automatic looping
        bgmRef.current.loop = true;
        bgmRef.current.play().catch(e => console.log("Autoplay blocked waiting for interaction"));
    }
  }, [bgmIndex, assetsLoaded, showEnterButton]);

  const handleNextSong = () => {
    setBgmIndex(prev => (prev + 1) % AUDIO_CONFIG.bgm.length);
  };

  const handleEnterGame = () => {
      setShowEnterButton(false);
      // Start BGM immediately
      if (bgmRef.current) {
          bgmRef.current.loop = true;
          bgmRef.current.play().catch(e => console.error("BGM Play Error", e));
      }
      // Start Ambient Sound
      if (ambientRef.current) {
          ambientRef.current.loop = true;
          ambientRef.current.play().catch(e => console.error("Ambient Play Error", e));
      }
  };

  // --- Periodic Ambient Sound (Flying Santa) ---
  useEffect(() => {
      if (!assetsLoaded || showEnterButton) return;

      const playFlyingSounds = () => {
          if (sfxSantaVoiceRef.current) {
              sfxSantaVoiceRef.current.currentTime = 0;
              sfxSantaVoiceRef.current.play().catch(() => {});
          }
          if (sfxBellsRef.current) {
              sfxBellsRef.current.currentTime = 0;
              sfxBellsRef.current.play().catch(() => {});
          }
      };

      const interval = setInterval(playFlyingSounds, 30000);

      return () => {
          clearInterval(interval);
      };
  }, [assetsLoaded, showEnterButton]);


  // --- Game Logic ---

  const prepareLevel = useCallback(async (isReset = false) => {
    setIsLoading(true);
    
    const newQ = await generateQuestion(process.env.API_KEY, isReset ? [] : usedWords);
    
    if (newQ === null) {
         setGameState(prev => ({ ...prev, status: 'completed' }));
         setIsLoading(false);
         if (sfxVictoryRef.current) {
            sfxVictoryRef.current.currentTime = 0;
            sfxVictoryRef.current.play().catch(e => console.log("SFX play failed"));
         }
         return;
    }

    setQuestion(newQ);
    setUsedWords(prev => isReset ? [newQ.answer] : [...prev, newQ.answer]);

    const chars = newQ.answer.split('');
    const len = chars.length;
    const revealCount = Math.max(1, Math.floor(len * 0.35)); 
    
    const indicesToReveal = new Set<number>();
    while (indicesToReveal.size < revealCount) {
      indicesToReveal.add(Math.floor(Math.random() * len));
    }

    const masked: MaskedChar[] = chars.map((char, index) => ({
      char,
      isVisible: indicesToReveal.has(index),
      isSpace: char === ' '
    }));

    setMaskedWord(masked);
    setUserInput('');
    setIsLoading(false);

    if (isReset) {
        setIsPlayingCutscene(true);
    } else {
        setGameState(prev => ({
            ...prev,
            status: 'playing',
            score: prev.score,
            currentLevel: prev.currentLevel + 1,
            timeLeft: Math.max(15, TOTAL_TIME - Math.floor(prev.currentLevel * 0.3)), 
            skipsLeft: prev.skipsLeft
        }));
        setTimeout(() => inputRef.current?.focus(), 100);
    }
    
  }, [usedWords]);

  const handleStart = () => {
    setUsedWords([]);
    prepareLevel(true);
  };

  const onCutsceneComplete = () => {
      setIsPlayingCutscene(false);
      setGameState(prev => ({
          ...prev,
          status: 'playing',
          score: 0,
          currentLevel: 1,
          timeLeft: TOTAL_TIME,
          skipsLeft: INITIAL_SKIPS
      }));
      setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleNextLevel = () => {
    setShowSantaPopup(false);
    prepareLevel(false);
  };

  const handleBackToMenu = () => {
     setGameState({
        status: 'menu', 
        score: 0, 
        currentLevel: 1, 
        timeLeft: TOTAL_TIME, 
        skipsLeft: INITIAL_SKIPS
     });
     setUsedWords([]); 
  };

  const handleSkip = () => {
    if (gameState.status !== 'playing' || gameState.skipsLeft <= 0 || isLoading) return;
    setGameState(prev => ({ ...prev, skipsLeft: prev.skipsLeft - 1 }));
    prepareLevel(false);
  };

  const handleGameOver = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'gameover' }));
  }, []);

  const handleRequestHint = async () => {
    if (gameState.status !== 'playing' || isHintLoading || !question) return;
    if (gameState.timeLeft <= HINT_PENALTY) return;

    // 1. Reveal a random hidden letter immediately
    const hiddenIndices = maskedWord
        .map((item, index) => (!item.isVisible && !item.isSpace ? index : -1))
        .filter(index => index !== -1);

    if (hiddenIndices.length > 0) {
        // Play Hint SFX
        if (sfxHintRef.current) {
            sfxHintRef.current.currentTime = 0;
            sfxHintRef.current.play().catch(e => console.log("Hint SFX failed", e));
        }

        const randomIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
        setMaskedWord(prev => {
            const newMask = [...prev];
            newMask[randomIndex] = { ...newMask[randomIndex], isVisible: true };
            return newMask;
        });

        // Apply penalty immediately
        setGameState(prev => ({
            ...prev,
            timeLeft: Math.max(0, prev.timeLeft - HINT_PENALTY)
        }));
        
        inputRef.current?.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState.status !== 'playing' || !question) return;

    const rawInput = e.target.value;
    if (rawInput.length <= question.answer.length) {
      setUserInput(rawInput);
    }

    if (rawInput === question.answer) {
        // Victory! Play Santa SFX
        if (sfxVictoryRef.current) {
            sfxVictoryRef.current.currentTime = 0;
            sfxVictoryRef.current.play().catch(e => console.log("SFX play failed"));
        }
        // Score: 10 points base + 1 point for every second left (Time Bonus)
        const timeBonus = Math.max(0, gameState.timeLeft);
        setGameState(prev => ({ ...prev, score: prev.score + 10 + timeBonus, status: 'victory' }));
        setShowSantaPopup(true);
        setTimeout(() => setShowSantaPopup(false), 3000);
    } else if (rawInput.length === question.answer.length) {
        setIsWrongAnimation(true);
        setTimeout(() => setIsWrongAnimation(false), 500);
    }
  };

  const handleVirtualKeyPress = (char: string) => {
    if (gameState.status !== 'playing' || !question) return;
    
    const nextInput = userInput + char;
    
    if (nextInput.length <= question.answer.length) {
      setUserInput(nextInput);
      
      if (nextInput === question.answer) {
         if (sfxVictoryRef.current) {
            sfxVictoryRef.current.currentTime = 0;
            sfxVictoryRef.current.play().catch(e => console.log("SFX play failed"));
        }
        const timeBonus = Math.max(0, gameState.timeLeft);
        setGameState(prev => ({ ...prev, score: prev.score + 10 + timeBonus, status: 'victory' }));
        setShowSantaPopup(true);
        setTimeout(() => setShowSantaPopup(false), 3000);
      } else if (nextInput.length === question.answer.length) {
         setIsWrongAnimation(true);
         setTimeout(() => setIsWrongAnimation(false), 500);
      }
    }
  };

  const handleVirtualDelete = () => {
      setUserInput(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isChatOpen || showInfoModal || showWordListModal) return;
      if (gameState.status === 'victory' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault(); 
        handleNextLevel();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [gameState.status, handleNextLevel, isChatOpen, showInfoModal, showWordListModal]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (gameState.status === 'playing') {
      timerRef.current = window.setInterval(() => {
        setGameState(prev => {
          if (prev.status !== 'playing') {
            if (timerRef.current) clearInterval(timerRef.current);
            return prev;
          }
          if (prev.timeLeft <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleGameOver();
            return { ...prev, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState.status, handleGameOver]);

  useEffect(() => {
    if (gameState.status === 'playing' && !isChatOpen && !showInfoModal && !showWordListModal) {
        const interval = setInterval(() => {
            if (!isMobile && document.activeElement !== inputRef.current) {
                inputRef.current?.focus();
            }
        }, 1000);
        return () => clearInterval(interval);
    }
  }, [gameState.status, isChatOpen, showInfoModal, showWordListModal, isMobile]);


  return (
    <div className={`min-h-screen w-full font-sans overflow-hidden flex flex-col items-center relative select-none`}>
      
      {/* AUDIO ELEMENTS (Hidden) */}
      <audio ref={bgmRef} src={AUDIO_CONFIG.bgm[bgmIndex]} onEnded={handleNextSong} loop={true} preload="auto" />
      <audio ref={ambientRef} src={AUDIO_CONFIG.ambient} loop={true} preload="auto" />
      <audio ref={sfxVictoryRef} src={AUDIO_CONFIG.sfx.victory} preload="auto" />
      <audio ref={sfxHintRef} src={AUDIO_CONFIG.sfx.hint} preload="auto" />
      <audio ref={sfxSantaVoiceRef} src={AUDIO_CONFIG.sfx.flyingSantaVoice} preload="auto" />
      <audio ref={sfxBellsRef} src={AUDIO_CONFIG.sfx.flyingBells} preload="auto" />

      {/* BACKGROUND LAYERS */}
      <ScenicBackground isPlayingCutscene={isPlayingCutscene} />

      {/* PRELOADER / ENTER SCREEN */}
      {(!assetsLoaded || showEnterButton) && (
          <div className="fixed inset-0 z-[999] bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-4 transition-opacity duration-500">
              <div className="relative flex flex-col items-center">
                  <h1 className="font-display text-5xl text-xmas-gold mb-2 animate-pulse text-center">Christmas Word Hunt</h1>
                  <p className="text-white/50 text-xs md:text-sm font-light mb-8 text-center tracking-wider">Created by Parinyapat & Google Gemini</p>
                  
                  {!assetsLoaded ? (
                      <div className="flex flex-col items-center gap-4">
                          <Loader2 className="animate-spin text-white w-12 h-12" />
                          <p className="text-white font-mono text-sm">ซานตากำลังขนของขวัญ... (โหลดทรัพยากรจ๊ะเด็กๆ) {loadProgress}%</p>
                          <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-xmas-green transition-all duration-300" style={{ width: `${loadProgress}%` }}></div>
                          </div>
                      </div>
                  ) : (
                      <button 
                        onClick={handleEnterGame}
                        className="group relative px-10 py-5 bg-gradient-to-br from-xmas-red to-red-700 text-white text-2xl font-bold rounded-full shadow-[0_0_30px_rgba(212,36,38,0.6)] border-2 border-white/20 hover:scale-105 transition-all duration-300 animate-bounce-in"
                      >
                          <span className="flex items-center gap-3 drop-shadow-md">
                              <Play fill="white" size={24} /> เข้าสู่เกม
                          </span>
                          <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </button>
                  )}
              </div>
          </div>
      )}

      {/* MUTE CONTROLS */}
      <button 
        onClick={toggleMute}
        className="fixed top-4 left-4 z-[60] p-3 rounded-full bg-black/30 backdrop-blur text-white hover:bg-black/50 transition-colors"
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>

      {/* CHAT BUTTON (RIGHT SIDE) */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed top-1/2 right-0 z-[60] p-4 bg-red-600 rounded-l-2xl shadow-xl hover:bg-red-500 hover:pr-6 transition-all transform hover:scale-105 group border-2 border-r-0 border-white/20"
      >
        <div className="flex flex-col items-center gap-1">
            <div className="relative">
                <MessageCircle size={32} className="text-white fill-current" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border border-red-600"></div>
            </div>
            <span className="text-[10px] font-bold text-white uppercase writing-vertical hidden md:block">Chat</span>
        </div>
      </button>

      {/* MODALS & OVERLAYS */}
      <SantaChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      {showInfoModal && <ChristmasInfoModal onClose={() => setShowInfoModal(false)} />}
      {showWordListModal && <WordListModal onClose={() => setShowWordListModal(false)} />}
      {isPlayingCutscene && <CutsceneOverlay onComplete={onCutsceneComplete} />}
      {showSantaPopup && !gameState.status.includes('completed') && <VictorySanta />}
      
      {/* Game Completed View */}
      {gameState.status === 'completed' && <GameCompletedView onBackToMenu={handleBackToMenu} />}

      {/* MAIN UI - Only show if NOT completed and NOT in Loading state */}
      {gameState.status !== 'completed' && !showEnterButton && (
        <main className={`flex-grow flex flex-col items-center justify-center p-4 relative z-40 w-full max-w-4xl transition-all duration-500 ${isPlayingCutscene ? 'opacity-0' : 'opacity-100'} overflow-y-auto ${isMobile && isKeyboardVisible && gameState.status === 'playing' ? 'pb-[320px]' : 'pb-20'}`}>
            
            {/* SCORE HEADER */}
            {(gameState.status === 'playing' || gameState.status === 'victory' || gameState.status === 'gameover') && (
                <div className="w-full flex justify-between items-center mb-6 px-4 z-50">
                    <div className="glass-card px-4 py-2 rounded-xl flex flex-col items-center transform -rotate-2 border-b-4 border-xmas-red min-w-[80px]">
                        <span className="text-xmas-gold text-[10px] md:text-xs uppercase font-bold tracking-wider">คะแนน</span>
                        <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">{gameState.score}</span>
                    </div>
                    
                    <div className="glass-card px-4 py-2 rounded-xl flex flex-col items-center transform rotate-2 border-b-4 border-xmas-green min-w-[80px]">
                        <span className="text-xmas-gold text-[10px] md:text-xs uppercase font-bold tracking-wider">ด่านที่</span>
                        <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">{gameState.currentLevel}</span>
                    </div>
                </div>
            )}

            {/* MENU CARD */}
            {gameState.status === 'menu' && !isLoading && !isPlayingCutscene && (
                <>
                <div className="relative glass-card p-8 md:p-12 rounded-3xl text-center max-w-md w-full mx-auto animate-float">
                    <h1 className="font-display text-5xl md:text-6xl text-xmas-gold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mb-2">
                    Christmas
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 drop-shadow-md tracking-wide">
                    Word Hunt
                    </h2>
                    
                    <p className="text-slate-200 mb-8 font-light text-sm md:text-base leading-relaxed">
                    ทายคำศัพท์ต้อนรับวันคริสต์มาส<br/>
                    ท่ามกลางแสงจันทร์และหิมะ
                    </p>
                    
                    <button
                    onClick={handleStart}
                    className="w-full group relative px-8 py-4 bg-gradient-to-br from-xmas-red to-red-700 text-white text-xl font-bold rounded-full shadow-lg border border-red-400/30 hover:scale-105 transition-all duration-300"
                    >
                    <span className="flex items-center justify-center gap-2 drop-shadow-md">
                        <Play fill="white" size={20} /> เริ่มเกม
                    </span>
                    <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                    
                    <div className="mt-6 text-[10px] text-slate-400 uppercase tracking-widest">
                    Powered by Google Gemini
                    </div>
                </div>

                {/* Function Buttons and External Links */}
                <div className="w-full max-w-md mx-auto mt-6 z-50 flex flex-col gap-4">
                    {/* Info and Word List Row */}
                    <div className="flex gap-3 md:gap-4">
                        <button 
                            onClick={() => setShowInfoModal(true)}
                            className="flex-[2] glass-card p-3 md:p-4 rounded-2xl flex items-center justify-between text-left group hover:bg-white/10 transition-colors border border-xmas-gold/30 hover:border-xmas-gold shadow-lg"
                        >
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="p-2 md:p-3 bg-xmas-red/20 rounded-full border border-xmas-red/30">
                                    <BookOpen size={20} className="text-xmas-gold md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-xs md:text-sm">เกร็ดความรู้</h3>
                                    <p className="text-[9px] md:text-[10px] text-slate-300 group-hover:text-xmas-gold transition-colors">สาระน่ารู้</p>
                                </div>
                            </div>
                            <ChevronForwardWrapper />
                        </button>

                        <button 
                            onClick={() => setShowWordListModal(true)}
                            className="flex-1 glass-card p-3 md:p-4 rounded-2xl flex items-center justify-center group hover:bg-white/10 transition-colors border border-xmas-gold/30 hover:border-xmas-gold shadow-lg"
                        >
                            <div className="flex flex-col items-center gap-1">
                                <List size={20} className="text-xmas-gold md:w-6 md:h-6" />
                                <span className="text-[9px] md:text-[10px] text-slate-300 whitespace-nowrap">คำศัพท์</span>
                            </div>
                        </button>
                    </div>

                    {/* Recommended Games Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <a 
                            href="https://words-up-game.web.app" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="glass-card p-3 rounded-2xl flex items-center gap-3 hover:bg-blue-900/40 transition-all border border-blue-400/30 group"
                        >
                            <div className="p-2 bg-blue-500/20 rounded-xl">
                                <GraduationCap size={20} className="text-blue-300" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-white text-sm group-hover:text-blue-200">Words UP!</span>
                                <span className="text-[10px] text-slate-400">ศัพท์ Oxford 3000</span>
                            </div>
                        </a>

                        <a 
                            href="https://wordsup-marketing.web.app" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="glass-card p-3 rounded-2xl flex items-center gap-3 hover:bg-purple-900/40 transition-all border border-purple-400/30 group"
                        >
                            <div className="p-2 bg-purple-500/20 rounded-xl">
                                <TrendingUp size={20} className="text-purple-300" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-white text-sm group-hover:text-purple-200">Words UP MKT</span>
                                <span className="text-[10px] text-slate-400">ศัพท์การตลาด</span>
                            </div>
                        </a>
                    </div>
                </div>
                </>
            )}

            {/* LOADING */}
            {isLoading && !isPlayingCutscene && (
                <div className="glass-card p-8 rounded-full flex flex-col items-center animate-pulse">
                    <Snowflake className="text-white w-12 h-12 animate-spin-slow mb-2" />
                    <p className="text-xmas-gold font-bold">กำลังโหลด...</p>
                </div>
            )}

            {/* GAMEPLAY */}
            {!isLoading && gameState.status !== 'menu' && question && (
            <div className="w-full flex flex-col items-center relative z-50">
                
                {/* Category */}
                <div className="mb-2 px-6 py-1 bg-white/90 backdrop-blur text-xmas-red rounded-full shadow-lg transform -rotate-1 border border-xmas-red/20">
                    <span className="text-base md:text-lg font-bold">
                        หมวด: {question.category}
                    </span>
                </div>

                {/* Timer */}
                {gameState.status === 'playing' && (
                    <div className="mb-4 scale-90 md:scale-100">
                        <Timer timeLeft={gameState.timeLeft} totalTime={Math.max(15, TOTAL_TIME - Math.floor(gameState.currentLevel * 0.3))} />
                    </div>
                )}

                {/* Word Display */}
                <div className="w-full px-2 mb-2 max-w-3xl">
                    <LetterDisplay 
                        maskedWord={maskedWord} 
                        userInput={userInput} 
                        isWrong={isWrongAnimation} 
                        status={gameState.status}
                    />
                </div>

                {/* Hint */}
                <div className="glass-card px-6 py-4 rounded-2xl mb-6 mx-4 max-w-xl w-full text-center relative border-l-4 border-l-xmas-gold min-h-[5rem] flex items-center justify-center">
                    <p className="text-lg md:text-2xl text-white font-medium drop-shadow-md animate-fade-in leading-relaxed">
                        "{question.hint}"
                    </p>
                </div>

                {/* Controls */}
                {gameState.status === 'playing' && (
                    <div className="flex gap-4 w-full max-w-md px-4 justify-center">
                        <button
                            onClick={handleRequestHint}
                            disabled={!canAffordHint}
                            className={`
                                flex-1 px-4 md:px-5 py-3 rounded-xl font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-lg transition-all
                                ${canAffordHint
                                    ? 'bg-xmas-gold text-red-900 hover:brightness-110 active:scale-95' 
                                    : 'bg-slate-700/50 text-slate-400 cursor-not-allowed'}
                            `}
                        >
                            <Lightbulb size={18} /> <span className="hidden md:inline">ตัวช่วย</span> (-{HINT_PENALTY}วิ)
                        </button>

                        <button
                            onClick={handleSkip}
                            disabled={!canSkip}
                            className={`
                                flex-1 px-4 md:px-5 py-3 rounded-xl font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-lg transition-all
                                ${canSkip
                                    ? 'bg-white text-xmas-green hover:brightness-110 active:scale-95' 
                                    : 'bg-slate-700/50 text-slate-400 cursor-not-allowed'}
                            `}
                        >
                            <SkipForward size={18} /> <span className="hidden md:inline">ข้าม</span> ({gameState.skipsLeft})
                        </button>
                    </div>
                )}

                {/* Victory / Gameover Panels */}
                {gameState.status === 'victory' && (
                    <div className="glass-card p-8 rounded-3xl text-center animate-bounce-in border-2 border-xmas-green/50">
                        <h2 className="text-4xl font-bold text-xmas-green mb-2 drop-shadow-md">ถูกต้อง!</h2>
                        <button onClick={handleNextLevel} className="mt-4 px-8 py-3 bg-xmas-green text-white rounded-xl font-bold shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 w-full">
                            ไปข้อต่อไป <Play size={18} fill="white" />
                        </button>
                    </div>
                )}

                {gameState.status === 'gameover' && (
                    <div className="glass-card p-8 rounded-3xl text-center animate-fade-in-up border-2 border-xmas-red/50">
                        <Bell className="w-16 h-16 text-xmas-red mx-auto mb-4 animate-shake" />
                        <h2 className="text-4xl font-bold text-xmas-red mb-2">หมดเวลา!</h2>
                        <p className="text-slate-300 mb-6">เฉลย: <span className="text-xmas-gold font-bold text-2xl">{question.answer}</span></p>
                        <button onClick={handleBackToMenu} className="w-full px-8 py-3 bg-xmas-red text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                            <RefreshCw size={18} /> เริ่มเกมใหม่
                        </button>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    className="opacity-0 absolute top-0 left-0 h-0 w-0"
                    autoComplete="off"
                    disabled={gameState.status !== 'playing' || isChatOpen || showInfoModal || showWordListModal}
                    readOnly={isMobile}
                />
                
                {gameState.status === 'playing' && !isChatOpen && !showInfoModal && !showWordListModal && !isMobile && (
                    <div 
                        onClick={() => inputRef.current?.focus()}
                        className="mt-8 text-white/50 bg-black/20 px-6 py-2 rounded-full text-xs cursor-pointer md:hidden backdrop-blur-sm"
                    >
                        แตะเพื่อพิมพ์
                    </div>
                )}

            </div>
            )}
        </main>
      )}
      
      {/* THAI KEYBOARD (MOBILE/TABLET ONLY) */}
      {gameState.status === 'playing' && isMobile && !isChatOpen && !showInfoModal && !showWordListModal && (
          // @ts-ignore
          <ThaiKeyboard 
              onKeyPress={handleVirtualKeyPress} // @ts-ignore
              onDelete={handleVirtualDelete} 
              isShifted={isShifted} 
              toggleShift={() => setIsShifted(!isShifted)} 
              isVisible={isKeyboardVisible}
              onToggleVisibility={() => setIsKeyboardVisible(!isKeyboardVisible)}
          />
      )}

      <footer className="w-full p-4 text-center text-white/20 text-[10px] z-50 font-bold fixed bottom-0 pointer-events-none md:block hidden">
        Christmas Word Hunt • Created by Parinyapat & Google Gemini
      </footer>
    </div>
  );
}
