import React, { useState } from 'react';
import { Mode } from '@/lib/types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { Database } from 'lucide-react';

interface GameProps {
  question: any;
  mode: Mode;
  level: number;
  onComplete: (isCorrect: boolean, answer: any) => void;
}

export const DivisionGame: React.FC<GameProps> = ({ question, mode, level, onComplete }) => {
  const { dividend, divisor } = question.data;
  
  const initialBaskets = mode === 'learn' 
    ? Array(divisor).fill(question.correctAnswer.answer)
    : Array(divisor).fill(0);

  const [baskets, setBaskets] = useState<number[]>(initialBaskets);
  const itemsInBaskets = baskets.reduce((sum, count) => sum + count, 0);
  const itemsRemaining = dividend - itemsInBaskets;

  const handleSubmit = () => {
    if (itemsRemaining > 0) return;
    const allEqual = baskets.every(b => b === baskets[0]);
    const isCorrect = allEqual && baskets[0] === question.correctAnswer.answer;
    onComplete(isCorrect, { answer: baskets[0] });
  };

  const addToBasket = (idx: number) => {
    if (mode === 'learn') return;
    if (itemsRemaining > 0) {
      const newBaskets = [...baskets];
      newBaskets[idx]++;
      setBaskets(newBaskets);
    }
  };

  const removeFromBasket = (idx: number) => {
    if (mode === 'learn') return;
    if (baskets[idx] > 0) {
      const newBaskets = [...baskets];
      newBaskets[idx]--;
      setBaskets(newBaskets);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <Card className="w-full max-w-4xl border-slate-200 p-8">
        <div className="text-center mb-10">
          <div className="text-4xl font-mono font-semibold text-slate-800 flex items-center justify-center gap-4">
             <span className="text-indigo-600">{dividend}</span> 
             <span className="text-slate-300">÷</span> 
             <span className="text-indigo-600">{divisor}</span> 
             <span className="text-slate-300">=</span> 
             <span className="text-indigo-700 bg-indigo-50 px-5 py-2 rounded-lg border border-indigo-100">
               {mode === 'learn' ? question.correctAnswer.answer : '?'}
             </span>
          </div>
          <p className="text-slate-500 mt-4">
             {mode === 'learn' 
               ? `Observe how ${dividend} data units divide equally into ${divisor} clusters.`
               : `Distribute the ${dividend} units equally into ${divisor} clusters.`}
          </p>
        </div>

        <div className="flex flex-col items-center gap-10 mb-8">
           {/* Pool of resources */}
           {mode === 'challenge' && (
             <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl min-w-[200px] flex flex-wrap max-w-2xl justify-center gap-2 items-center min-h-[100px]">
               <AnimatePresence>
                 {Array.from({ length: itemsRemaining }).map((_, i) => (
                    <motion.div
                      key={`pool-${i}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      layoutId={`unit-pool-${dividend - itemsRemaining + i}`}
                      className="w-6 h-6 bg-indigo-500 rounded shadow-sm border border-indigo-600"
                    />
                 ))}
               </AnimatePresence>
               {itemsRemaining === 0 && (
                  <div className="text-slate-400 font-medium">All units distributed.</div>
               )}
             </div>
           )}

           {/* Baskets (Clusters) */}
           <div className="flex flex-wrap justify-center gap-6 w-full">
              {baskets.map((count, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3">
                   <div 
                     className="bg-slate-50 border border-slate-200 rounded-xl p-4 w-32 min-h-[140px] relative flex flex-wrap content-end justify-center gap-1 cursor-pointer hover:bg-slate-100hover:border-indigo-300 transition-all group"
                     onClick={() => addToBasket(idx)}
                     onContextMenu={(e) => { e.preventDefault(); removeFromBasket(idx); }}
                   >
                     <Database className="absolute text-slate-200 w-full h-full opacity-30 -z-10 group-hover:text-indigo-100 transition-colors" />
                     {Array.from({ length: count }).map((_, i) => (
                        <motion.div
                          key={`b-${idx}-${i}`}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="w-5 h-5 bg-indigo-500 rounded-sm shadow-sm border border-indigo-600"
                        />
                     ))}
                   </div>
                   <div className="text-slate-600 font-mono font-semibold bg-white border border-slate-200 px-4 py-1 rounded-md text-sm shadow-sm">
                      {count}
                   </div>
                   {mode === 'challenge' && (
                     <div className="flex gap-2 w-full">
                        <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); removeFromBasket(idx); }}>-</Button>
                        <Button variant="outline" size="sm" className="flex-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={(e) => { e.stopPropagation(); addToBasket(idx); }}>+</Button>
                     </div>
                   )}
                </div>
              ))}
           </div>
        </div>

        <div className="flex justify-center mt-10 pt-8 border-t border-slate-100">
           {mode === 'challenge' ? (
             <Button 
               size="lg" 
               variant="secondary" 
               className="px-12" 
               onClick={handleSubmit} 
               disabled={itemsRemaining > 0}
             >
               Submit Answer
             </Button>
           ) : (
             <Button size="lg" variant="secondary" onClick={() => onComplete(true, { answer: question.correctAnswer.answer })}>
               Continue
             </Button>
           )}
        </div>
      </Card>
    </div>
  );
};
