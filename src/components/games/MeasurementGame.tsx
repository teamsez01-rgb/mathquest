import React, { useState } from 'react';
import { Mode } from '@/lib/types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { motion } from 'motion/react';

interface GameProps {
  question: any;
  mode: Mode;
  level: number;
  onComplete: (isCorrect: boolean, answer: any) => void;
}

export const MeasurementGame: React.FC<GameProps> = ({ question, mode, level, onComplete }) => {
  const { obj1, obj2, askMetric } = question.data;
  const [selected, setSelected] = useState<number | null>(null);

  const handleSubmit = (idx: number) => {
    if (mode === 'learn') return;
    setSelected(idx);
    
    // Give brief visual feedback before moving on
    setTimeout(() => {
       const isCorrect = idx === question.correctAnswer.idx;
       onComplete(isCorrect, { idx });
    }, 600);
  };

  const getMaxScale = () => Math.max(obj1.length, obj2.length, 100);
  const getWidth = (length: number) => `${(length / getMaxScale()) * 100}%`;

  return (
    <div className="w-full flex justify-center">
      <Card className="w-full max-w-3xl border-slate-200 p-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Which object is <span className="text-indigo-600 underline decoration-indigo-200 decoration-4">{askMetric}</span>?
          </h2>
          <p className="text-slate-500">
            {mode === 'learn' ? 'Compare their relative measurements.' : 'Select the correct option based on length.'}
          </p>
        </div>

        <div className="flex flex-col gap-8">
           {[obj1, obj2].map((obj, idx) => {
              const isCorrectObj = idx === question.correctAnswer.idx;
              const isLearnSelected = mode === 'learn' && isCorrectObj;
              return (
                <motion.div
                  key={idx}
                  whileHover={mode === 'challenge' ? { scale: 1.01 } : {}}
                  whileTap={mode === 'challenge' ? { scale: 0.99 } : {}}
                  onClick={() => handleSubmit(idx)}
                  className={`relative bg-white rounded-xl p-6 border transition-all ${mode === 'challenge' ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md' : ''} ${
                    (selected === idx || isLearnSelected) ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-sm' : 'border-slate-200'
                  }`}
                >
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Object {idx + 1}</div>
                    <div className="text-lg font-bold text-slate-800">{obj.name}</div>
                  </div>

                  <div className="relative h-16 w-full flex items-center bg-slate-50 rounded-lg p-3 overflow-hidden border border-slate-200 shadow-inner mt-4">
                     {/* Ruler marks overlaid on bg */}
                     <div className="absolute top-0 bottom-0 left-0 right-0 py-1 flex justify-between px-4 pointer-events-none opacity-40">
                       {[...Array(11)].map((_, i) => (
                         <div key={i} className="flex flex-col items-center">
                            <div className="h-2 w-px bg-slate-400"></div>
                            {i % 2 === 0 && <span className="text-[10px] text-slate-400 mt-1 font-mono">{i * 10}</span>}
                         </div>
                       ))}
                     </div>
                     
                     {/* The measurement bar */}
                     <div 
                       className="h-8 bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-sm shadow-sm relative flex items-center transition-all duration-1000 ease-out z-10"
                       style={{ width: getWidth(obj.length), minWidth: '20px' }}
                     >
                       <div className="absolute -right-2 top-0 bottom-0 flex items-center">
                         <div className="w-1 h-full bg-indigo-900 rounded-full opacity-50"></div>
                       </div>
                       {mode === 'learn' && (
                         <div className="absolute right-3 text-white font-mono text-sm font-semibold whitespace-nowrap">
                           {obj.length} cm
                         </div>
                       )}
                     </div>
                  </div>
                  
                  {isLearnSelected && (
                    <div className="absolute top-6 right-6 bg-indigo-50 text-indigo-700 font-semibold px-3 py-1 rounded-full border border-indigo-100 text-sm">
                       {askMetric.toUpperCase()}
                    </div>
                  )}
                </motion.div>
              );
           })}
        </div>
        {mode === 'learn' && (
           <div className="mt-10 flex justify-center">
             <Button variant="secondary" size="lg" onClick={() => onComplete(true, { idx: question.correctAnswer.idx })}>
                Continue
             </Button>
           </div>
        )}
      </Card>
    </div>
  );
};
