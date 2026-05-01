import React, { useState } from 'react';
import { Mode } from '@/lib/types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';

interface GameProps {
  question: any;
  mode: Mode;
  level: number;
  onComplete: (isCorrect: boolean, answer: any) => void;
}

export const MultiplicationGame: React.FC<GameProps> = ({ question, mode, level, onComplete }) => {
  const { num1, num2 } = question.data;
  
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    const numericAns = parseInt(answer, 10);
    const correctAns = question.correctAnswer.answer;
    onComplete(numericAns === correctAns, { answer: numericAns });
  };

  return (
    <div className="w-full flex justify-center">
      <Card className="w-full max-w-3xl border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="text-4xl font-mono font-semibold text-slate-800 flex items-center justify-center gap-4">
             <span className="text-indigo-600">{num1}</span> 
             <span className="text-slate-300">×</span> 
             <span className="text-indigo-600">{num2}</span> 
             <span className="text-slate-300">=</span> 
             {mode === 'challenge' ? (
               <input 
                 type="number"
                 className="w-24 text-center bg-slate-50 border border-slate-200 rounded-xl py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 shadow-sm"
                 value={answer}
                 onChange={e => setAnswer(e.target.value)}
                 onKeyDown={e => {
                    if (e.key === 'Enter' && answer) handleSubmit()
                 }}
                 autoFocus
               />
             ) : (
               <span className="text-indigo-700 bg-indigo-50 px-5 py-2 rounded-lg border border-indigo-100">{question.correctAnswer.answer}</span>
             )}
          </div>
        </div>

        <div className="flex justify-center mb-8">
           <div className="bg-white shadow-sm p-6 rounded-xl inline-block border border-slate-200">
             <div 
               className="grid gap-3" 
               style={{ gridTemplateColumns: `repeat(${num1}, minmax(0, 1fr))` }}
             >
               {Array.from({ length: num1 * num2 }).map((_, i) => (
                 <motion.div 
                   key={i}
                   initial={{ scale: 0, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   transition={{ delay: i * 0.02 }}
                   className="w-8 h-8 rounded bg-indigo-50 border border-indigo-200 flex items-center justify-center shadow-sm"
                 >
                    <Star className="text-indigo-500 w-5 h-5 fill-indigo-100" />
                 </motion.div>
               ))}
             </div>
           </div>
        </div>

        <div className="flex justify-center">
           {mode === 'challenge' ? (
             <Button size="lg" variant="secondary" className="px-12" onClick={handleSubmit} disabled={!answer}>
               Submit Answer
             </Button>
           ) : (
             <div className="flex flex-col items-center gap-8">
               <div className="text-slate-600 text-center max-w-sm">
                 Observe the grid structure. There are <strong className="text-indigo-600">{num2}</strong> rows, with <strong className="text-indigo-600">{num1}</strong> units per row, resulting in exactly <strong className="text-indigo-700">{num1 * num2}</strong> units.
               </div>
               <Button size="lg" variant="secondary" onClick={() => onComplete(true, { answer: question.correctAnswer.answer })}>Continue</Button>
             </div>
           )}
        </div>
      </Card>
    </div>
  );
};
