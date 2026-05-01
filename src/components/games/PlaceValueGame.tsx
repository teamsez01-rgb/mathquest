import React, { useState } from 'react';
import { Mode } from '@/lib/types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'motion/react';

interface GameProps {
  question: any;
  mode: Mode;
  level: number;
  onComplete: (isCorrect: boolean, answer: any) => void;
}

export const PlaceValueGame: React.FC<GameProps> = ({ question, mode, level, onComplete }) => {
  const target = question.data.target;
  const [hundreds, setHundreds] = useState(0);
  const [tens, setTens] = useState(0);
  const [ones, setOnes] = useState(0);

  const currentTotal = hundreds * 100 + tens * 10 + ones;

  const handleSubmit = () => {
    onComplete(currentTotal === target, { number: currentTotal });
  };

  const addBlock = (type: 'hundreds' | 'tens' | 'ones') => {
    if (type === 'hundreds') setHundreds(h => Math.min(9, h + 1));
    if (type === 'tens') setTens(t => Math.min(9, t + 1));
    if (type === 'ones') setOnes(o => Math.min(9, o + 1));
  };
  
  const removeBlock = (type: 'hundreds' | 'tens' | 'ones') => {
    if (type === 'hundreds') setHundreds(h => Math.max(0, h - 1));
    if (type === 'tens') setTens(t => Math.max(0, t - 1));
    if (type === 'ones') setOnes(o => Math.max(0, o - 1));
  };

  return (
    <div className="w-full flex justify-center">
      <Card className="w-full max-w-2xl border-blue-200 shadow-[0_8px_0_0_rgba(191,219,254,1)]">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Build the number:</h2>
          <div className="text-6xl font-black text-blue-500">{target}</div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Hundreds */}
          <div className="flex flex-col items-center">
            <h3 className="font-bold text-slate-500 mb-4">Hundreds</h3>
            <div className="h-48 w-full bg-blue-50 rounded-xl relative flex flex-col justify-end p-2 gap-1 overflow-hidden">
               <AnimatePresence>
                 {Array.from({ length: mode === 'learn' ? Math.floor(target / 100) : hundreds }).map((_, i) => (
                   <motion.div 
                     key={`h-${i}`}
                     initial={{ opacity: 0, y: -20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.5 }}
                     className="w-full bg-blue-500 h-4 rounded-sm"
                   />
                 ))}
               </AnimatePresence>
            </div>
            {mode === 'challenge' ? (
              <div className="flex gap-2 mt-4 mt-auto">
                <Button size="icon" variant="ghost" onClick={() => removeBlock('hundreds')}>-</Button>
                <div className="w-8 flex items-center justify-center font-bold text-xl">{hundreds}</div>
                <Button size="icon" variant="primary" onClick={() => addBlock('hundreds')}>+</Button>
              </div>
            ) : (
               <div className="mt-4 font-bold text-xl text-blue-500 flex items-center justify-center h-[48px]">{Math.floor(target/100)} × 100</div>
            )}
          </div>

          {/* Tens */}
          <div className="flex flex-col items-center">
            <h3 className="font-bold text-slate-500 mb-4">Tens</h3>
            <div className="h-48 w-12 bg-green-50 rounded-xl relative flex flex-col justify-end p-1 gap-1 overflow-hidden">
               <AnimatePresence>
                 {Array.from({ length: mode === 'learn' ? Math.floor((target % 100) / 10) : tens }).map((_, i) => (
                   <motion.div 
                     key={`t-${i}`}
                     initial={{ opacity: 0, y: -20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.5 }}
                     className="w-full bg-green-500 h-4 rounded-sm"
                   />
                 ))}
               </AnimatePresence>
            </div>
            {mode === 'challenge' ? (
              <div className="flex gap-2 mt-4">
                <Button size="icon" variant="ghost" onClick={() => removeBlock('tens')}>-</Button>
                <div className="w-8 flex items-center justify-center font-bold text-xl">{tens}</div>
                <Button size="icon" variant="success" onClick={() => addBlock('tens')}>+</Button>
              </div>
            ) : (
                <div className="mt-4 font-bold text-xl text-green-500 flex items-center justify-center h-[48px]">{Math.floor((target % 100) / 10)} × 10</div>
            )}
          </div>

          {/* Ones */}
          <div className="flex flex-col items-center">
            <h3 className="font-bold text-slate-500 mb-4">Ones</h3>
            <div className="h-48 w-24 rounded-xl relative flex flex-wrap content-end gap-1 p-2">
               <AnimatePresence>
                 {Array.from({ length: mode === 'learn' ? (target % 10) : ones }).map((_, i) => (
                   <motion.div 
                     key={`o-${i}`}
                     initial={{ opacity: 0, scale: 0 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.5 }}
                     className="w-4 h-4 bg-yellow-400 rounded-sm"
                   />
                 ))}
               </AnimatePresence>
            </div>
            {mode === 'challenge' ? (
              <div className="flex gap-2 mt-4">
                <Button size="icon" variant="ghost" onClick={() => removeBlock('ones')}>-</Button>
                <div className="w-8 flex items-center justify-center font-bold text-xl">{ones}</div>
                <Button size="icon" variant="primary" className="!bg-yellow-400 hover:!bg-yellow-500 !shadow-[0_4px_0_0_rgba(202,138,4,1)] text-white" onClick={() => addBlock('ones')}>+</Button>
              </div>
            ) : (
                <div className="mt-4 font-bold text-xl text-yellow-500 flex items-center justify-center h-[48px]">{(target % 10)} × 1</div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center border-t border-slate-100 pt-6">
           {mode === 'challenge' ? (
             <>
               <div className="text-xl font-bold text-slate-500">
                 Total: <span className="text-slate-800">{currentTotal}</span>
               </div>
               <Button size="lg" onClick={handleSubmit}>Submit Answer</Button>
             </>
           ) : (
             <div className="w-full flex justify-between items-center bg-blue-50 p-4 rounded-xl">
                 <div className="text-blue-800 font-medium">To build {target}, you need {Math.floor(target/100)} hundreds, {Math.floor((target % 100) / 10)} tens, and {target % 10} ones!</div>
                 <Button size="lg" onClick={() => onComplete(true, { number: target })}>Got it!</Button>
             </div>
           )}
        </div>
      </Card>
    </div>
  );
};
