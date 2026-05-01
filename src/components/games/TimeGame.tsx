import React, { useState } from 'react';
import { Mode } from '@/lib/types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface GameProps {
  question: any;
  mode: Mode;
  level: number;
  onComplete: (isCorrect: boolean, answer: any) => void;
}

export const TimeGame: React.FC<GameProps> = ({ question, mode, level, onComplete }) => {
  const { hour, minute } = question.data;
  const [ansHour, setAnsHour] = useState('');
  const [ansMinute, setAnsMinute] = useState('');

  const handleSubmit = () => {
    const h = parseInt(ansHour, 10);
    const m = parseInt(ansMinute, 10);
    
    // Normalize user 12 to 0 if needed, but standard time is 1-12
    const correctAns = question.correctAnswer;
    const isCorrect = (h === correctAns.hour) && (m === correctAns.minute);
    
    onComplete(isCorrect, { hour: h, minute: m });
  };

  // Calculate angles for clock hands
  const minuteAngle = minute * 6; // 360 / 60
  const hourAngle = (hour * 30) + (minute * 0.5); // 360 / 12 + partial hour

  return (
    <div className="w-full flex justify-center">
      <Card className="w-full max-w-xl p-8 border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">What time is it?</h2>
          <p className="text-slate-500">
            {mode === 'learn' ? 'Let\'s read the clock!' : 'Look at the clock carefully.'}
          </p>
        </div>

        <div className="flex justify-center mb-12">
           <div className="relative w-64 h-64 rounded-full border-[6px] border-slate-200 bg-white shadow-sm flex justify-center items-center">
             {/* Clock Face labels */}
             {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => {
                const angle = (num * 30 - 90) * (Math.PI / 180);
                const r = 85; // Brought slightly more inside
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                return (
                  <div 
                    key={num} 
                    className="absolute font-semibold text-slate-800 text-xl w-8 h-8 flex items-center justify-center font-display"
                    style={{ left: `calc(50% + ${x}px - 16px)`, top: `calc(50% + ${y}px - 16px)` }}
                  >
                    {num}
                  </div>
                )
             })}
             
             {/* Minute Ticks */}
             {[...Array(60)].map((_, i) => {
               const isHour = i % 5 === 0;
               const angle = (i * 6 - 90) * (Math.PI / 180);
               const rInner = isHour ? 104 : 108;
               const rOuter = 114;
               return (
                 <svg key={`tick-${i}`} className="absolute inset-0 w-full h-full pointer-events-none">
                   <line 
                     x1={128 + Math.cos(angle) * rInner} 
                     y1={128 + Math.sin(angle) * rInner} 
                     x2={128 + Math.cos(angle) * rOuter} 
                     y2={128 + Math.sin(angle) * rOuter} 
                     stroke={isHour ? "#64748b" : "#cbd5e1"} 
                     strokeWidth={isHour ? "3" : "2"} 
                     strokeLinecap="round"
                   />
                 </svg>
               );
             })}
             
             {/* Hour Hand */}
             <div 
               className="absolute bg-slate-800 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
               style={{ 
                 width: '8px',
                 height: '65px',
                 bottom: '50%',
                 left: 'calc(50% - 4px)',
                 transformOrigin: 'bottom center',
                 transform: `rotate(${hourAngle}deg)`
               }}
             >
                {/* Arrow pointer for Hour Hand */}
                <div className="absolute -top-1 left-0 w-full h-2 bg-slate-800 rounded-t-full"></div>
             </div>

             {/* Minute Hand */}
             <div 
               className="absolute bg-indigo-500 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
               style={{ 
                 width: '4px',
                 height: '95px',
                 bottom: '50%',
                 left: 'calc(50% - 2px)',
                 transformOrigin: 'bottom center',
                 transform: `rotate(${minuteAngle}deg)`
               }}
             >
                {/* Arrow pointer for Minute Hand */}
                <div className="absolute -top-1 left-0 w-full h-2 bg-indigo-500 rounded-t-full"></div>
             </div>

             {/* Center Dot */}
             <div className="absolute w-5 h-5 bg-white rounded-full border-[5px] border-slate-800 z-10 shadow-sm"></div>
           </div>
        </div>

        {mode === 'challenge' ? (
          <>
            <div className="flex justify-center items-center gap-4 mb-8">
               <input 
                 type="number"
                 value={ansHour}
                 onChange={e => setAnsHour(e.target.value)}
                 className="w-20 text-center text-3xl font-semibold bg-slate-50 border border-slate-200 rounded-xl py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900"
                 placeholder="HH"
                 max="12"
                 min="1"
               />
               <div className="text-3xl font-semibold text-slate-300">:</div>
               <input 
                 type="number"
                 value={ansMinute}
                 onChange={e => setAnsMinute(e.target.value)}
                 className="w-20 text-center text-3xl font-semibold bg-slate-50 border border-slate-200 rounded-xl py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900"
                 placeholder="MM"
                 max="59"
                 min="0"
               />
            </div>

            <div className="flex justify-center">
               <Button 
                 size="lg" 
                 variant="secondary"
                 onClick={handleSubmit}
                 disabled={!ansHour || !ansMinute}
               >
                 Submit Answer
               </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center">
              <div className="text-4xl font-mono font-semibold text-indigo-600 mb-6 bg-indigo-50 px-6 py-3 rounded-lg border border-indigo-100">
                {String(question.correctAnswer.hour).padStart(2, '0')}:{String(question.correctAnswer.minute).padStart(2, '0')}
              </div>
              <p className="text-slate-600 text-center mb-8 max-w-sm">
                The short hand is pointing near <strong className="text-slate-900">{hour}</strong> for hours.
                The long hand is pointing to the <strong className="text-indigo-600">{minute}</strong> minute mark!
              </p>
              <Button size="lg" variant="secondary" onClick={() => onComplete(true, { answer: question.correctAnswer })}>Continue</Button>
          </div>
        )}
      </Card>
    </div>
  );
};
