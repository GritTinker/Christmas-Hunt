
import React from 'react';
import { MaskedChar } from '../types';

interface LetterDisplayProps {
  maskedWord: MaskedChar[];
  userInput: string;
  isWrong: boolean;
  status: string;
}

export const LetterDisplay: React.FC<LetterDisplayProps> = ({ maskedWord, userInput, isWrong, status }) => {
  return (
    <div className="flex flex-wrap justify-center gap-1 md:gap-4 my-4 md:my-6">
      {maskedWord.map((charData, index) => {
        
        const isUserTyped = index < userInput.length;
        const userChar = isUserTyped ? userInput[index] : '';
        
        let displayChar = '';
        if (isUserTyped) {
            displayChar = userChar;
        } else if (charData.isVisible) {
            displayChar = charData.char;
        }

        // Base Style: A Gift Box
        // Default: Green Box
        let bgColor = "bg-xmas-green"; 
        let borderColor = "border-b-2 md:border-b-4 border-xmas-darkGreen";
        let textColor = "text-white";
        let ribbonColor = "bg-xmas-red"; // The vertical ribbon

        // 1. Reveal (Hint) State: Gold Box
        if (charData.isVisible && !isUserTyped) {
          bgColor = "bg-xmas-gold"; 
          borderColor = "border-b-2 md:border-b-4 border-orange-600";
          textColor = "text-red-800";
          ribbonColor = "bg-white/50";
        } 
        // 2. User Input State: White/Red Box (Candy Caneish)
        else if (isUserTyped) {
           bgColor = "bg-white";
           borderColor = "border-b-2 md:border-b-4 border-slate-300";
           textColor = "text-xmas-red";
           ribbonColor = "bg-xmas-green/20";
           
           // Wrong letter on hint spot
           if (charData.isVisible && userChar !== charData.char) {
               bgColor = "bg-xmas-red";
               borderColor = "border-b-2 md:border-b-4 border-red-900";
               textColor = "text-white";
               ribbonColor = "bg-black/20";
           }
        }
        
        // Victory State
        if (status === 'victory') {
             bgColor = "bg-xmas-gold";
             borderColor = "border-yellow-600";
             textColor = "text-xmas-red";
             ribbonColor = "bg-white";
        }

        // Global Wrong Animation
        if (isWrong) {
            bgColor = "bg-xmas-red";
            borderColor = "border-red-900";
            textColor = "text-white";
        }

        return (
          <div
            key={index}
            className={`
              relative w-8 h-10 sm:w-10 sm:h-12 md:w-20 md:h-24
              flex items-center justify-center
              text-xl sm:text-2xl md:text-5xl font-bold
              rounded md:rounded-lg shadow-sm md:shadow-lg ${borderColor}
              transition-all duration-200
              ${bgColor} ${textColor}
              ${isWrong ? 'animate-shake' : ''}
              overflow-hidden
            `}
          >
            {/* Vertical Ribbon */}
            <div className={`absolute inset-y-0 left-1/2 w-1 md:w-4 -translate-x-1/2 ${ribbonColor} opacity-80 pointer-events-none`}></div>
            
            {/* Horizontal Ribbon (Visual only, thinner) */}
             <div className={`absolute inset-x-0 top-1/2 h-0.5 md:h-2 -translate-y-1/2 ${ribbonColor} opacity-60 pointer-events-none`}></div>

            {/* Character (z-index higher than ribbon) */}
            <span className="relative z-10 drop-shadow-sm leading-none pt-0.5 md:pt-1">{displayChar}</span>
          </div>
        );
      })}
    </div>
  );
};
