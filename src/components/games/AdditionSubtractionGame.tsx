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

export const AdditionSubtractionGame: React.FC<GameProps> = ({ question, mode, level, onComplete }) => {
  const { num1, num2 } = question.data;
  const isAddition = question.type === 'addition';
  const symbol = isAddition ? '+' : '-';
  
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    const numericAns = parseInt(answer, 10);
    const correctAns = question.correctAnswer.answer;
    onComplete(numericAns === correctAns, { answer: numericAns });
  };

  return (
    <div className="w-full flex justify-center">
      <Card className="w-full max-w-md border-red-200 shadow-[0_8px_0_0_rgba(254,202,202,1)] p-8">
        <div className="flex flex-col items-end text-6xl font-black text-slate-800 font-mono space-y-4 mb-4 pr-8">
           <motion.div initial={{ x: -20, opacity: 0}} animate={{ x: 0, opacity: 1}}>{num1}</motion.div>
           <div className="flex w-full justify-between items-center border-b-8 border-slate-800 pb-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-red-500">{symbol}</motion.div>
              <motion.div initial={{ x: -20, opacity: 0}} animate={{ x: 0, opacity: 1}}>{num2}</motion.div>
           </div>
        </div>
        
        {mode === 'challenge' ? (
          <>
            <div className="flex justify-center mb-8">
              <input 
                type="number" 
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                className="w-full text-center text-5xl font-black font-mono bg-slate-100 rounded-2xl py-4 outline-none focus:ring-4 ring-red-200 text-slate-800"
                placeholder="?"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter' && answer) handleSubmit()
                }}
              />
            </div>

            <Button size="lg" variant="danger" className="w-full" onClick={handleSubmit} disabled={!answer}>
              Check Answer
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center">
             <div className="text-6xl font-black text-green-500 font-mono mb-8 pr-8 w-full text-right">
                {question.correctAnswer.answer}
             </div>
             <div className="w-full bg-slate-50 p-4 rounded-xl mb-4">
                <p className="text-slate-600 text-center font-medium">
                  {num1} {isAddition ? 'plus' : 'minus'} {num2} equals {question.correctAnswer.answer}. 
                  <br />
                  Line up the ones and tens!
                </p>
             </div>
             <Button size="lg" className="w-full" onClick={() => onComplete(true, { answer: question.correctAnswer.answer })}>Got it!</Button>
          </div>
        )}
      </Card>
    </div>
  );
};
