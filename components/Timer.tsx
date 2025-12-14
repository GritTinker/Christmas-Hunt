import React from 'react';

interface TimerProps {
  timeLeft: number;
  totalTime: number;
}

export const Timer: React.FC<TimerProps> = ({ timeLeft, totalTime }) => {
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = 45; // Fit inside the container
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (timeLeft / totalTime) * circumference;

  // Christmas Colors
  let strokeColor = "stroke-xmas-green";
  let textColor = "text-xmas-green";
  
  if (timeLeft / totalTime < 0.3) {
      strokeColor = "stroke-xmas-red";
      textColor = "text-xmas-red";
  } else if (timeLeft / totalTime < 0.6) {
      strokeColor = "stroke-xmas-gold";
      textColor = "text-yellow-600";
  }

  return (
    <div className="relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40">
      {/* Background Decor (Wreath-ish) - Centered absolutely */}
      <div className="absolute w-full h-full rounded-full border-4 border-white/30 bg-black/20 backdrop-blur-sm"></div>
      
      {/* SVG Container - Centered */}
      <div className="absolute inset-0 flex items-center justify-center p-1">
        <svg
          height="100%"
          width="100%"
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          className="transform -rotate-90 drop-shadow-md overflow-visible"
        >
          {/* Track Circle */}
          <circle
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress Circle */}
          <circle
            className={`${strokeColor} transition-all duration-1000 ease-linear`}
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
      </div>

      <div className={`absolute z-20 flex flex-col items-center justify-center`}>
        <div className={`text-4xl md:text-5xl font-bold ${textColor} drop-shadow-sm`}>
          {timeLeft}
        </div>
        <div className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">วินาที</div>
      </div>
      
      {/* Decorative Bow */}
      <div className="absolute -top-4 z-30 text-xmas-red drop-shadow-md filter drop-shadow-lg">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="transform rotate-12">
           <path d="M12 2C12 2 10 6 8 6C6 6 2 4 2 8C2 11 6 12 8 12C10 12 12 10 12 10C12 10 14 12 16 12C18 12 22 11 22 8C22 4 18 6 16 6C14 6 12 2 12 2Z" />
        </svg>
      </div>
    </div>
  );
};