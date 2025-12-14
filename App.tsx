import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Timer } from './components/Timer';
import { LetterDisplay } from './components/LetterDisplay';
import { generateQuestion, getSantaResponse, generateSantaHint } from './services/geminiService';
import { Question, GameState, MaskedChar, ChatMessage } from './types';
import { AUDIO_CONFIG } from './config/audio';
import { Gift, Snowflake, RefreshCw, Play, Lightbulb, SkipForward, Bell, Cloud, Star, Moon, Volume2, VolumeX, MessageCircle, X, Send, User, BookOpen, ChevronDown, ChevronUp, Calendar, Globe, ExternalLink, History, Palette, Sparkles, Home, Zap, Award, Coins } from 'lucide-react';

const TOTAL_TIME = 30;
const HINT_PENALTY = 5;
const INITIAL_SKIPS = 3;

// --- Vector Art Components ---
// ... (Vector Art Components Remain Unchanged - HouseArt, ChurchArt, PineTree, SantaSleigh, ScenicBackground, CutsceneOverlay, VictorySanta, GameCompletedView, SantaChat) ...
const HouseArt = () => (
  <div className="relative w-32 h-24 md:w-48 md:h-32 transform scale-75 md:scale-100">
    {/* Chimney */}
    <div id="chimney-target" className="absolute -top-6 right-6 w-8 h-12 bg-red-800 border-2 border-red-950 z-10">
       <div className="w-full h-3 bg-white top-0 absolute rounded-sm shadow-sm"></div>
       <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          <Cloud className="w-4 h-4 text-white/40 animate-bounce delay-100" fill="currentColor" />
          <Cloud className="w-6 h-6 text-white/30 animate-bounce -mt-2" fill="currentColor" />
       </div>
    </div>
    {/* Snow Roof */}
    <div className="absolute -top-6 -left-2 w-[110%] h-14 bg-white skew-x-12 rounded-lg z-20 shadow-md border-b-4 border-slate-200"></div>
    {/* Main Body */}
    <div className="absolute top-2 left-0 w-full h-full bg-[#5D4037] z-10 flex items-end justify-between px-4 pb-0 rounded-sm shadow-lg">
        {/* Door */}
        <div className="w-10 h-16 bg-[#3E2723] rounded-t-full border-2 border-[#281815] relative">
           <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full absolute top-8 right-1 shadow-[0_0_5px_rgba(234,179,8,0.8)]"></div>
        </div>
        {/* Window */}
        <div className="w-12 h-10 bg-yellow-600 border-4 border-[#3E2723] mb-4 grid grid-cols-2 shadow-[0_0_15px_rgba(234,179,8,0.6)]">
            <div className="bg-yellow-300/80 animate-pulse"></div>
            <div className="bg-yellow-300/90"></div>
        </div>
    </div>
  </div>
);

const ChurchArt = () => (
    <div className="relative w-24 h-32 md:w-32 md:h-40 flex flex-col items-center transform scale-75 md:scale-100">
        {/* Steeple */}
        <div className="w-0 h-0 border-l-[35px] border-l-transparent border-r-[35px] border-r-transparent border-b-[70px] border-b-[#475569] relative z-20 drop-shadow-lg">
             {/* Cross/Top */}
             <div className="absolute -top-2 -left-0.5 w-1 h-3 bg-yellow-400"></div>
        </div>
        {/* Main Body */}
        <div className="w-28 h-24 bg-[#64748b] relative z-10 flex justify-center items-end pb-0 shadow-lg">
             {/* Snow Roof Cap */}
             <div className="absolute -top-3 w-32 h-6 bg-white rounded-full border-b-2 border-slate-300"></div>
             {/* Door */}
             <div className="w-10 h-14 bg-[#331c11] rounded-t-full relative top-0 border border-slate-700"></div>
             {/* Windows */}
             <div className="absolute top-6 left-3 w-5 h-10 bg-yellow-400 rounded-t-full shadow-[0_0_10px_rgba(250,204,21,0.5)] border-2 border-slate-700"></div>
             <div className="absolute top-6 right-3 w-5 h-10 bg-yellow-400 rounded-t-full shadow-[0_0_10px_rgba(250,204,21,0.5)] border-2 border-slate-700"></div>
        </div>
    </div>
);

const PineTree = ({ scale = 1, withLights = false }: { scale?: number, withLights?: boolean }) => (
    <div className="relative flex flex-col items-center" style={{ transform: `scale(${scale})` }}>
        {withLights && <Star className="absolute -top-6 text-yellow-300 w-8 h-8 animate-spin-slow drop-shadow-[0_0_10px_rgba(253,224,71,0.8)] z-30" fill="currentColor" />}
        {/* Leaves Levels */}
        <div className="w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-b-[40px] border-b-[#0f3923] relative z-20 -mb-4 drop-shadow-sm">
             <div className="absolute top-6 -left-3 w-1 h-1 bg-white rounded-full opacity-60"></div>
        </div>
        <div className="w-0 h-0 border-l-[35px] border-l-transparent border-r-[35px] border-r-transparent border-b-[50px] border-b-[#165B33] relative z-10 -mb-4 drop-shadow-sm">
             {withLights && (
                <>
                  <div className="absolute top-8 left-2 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <div className="absolute top-6 -left-4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-75"></div>
                  {/* Tinsel */}
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
        {/* Trunk */}
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
        {/* Sleigh (Back/Left) */}
        <div className="relative z-20 mr-2">
             {/* Santa */}
             <div className="absolute -top-5 left-2 w-6 h-8 bg-red-600 rounded-t-full flex justify-center items-start">
                  <div className="w-full h-2 bg-white mt-2"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></div> {/* Hat ball */}
                  <div className="absolute top-2 w-4 h-3 bg-[#ffe0bd] rounded-full"></div> {/* Face */}
                  <div className="absolute top-4 w-6 h-4 bg-white rounded-full shadow-sm"></div> {/* Beard */}
             </div>
             {/* Sleigh Body */}
             <div className="w-16 h-8 bg-red-800 rounded-b-2xl rounded-tr-xl border-t-2 border-yellow-500 relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-black/10"></div>
             </div>
             {/* Runner */}
             <div className="absolute -bottom-2 -left-1 w-20 h-1 bg-slate-300 rounded-full rotate-[-5deg]">
                 <div className="absolute left-0 -top-2 w-1 h-3 bg-slate-300"></div>
                 <div className="absolute right-4 -top-2 w-1 h-3 bg-slate-300"></div>
             </div>
             {/* Gift Stack */}
             <div className="absolute -top-3 right-1 w-4 h-4 bg-green-600 rounded-sm rotate-12 z-[-1]"></div>
        </div>

        {/* Reins */}
        <div className="w-12 h-[1px] bg-white/60 absolute bottom-5 left-[3.5rem] rotate-[-10deg] z-0"></div>

        {/* Reindeer Group (Front/Right) */}
        <div className="flex gap-1 relative z-10 ml-4">
           {[1, 2].map((i) => (
             <div key={i} className="relative w-8 h-6 bg-[#5D4037] rounded-lg">
                {/* Head */}
                <div className="absolute -top-2 right-0 w-4 h-4 bg-[#5D4037] rounded-full">
                   {/* Antlers */}
                   <div className="absolute -top-3 right-0 w-1 h-4 bg-[#3E2723] rotate-45"></div>
                   <div className="absolute -top-3 right-2 w-1 h-4 bg-[#3E2723] -rotate-12"></div>
                   {/* Nose (Red for the front/last one) */}
                   {i === 2 && <div className="absolute top-1 right-[-2px] w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_red]"></div>}
                </div>
                {/* Legs */}
                <div className="absolute bottom-[-4px] left-1 w-1 h-3 bg-[#3E2723] animate-pulse"></div>
                <div className="absolute bottom-[-4px] right-2 w-1 h-3 bg-[#3E2723] animate-pulse delay-75"></div>
             </div>
           ))}
        </div>
    </div>
);

const ScenicBackground = () => (
  <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-[#0B1026]">
    {/* 1. SKY LAYER */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0B1026] to-[#1e293b]"></div>
    
    {/* Stars */}
    {[...Array(20)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white animate-twinkle" style={{
            top: `${Math.random() * 50}%`,
            left: `${Math.random() * 100}%`,
            width: Math.random() > 0.5 ? '2px' : '3px',
            height: Math.random() > 0.5 ? '2px' : '3px',
            animationDelay: `${Math.random() * 2}s`
        }}></div>
    ))}

    {/* Big Moon (With extra Glow) */}
    <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-48 h-48 md:w-64 md:h-64 bg-[#FDF6E3] rounded-full shadow-[0_0_120px_40px_rgba(253,246,227,0.5)] z-0">
        <div className="absolute inset-0 rounded-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
    </div>

    {/* Flying Santa & Sleigh (Replaces old dot animation) */}
    <div className="absolute top-[20%] left-0 w-full z-10 animate-fly-orbit opacity-90 pointer-events-none">
        <div className="flex items-center justify-center transform scale-75 md:scale-100">
             <SantaSleigh />
        </div>
    </div>

    {/* 2. MIDDLE LAYER: HILLS & BUILDINGS */}
    {/* Back Dark Hill */}
    <div className="absolute bottom-0 left-0 w-full h-[45%] z-10">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full text-[#1e293b] fill-current" preserveAspectRatio="none">
            <path d="M0,160 C320,300, 420,0, 740,160 C1060,320, 1340,60, 1440,120 V320 H0 Z"></path>
        </svg>
    </div>

    {/* Middle Blue-Grey Hill */}
    <div className="absolute bottom-0 left-0 w-full h-[35%] z-20">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full text-[#94a3b8] fill-current" preserveAspectRatio="none">
            <path d="M0,192 C220,100, 500,250, 800,150 C1100,50, 1300,200, 1440,100 V320 H0 Z"></path>
        </svg>
        
        {/* Buildings on the hill line (approximate positioning via %) */}
        <div className="absolute bottom-[25%] left-[10%] md:left-[15%]">
            <HouseArt />
        </div>
        <div className="absolute bottom-[35%] right-[5%] md:right-[15%]">
            <ChurchArt />
        </div>
        <div className="absolute bottom-[28%] left-[5%] transform scale-75"><PineTree scale={0.8} /></div>
        <div className="absolute bottom-[32%] left-[28%] transform scale-50"><PineTree scale={0.6} /></div>
        <div className="absolute bottom-[40%] right-[25%] transform scale-75"><PineTree scale={0.8} /></div>
    </div>

    {/* 3. FOREGROUND LAYER: WHITE SNOW & MAIN TREE */}
    <div className="absolute bottom-0 left-0 w-full h-[20%] z-30">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full text-[#f1f5f9] fill-current drop-shadow-lg" preserveAspectRatio="none">
             <path d="M0,128 C300,250, 600,0, 900,150 C1200,300, 1380,100, 1440,160 V320 H0 Z"></path>
        </svg>
        
        {/* Central Big Tree */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 transform scale-125 md:scale-150 z-40">
             <PineTree scale={1.5} withLights={true} />
        </div>

        {/* Foreground Trees */}
        <div className="absolute bottom-0 left-0 transform scale-100"><PineTree scale={1.2} /></div>
        <div className="absolute bottom-4 right-4 transform scale-110"><PineTree scale={1.3} /></div>
    </div>
  </div>
);

const CutsceneOverlay = ({ onComplete }: { onComplete: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 2500); 
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            {/* Focus Effect */}
            <div className="absolute inset-0 bg-black/60 animate-fade-out delay-[2s]"></div>
            
            {/* Santa dropping into the generic house position on the left */}
            <div className="absolute bottom-[35%] left-[15%] w-20 h-20 md:w-32 md:h-32 flex flex-col items-center">
                 <div className="animate-chimney-drop text-red-600 relative z-50 filter drop-shadow-2xl">
                     <Gift size={64} fill="#D42426" stroke="white" strokeWidth={1.5} />
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                     </div>
                 </div>
                 {/* Text Hint */}
                 <div className="absolute -top-32 w-48 text-center text-white font-display text-xl animate-pulse shadow-black drop-shadow-md">
                    ...Santa is landing...
                 </div>
            </div>
        </div>
    );
};

const VictorySanta = () => (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 animate-pop-up">
        <div className="relative w-64 h-64 md:w-80 md:h-80">
            {/* Speech Bubble */}
            <div className="absolute -top-16 -right-10 bg-white p-4 rounded-2xl rounded-bl-none shadow-xl border-4 border-xmas-red transform rotate-6 animate-bounce">
                <span className="text-3xl font-display font-bold text-xmas-red">โฮ่ โฮ่ โฮ่!</span>
            </div>
            {/* Santa Art */}
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

// --- Game Completed Component ---
const GameCompletedView = ({ onBackToMenu }: { onBackToMenu: () => void }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Darker Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
            
            {/* Center Content */}
            <div className="relative z-50 flex flex-col items-center animate-pop-up">
                 {/* Big Santa */}
                 <div className="relative w-72 h-72 md:w-96 md:h-96">
                    {/* Speech Bubble */}
                    <div className="absolute -top-20 right-0 left-0 mx-auto w-64 bg-white p-6 rounded-3xl shadow-2xl border-4 border-xmas-red transform -rotate-2 animate-float text-center z-50">
                        <h2 className="text-3xl font-display font-bold text-xmas-red mb-2">โฮ่ โฮ่ โฮ่</h2>
                        <p className="text-slate-800 font-bold text-xl">เกมจบแล้วจ้า~</p>
                        <p className="text-slate-500 text-sm mt-1">เก่งมากเด็กดี!</p>
                         {/* Triangle */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-xmas-red"></div>
                    </div>

                    {/* Santa Art (Reused but bigger/centered) */}
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

                 {/* Back Button */}
                 <button 
                    onClick={onBackToMenu}
                    className="mt-8 px-8 py-3 bg-white text-xmas-red rounded-full font-bold shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:bg-slate-100 hover:scale-105 transition-all flex items-center gap-2 border-2 border-red-200"
                 >
                    <Home size={20} /> กลับหน้าเริ่มต้น
                 </button>
            </div>
        </div>
    );
};

const SantaChat = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: 'โฮ่ โฮ่ โฮ่! สวัสดีจ้ะเด็กน้อย มีเรื่องอะไรอยากถามซานต้าเกี่ยวกับวันคริสต์มาสไหม?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        const santaReply = await getSantaResponse(process.env.API_KEY, messages, input);
        
        setMessages(prev => [...prev, { role: 'model', text: santaReply }]);
        setIsTyping(false);
    };

    return (
        <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-[#0f172a]/95 backdrop-blur-xl border-l border-white/10 z-[100] transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
             {/* Header */}
             <div className="p-4 bg-red-800/80 flex items-center justify-between border-b border-white/10 shadow-lg">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-yellow-400">
                         {/* Mini Santa Avatar */}
                         <div className="relative w-full h-full bg-red-600">
                              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-4 bg-[#ffe0bd] rounded-full"></div>
                              <div className="absolute bottom-0 w-full h-4 bg-white"></div>
                         </div>
                     </div>
                     <div>
                         <h3 className="font-bold text-white text-lg font-display">Santa Claus</h3>
                         <div className="flex items-center gap-1 text-xs text-green-300">
                             <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                             Online @North Pole
                         </div>
                     </div>
                 </div>
                 <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                     <X className="text-white" />
                 </button>
             </div>

             {/* Messages */}
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {messages.map((msg, idx) => (
                     <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[80%] p-3 rounded-2xl text-sm md:text-base ${
                             msg.role === 'user' 
                             ? 'bg-blue-600 text-white rounded-tr-none' 
                             : 'bg-white text-slate-800 rounded-tl-none border-2 border-red-100'
                         } shadow-md`}>
                             {msg.text}
                         </div>
                     </div>
                 ))}
                 {isTyping && (
                     <div className="flex justify-start">
                         <div className="bg-white/50 p-3 rounded-2xl rounded-tl-none flex gap-1">
                             <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                             <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></div>
                             <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></div>
                         </div>
                     </div>
                 )}
                 <div ref={messagesEndRef} />
             </div>

             {/* Input */}
             <div className="p-4 bg-slate-900/50 border-t border-white/10">
                 <div className="flex gap-2">
                     <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="ถามซานต้า..." 
                        className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-full px-4 py-2 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-slate-400"
                        disabled={isTyping}
                     />
                     <button 
                        onClick={handleSend}
                        disabled={isTyping || !input.trim()}
                        className="p-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full shadow-lg transition-all"
                     >
                         <Send size={20} />
                     </button>
                 </div>
             </div>
        </div>
    );
};

// --- Christmas Info Modal Component ---
const ChristmasInfoModal = ({ onClose }: { onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'facts'>('general');

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-[#0f172a] border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-pop-up">
                
                {/* Header with Decorative Art */}
                <div className="relative p-6 bg-gradient-to-r from-red-900 to-red-800 border-b border-white/10 shrink-0">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Snowflake size={120} />
                    </div>
                    <div className="flex items-center justify-between relative z-10 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm shadow-lg">
                                <BookOpen size={32} className="text-xmas-gold" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-display font-bold text-white drop-shadow-md">
                                    เกร็ดความรู้คริสต์มาส
                                </h2>
                                <p className="text-sm text-red-200">เรื่องราวน่ารู้ เทศกาลแห่งความสุข</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                        >
                            <X size={28} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 relative z-10">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm transition-all ${
                                activeTab === 'general' 
                                ? 'bg-white text-red-900 shadow-md' 
                                : 'bg-black/20 text-red-100 hover:bg-black/30'
                            }`}
                        >
                            ประวัติ & ความหมาย
                        </button>
                        <button
                            onClick={() => setActiveTab('facts')}
                            className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm transition-all ${
                                activeTab === 'facts' 
                                ? 'bg-white text-red-900 shadow-md' 
                                : 'bg-black/20 text-red-100 hover:bg-black/30'
                            }`}
                        >
                            5 เรื่องจริงสุดเซอร์ไพรส์
                        </button>
                    </div>
                </div>

                {/* Scrollable Content Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-hide text-slate-200">
                    
                    {/* --- TAB 1: GENERAL INFO --- */}
                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Intro Quote */}
                            <div className="p-6 bg-blue-900/30 rounded-2xl border border-blue-500/20 italic text-center text-blue-200 relative">
                                <Sparkles className="absolute top-2 left-2 text-yellow-400 opacity-60" size={20} />
                                "คริสต์มาสไม่ใช่แค่ช่วงเวลา... แต่มันคือความรู้สึก"
                                <Sparkles className="absolute bottom-2 right-2 text-yellow-400 opacity-60" size={20} />
                            </div>

                            {/* Section 1: Origin */}
                            <section className="space-y-3">
                                <h3 className="flex items-center gap-2 text-xl font-bold text-xmas-gold border-b border-white/10 pb-2">
                                    <History size={24} className="text-red-400" />
                                    1. กำเนิดและที่มา (Origin)
                                </h3>
                                <p className="leading-relaxed font-light">
                                    คำว่า <strong className="text-white">Christmas</strong> มาจากภาษาอังกฤษโบราณ <em className="text-yellow-200">"Cristes Maesse"</em> หมายถึง "พิธีมิสซาของพระคริสต์" เป็นวันเฉลิมฉลองการประสูติของ <strong className="text-white">พระเยซูคริสต์</strong> ศาสดาของศาสนาคริสต์ ซึ่งตรงกับวันที่ 25 ธันวาคมของทุกปี
                                </p>
                                <div className="bg-white/5 p-4 rounded-xl text-sm border-l-4 border-yellow-500">
                                    <strong>รู้หรือไม่?</strong> ในพระคัมภีร์ไม่ได้ระบุวันที่ 25 ธ.ค. ไว้ชัดเจน แต่คริสตจักรเลือกวันนี้เพื่อให้สอดคล้องกับเทศกาลเฉลิมฉลองแสงสว่างในฤดูหนาว (Winter Solstice) ของชาวโรมันโบราณ เพื่อให้ง่ายต่อการเผยแผ่ศาสนา
                                </div>
                            </section>

                            {/* Section 2: Santa Claus */}
                            <section className="space-y-3">
                                <h3 className="flex items-center gap-2 text-xl font-bold text-xmas-gold border-b border-white/10 pb-2">
                                    <User size={24} className="text-red-400" />
                                    2. ตำนานซานตาคลอส (Santa Claus)
                                </h3>
                                <p className="leading-relaxed font-light">
                                    ซานตาคลอสมีต้นแบบมาจาก <strong className="text-white">นักบุญนิโคลัส (St. Nicholas)</strong> แห่งเมืองไมรา ผู้มีจิตใจเมตตาและชอบแอบนำเหรียญทองไปหย่อนลงในถุงเท้าของเด็กยากจน จนกลายเป็นธรรมเนียมการแขวนถุงเท้า
                                </p>
                                <p className="leading-relaxed font-light text-sm text-slate-400">
                                    *ภาพจำ "ลุงอ้วนชุดแดงเคราขาว" ที่เราคุ้นตาในปัจจุบัน ได้รับอิทธิพลอย่างมากจากโฆษณาของ Coca-Cola ในปี 1931
                                </p>
                            </section>

                            {/* Section 3: Symbols */}
                            <section className="space-y-3">
                                <h3 className="flex items-center gap-2 text-xl font-bold text-xmas-gold border-b border-white/10 pb-2">
                                    <Palette size={24} className="text-red-400" />
                                    3. ความหมายของสัญลักษณ์
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex gap-3 bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                                        <div className="p-2 bg-green-900/50 rounded-lg h-fit"><Gift size={20} className="text-green-400" /></div>
                                        <div>
                                            <h4 className="font-bold text-white">ต้นคริสต์มาส</h4>
                                            <p className="text-sm text-slate-300">สื่อถึง "ชีวิตนิรันดร์" เพราะเป็นไม้ที่ไม่ผลัดใบในหน้าหนาว</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                                        <div className="p-2 bg-yellow-900/50 rounded-lg h-fit"><Star size={20} className="text-yellow-400" /></div>
                                        <div>
                                            <h4 className="font-bold text-white">ดาว</h4>
                                            <p className="text-sm text-slate-300">ตัวแทนของ "ดาวแห่งเบธเลเฮม" ที่นำทางโหราจารย์ไปพบพระเยซู</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                                        <div className="p-2 bg-red-900/50 rounded-lg h-fit"><Bell size={20} className="text-red-400" /></div>
                                        <div>
                                            <h4 className="font-bold text-white">สีแดง-เขียว</h4>
                                            <p className="text-sm text-slate-300">แดง = พระโลหิต/ความรัก, เขียว = ชีวิต/ธรรมชาติ</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                                        <div className="p-2 bg-blue-900/50 rounded-lg h-fit"><Globe size={20} className="text-blue-400" /></div>
                                        <div>
                                            <h4 className="font-bold text-white">พวงหรีด (Wreath)</h4>
                                            <p className="text-sm text-slate-300">วงกลมที่ไม่มีจุดจบ สื่อถึง "ความรักที่ไม่มีที่สิ้นสุดของพระเจ้า"</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* --- TAB 2: SURPRISING FACTS --- */}
                    {activeTab === 'facts' && (
                         <div className="space-y-8 animate-fade-in">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-xmas-gold">5 เรื่องจริงสุดเซอร์ไพรส์</h3>
                                <p className="text-sm text-slate-400">ที่คุณอาจไม่เคยรู้มาก่อน</p>
                            </div>

                            {/* Fact 1 */}
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h4 className="font-bold text-lg text-red-300 mb-2 flex items-center gap-2">
                                    <Calendar size={20} /> 1. วันที่ 25 ธันวาคม มาจากไหน?
                                </h4>
                                <p className="text-sm leading-relaxed text-slate-300">
                                    ทฤษฎีหนึ่งเชื่อว่าคริสตจักรเลือกวันนี้เพื่อทับซ้อนกับเทศกาล <strong>Saturnalia</strong> ของชาวโรมัน และวันเกิดของเทพสุริยัน (Sol Invictus) เพื่อให้การเปลี่ยนศาสนาของคนในยุคนั้นทำได้ง่ายขึ้น
                                </p>
                            </div>

                            {/* Fact 2 */}
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h4 className="font-bold text-lg text-green-300 mb-2 flex items-center gap-2">
                                    <Zap size={20} /> 2. ธรรมเนียม "นอกรีต" ที่เคยถูกแบน
                                </h4>
                                <p className="text-sm leading-relaxed text-slate-300">
                                    <strong>มิสเซิลโท</strong> เคยเป็นพืชศักดิ์สิทธิ์ของพวกเพเกิน และถูกห้ามใช้ในโบสถ์ช่วงแรก นอกจากนี้ยังมี "เทศกาลคนโง่" ที่ล้อเลียนพิธีกรรมทางศาสนา ซึ่งคริสตจักรต้องใช้เวลาหลายศตวรรษในการปราบปราม
                                </p>
                            </div>

                             {/* Fact 3 */}
                             <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h4 className="font-bold text-lg text-yellow-300 mb-2 flex items-center gap-2">
                                    <Award size={20} /> 3. ต้นคริสต์มาส ดังได้เพราะ "อินฟลูเอนเซอร์"
                                </h4>
                                <p className="text-sm leading-relaxed text-slate-300">
                                    ต้นคริสต์มาสเริ่มในเยอรมนี แต่โด่งดังไปทั่วโลกเพราะ <strong>พระราชินีวิกตอเรีย</strong> และเจ้าชายอัลเบิร์ตแห่งอังกฤษ เมื่อภาพราชวงศ์ฉลองรอบต้นคริสต์มาสถูกเผยแพร่ในปี 1848 ก็กลายเป็นกระแสไวรัลทันที
                                </p>
                            </div>

                            {/* Fact 4 */}
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h4 className="font-bold text-lg text-blue-300 mb-2 flex items-center gap-2">
                                    <User size={20} /> 4. ซานตาคลอส ผ่านการ "รีแบรนด์" มานับครั้งไม่ถ้วน
                                </h4>
                                <p className="text-sm leading-relaxed text-slate-300">
                                    นักบุญนิโคลัสตัวจริงผอมสูง! ภาพจำ "ลุงอ้วนชุดแดงใจดี" ที่เราเห็นปัจจุบัน ถูกสร้างและตอกย้ำโดยนักวาดการ์ตูน Thomas Nast และโฆษณาของ <strong>Coca-Cola</strong> ในช่วงทศวรรษ 1930
                                </p>
                            </div>

                             {/* Fact 5 */}
                             <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h4 className="font-bold text-lg text-purple-300 mb-2 flex items-center gap-2">
                                    <Coins size={20} /> 5. จากศาสนา สู่ปรากฏการณ์เศรษฐกิจ
                                </h4>
                                <p className="text-sm leading-relaxed text-slate-300">
                                    ปัจจุบันคริสต์มาสกลายเป็นช่วงเวลาสำคัญที่สุดของธุรกิจค้าปลีกทั่วโลก แม้แต่ในประเทศไทยที่ไม่ใช่วันหยุดราชการ การประดับไฟตามห้างฯ ก็กลายเป็นแลนด์มาร์คสำคัญทางวัฒนธรรมไปแล้ว
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer References */}
                <div className="p-4 bg-[#0B1026] border-t border-white/10 text-[10px] text-slate-500 flex justify-between items-center shrink-0">
                    <span className="uppercase tracking-widest font-bold">References / แหล่งอ้างอิง</span>
                    <div className="flex gap-4">
                        <a href="https://www.britannica.com/topic/Christmas" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                            Britannica <ExternalLink size={10} />
                        </a>
                        <a href="https://www.history.com/topics/christmas" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                            History.com <ExternalLink size={10} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
// ... (Rest of the file remains unchanged - App, ChevronForwardWrapper) ...
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
  
  // Track used words to prevent repetition
  const [usedWords, setUsedWords] = useState<string[]>([]);
  
  // Hint State
  const [isHintLoading, setIsHintLoading] = useState(false);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Audio State
  const [isMuted, setIsMuted] = useState(false);
  // Start with a random song
  const [bgmIndex, setBgmIndex] = useState(() => Math.floor(Math.random() * AUDIO_CONFIG.bgm.length));
  
  const bgmRef = useRef<HTMLAudioElement>(null);
  const sfxRef = useRef<HTMLAudioElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  const canAffordHint = gameState.timeLeft > HINT_PENALTY;
  const canSkip = gameState.skipsLeft > 0;

  // --- Audio Handlers ---
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  useEffect(() => {
    if (bgmRef.current) {
        bgmRef.current.muted = isMuted;
        bgmRef.current.volume = 0.3; // Lower volume for background
    }
    if (sfxRef.current) {
        sfxRef.current.muted = isMuted;
        sfxRef.current.volume = 0.8;
    }
  }, [isMuted]);

  useEffect(() => {
    // When bgmIndex changes, reload and play if we are not in menu (or if user interaction started)
    if (bgmRef.current && gameState.status !== 'menu') {
        bgmRef.current.load();
        bgmRef.current.play().catch(e => console.log("Autoplay blocked waiting for interaction"));
    }
  }, [bgmIndex, gameState.status]);

  const handleNextSong = () => {
    // Loop through the 3 songs (or however many are in the config)
    setBgmIndex(prev => (prev + 1) % AUDIO_CONFIG.bgm.length);
  };

  // --- Game Logic ---

  const prepareLevel = useCallback(async (isReset = false) => {
    setIsLoading(true);
    
    // Pass usedWords to generateQuestion to get a unique word
    const newQ = await generateQuestion(process.env.API_KEY, isReset ? [] : usedWords);
    
    // Check if we ran out of words (Game Complete)
    if (newQ === null) {
         setGameState(prev => ({ ...prev, status: 'completed' }));
         setIsLoading(false);
         if (sfxRef.current) {
            sfxRef.current.currentTime = 0;
            sfxRef.current.play().catch(e => console.log("SFX play failed"));
         }
         return;
    }

    setQuestion(newQ);
    
    // Update usedWords list
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
    // Attempt to start audio context
    if (bgmRef.current) {
        bgmRef.current.play().catch(e => console.log("Audio play failed", e));
    }
    // Clear used words when starting fresh
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
     setUsedWords([]); // Reset used words
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
        const randomIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
        setMaskedWord(prev => {
            const newMask = [...prev];
            newMask[randomIndex] = { ...newMask[randomIndex], isVisible: true };
            return newMask;
        });
    }

    // 2. Trigger Dynamic Santa Hint (Async)
    setIsHintLoading(true);

    // Apply penalty immediately
    setGameState(prev => ({
        ...prev,
        timeLeft: Math.max(0, prev.timeLeft - HINT_PENALTY)
    }));

    try {
        const dynamicHint = await generateSantaHint(process.env.API_KEY, question.answer, question.category);
        
        // Update question hint with "Santa's Hint"
        setQuestion(prev => prev ? ({ ...prev, hint: dynamicHint }) : null);

        // Play SFX if available
        if (sfxRef.current) {
             sfxRef.current.currentTime = 0;
             sfxRef.current.play().catch(e => console.log("SFX play failed"));
        }

    } catch (error) {
        console.error("Failed to generate hint", error);
    } finally {
        setIsHintLoading(false);
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
        // Victory! Play Santa SFX from Config
        if (sfxRef.current) {
            sfxRef.current.currentTime = 0;
            sfxRef.current.play().catch(e => console.log("SFX play failed"));
        }
        setGameState(prev => ({ ...prev, score: prev.score + 10, status: 'victory' }));
        setShowSantaPopup(true);
        setTimeout(() => setShowSantaPopup(false), 3000);
    } else if (rawInput.length === question.answer.length) {
        setIsWrongAnimation(true);
        setTimeout(() => setIsWrongAnimation(false), 500);
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger game hotkeys if chat is open or inputting text
      if (isChatOpen || showInfoModal) return;

      if (gameState.status === 'victory' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault(); 
        handleNextLevel();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [gameState.status, handleNextLevel, isChatOpen, showInfoModal]);

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
    if (gameState.status === 'playing' && !isChatOpen && !showInfoModal) {
        const interval = setInterval(() => {
            if (document.activeElement !== inputRef.current) {
                inputRef.current?.focus();
            }
        }, 1000);
        return () => clearInterval(interval);
    }
  }, [gameState.status, isChatOpen, showInfoModal]);


  return (
    <div className={`min-h-screen w-full font-sans overflow-hidden flex flex-col items-center relative select-none`}>
      
      {/* AUDIO ELEMENTS (Hidden) */}
      <audio ref={bgmRef} src={AUDIO_CONFIG.bgm[bgmIndex]} onEnded={handleNextSong} loop={false} />
      <audio ref={sfxRef} src={AUDIO_CONFIG.sfx.santa} />

      {/* BACKGROUND LAYERS */}
      <ScenicBackground />

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
      {isPlayingCutscene && <CutsceneOverlay onComplete={onCutsceneComplete} />}
      {showSantaPopup && !gameState.status.includes('completed') && <VictorySanta />}
      
      {/* Game Completed View */}
      {gameState.status === 'completed' && <GameCompletedView onBackToMenu={handleBackToMenu} />}

      {/* MAIN UI - Only show if NOT completed */}
      {gameState.status !== 'completed' && (
        <main className={`flex-grow flex flex-col items-center justify-center p-4 relative z-40 w-full max-w-4xl transition-all duration-500 ${isPlayingCutscene ? 'opacity-0' : 'opacity-100'} overflow-y-auto pb-20`}>
            
            {/* SCORE HEADER */}
            {(gameState.status === 'playing' || gameState.status === 'victory' || gameState.status === 'gameover') && (
                <div className="w-full flex justify-between items-center mb-6 px-4 z-50">
                    <div className="glass-card px-4 py-2 rounded-xl flex flex-col items-center transform -rotate-2 border-b-4 border-xmas-red">
                        <span className="text-xmas-gold text-xs uppercase font-bold tracking-wider">คะแนน</span>
                        <span className="text-3xl font-bold text-white drop-shadow-md">{gameState.score}</span>
                    </div>
                    
                    <div className="glass-card px-4 py-2 rounded-xl flex flex-col items-center transform rotate-2 border-b-4 border-xmas-green">
                        <span className="text-xmas-gold text-xs uppercase font-bold tracking-wider">ด่านที่</span>
                        <span className="text-3xl font-bold text-white drop-shadow-md">{gameState.currentLevel}</span>
                    </div>
                </div>
            )}

            {/* MENU CARD */}
            {gameState.status === 'menu' && !isLoading && !isPlayingCutscene && (
                <>
                <div className="relative glass-card p-8 md:p-12 rounded-3xl text-center max-w-md w-full mx-auto animate-float">
                    <h1 className="font-display text-6xl text-xmas-gold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mb-2">
                    Christmas
                    </h1>
                    <h2 className="text-3xl font-bold text-white mb-6 drop-shadow-md tracking-wide">
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

                {/* Christmas Info Trigger Button */}
                <div className="w-full max-w-md mx-auto mt-6 z-50">
                    <button 
                        onClick={() => setShowInfoModal(true)}
                        className="w-full glass-card p-4 rounded-2xl flex items-center justify-between text-left group hover:bg-white/10 transition-colors border border-xmas-gold/30 hover:border-xmas-gold shadow-lg"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-xmas-red/20 rounded-full border border-xmas-red/30">
                                <BookOpen size={24} className="text-xmas-gold" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm md:text-base">เกร็ดความรู้: วันคริสต์มาส</h3>
                                <p className="text-[10px] md:text-xs text-slate-300 group-hover:text-xmas-gold transition-colors">ประวัติ, ความหมาย และเรื่องที่คุณอาจไม่เคยรู้</p>
                            </div>
                        </div>
                        <ChevronForwardWrapper />
                    </button>
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
                    <span className="text-lg font-bold">
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
                <div className="w-full px-2 mb-2">
                    <LetterDisplay 
                        maskedWord={maskedWord} 
                        userInput={userInput} 
                        isWrong={isWrongAnimation} 
                        status={gameState.status}
                    />
                </div>

                {/* Hint */}
                <div className="glass-card px-6 py-4 rounded-2xl mb-6 mx-4 max-w-xl w-full text-center relative border-l-4 border-l-xmas-gold min-h-[5rem] flex items-center justify-center">
                    {isHintLoading ? (
                        <div className="flex gap-2 items-center text-white">
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></div>
                            <span className="text-sm ml-2">ซานต้ากำลังคิด...</span>
                        </div>
                    ) : (
                        <p className="text-xl md:text-2xl text-white font-medium drop-shadow-md animate-fade-in">
                            "{question.hint}"
                        </p>
                    )}
                </div>

                {/* Controls */}
                {gameState.status === 'playing' && (
                    <div className="flex gap-4">
                        <button
                            onClick={handleRequestHint}
                            disabled={!canAffordHint || isHintLoading}
                            className={`
                                px-5 py-3 rounded-xl font-bold text-sm md:text-base flex items-center gap-2 shadow-lg transition-all
                                ${canAffordHint && !isHintLoading
                                    ? 'bg-xmas-gold text-red-900 hover:brightness-110 active:scale-95' 
                                    : 'bg-slate-700/50 text-slate-400 cursor-not-allowed'}
                            `}
                        >
                            <Lightbulb size={18} /> ตัวช่วย (-{HINT_PENALTY}วิ)
                        </button>

                        <button
                            onClick={handleSkip}
                            disabled={!canSkip}
                            className={`
                                px-5 py-3 rounded-xl font-bold text-sm md:text-base flex items-center gap-2 shadow-lg transition-all
                                ${canSkip
                                    ? 'bg-white text-xmas-green hover:brightness-110 active:scale-95' 
                                    : 'bg-slate-700/50 text-slate-400 cursor-not-allowed'}
                            `}
                        >
                            <SkipForward size={18} /> ข้าม ({gameState.skipsLeft})
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
                    disabled={gameState.status !== 'playing' || isChatOpen || showInfoModal}
                />
                
                {gameState.status === 'playing' && !isChatOpen && !showInfoModal && (
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

      <footer className="w-full p-4 text-center text-white/20 text-[10px] z-50 font-bold fixed bottom-0 pointer-events-none">
        Christmas Word Hunt • Created with ❤️ & Google Gemini
      </footer>
    </div>
  );
}

// Helper component to avoid icon import conflict in the main component
const ChevronForwardWrapper = () => <ChevronUp className="rotate-90 text-white/50" />;