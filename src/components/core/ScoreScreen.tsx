import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { GameSessionData } from '@/lib/types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface ScoreScreenProps {
  data: GameSessionData;
  onNext: () => void;
  onMenu: () => void;
}

export const ScoreScreen: React.FC<ScoreScreenProps> = ({ data, onNext, onMenu }) => {
  const isCorrect = data.result.isCorrect;

  useEffect(() => {
    if (isCorrect) {
      confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#818cf8', '#c084fc', '#2dd4bf', '#fbbf24']
      })
    }
  }, [isCorrect]);

  const getStarMessage = () => {
    if (data.metrics.stars === 3) return "Perfect! Fast and accurate on the first try.";
    if (data.metrics.stars === 2) return "Great job! Good accuracy and timing.";
    return "Well done! Keep practicing for improved speed and accuracy.";
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg text-center p-10 flex flex-col items-center">
        <motion.div 
           initial={{ scale: 0.8, opacity: 0 }} 
           animate={{ scale: 1, opacity: 1, rotate: isCorrect ? [0, -5, 5, -2, 2, 0] : 0 }}
           transition={{ duration: 0.4 }}
           className="mb-6"
        >
          <CheckCircle2 className="w-24 h-24 text-emerald-500 mx-auto" strokeWidth={1.5} />
        </motion.div>

        <h1 className="text-3xl font-bold mb-3 text-slate-900">
          Excellent Work!
        </h1>
        <p className="text-slate-500 mb-8 max-w-sm">
          You successfully solved the challenge and improved your skills.
        </p>

        {data.mode === 'challenge' && (
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="flex gap-3">
              {[1, 2, 3].map((star) => (
                <motion.div
                  key={star}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: star * 0.15, type: 'spring', bounce: 0.5 }}
                  className={`text-5xl ${star <= data.metrics.stars ? 'text-amber-400 drop-shadow-md' : 'text-slate-100'}`}
                >
                  ★
                </motion.div>
              ))}
            </div>
            <p className="text-sm font-medium text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full mb-6">
              {getStarMessage()}
            </p>
          </div>
        )}

        {data.mode === 'challenge' && (
          <div className="grid grid-cols-2 gap-4 w-full mb-10">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col items-center justify-center">
              <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase mb-2">Score</span>
              <span className="text-2xl font-bold text-slate-800 font-mono">+{data.metrics.score}</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col items-center justify-center">
              <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase mb-2">Time Taken</span>
              <span className="text-2xl font-bold text-slate-800 font-mono">{data.metrics.timeTaken}s</span>
            </div>
          </div>
        )}

        <div className="flex gap-4 w-full">
           <Button variant="outline" onClick={onMenu} className="flex-1 py-6">
             Main Menu
           </Button>
           <Button variant="secondary" onClick={onNext} className="flex-[2] py-6 text-base gap-2 bg-indigo-600 text-white hover:bg-indigo-700 border-none">
             <ArrowRight size={18} />
             Next Level
           </Button>
        </div>
      </Card>
    </div>
  );
};
