import React, { useState, useEffect } from 'react';
import { Topic, Mode, DifficultyLevel, GameSessionData, GameSessionMetric, GameSessionResult } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { PlaceValueGame } from '../games/PlaceValueGame';
import { AdditionSubtractionGame } from '../games/AdditionSubtractionGame';
import { MultiplicationGame } from '../games/MultiplicationGame';
import { DivisionGame } from '../games/DivisionGame';
import { MeasurementGame } from '../games/MeasurementGame';
import { TimeGame } from '../games/TimeGame';
import { ScoreScreen } from './ScoreScreen';
import { ProfileAnalytics } from './ProfileAnalytics';
import { generateQuestion, calculateScore } from '@/lib/engine';
import { XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface TopicProgress {
  topicId: Topic;
  levelReached: number;
  timesPlayed: number;
  lastPlayed: number | null;
  totalScore: number;
  totalTimeSeconds: number;
  mistakesMade: number;
}
export type UserProgress = Record<Topic, TopicProgress>;

interface LayoutProps {
  children: React.ReactNode;
  xp?: number;
  sessionProps?: {
    active: boolean;
    onMenu: () => void;
    level: number;
    mode: Mode | null;
    topic: Topic | null;
  };
  onProfileClick?: () => void;
}

export const TOPIC_NAMES: Record<string, string> = {
  'place_value': 'Place Value',
  'addition_subtraction': 'Addition & Subtraction',
  'multiplication': 'Multiplication',
  'division': 'Division',
  'measurement': 'Measurement',
  'time': 'Time',
};

const Layout = ({ children, xp = 1250, sessionProps, onProfileClick }: LayoutProps) => {
  const pageTitle = sessionProps?.active && sessionProps.topic ? TOPIC_NAMES[sessionProps.topic] : 'MATHQUEST';

  return (
  <div className="bg-[#F8FAFC] min-h-screen flex flex-col text-[#0F172A] font-sans">
    <nav className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm z-20 relative">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl md:text-2xl font-black shadow-sm shrink-0">M</div>
        <h1 className="text-lg md:text-2xl font-bold text-slate-800 tracking-tight font-display whitespace-nowrap">
          {pageTitle}
        </h1>
        
        {sessionProps && sessionProps.active && (
          <div className="flex items-center gap-2 md:gap-4 ml-2 md:ml-8 border-l border-slate-200 pl-4 md:pl-8">
            <button 
               onClick={sessionProps.onMenu}
               className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
            >
               <span className="hidden md:inline text-xl leading-none">←</span>
               <span>Menu</span>
            </button>
            <div className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs md:text-sm font-semibold flex items-center ${sessionProps.mode === 'learn' ? 'bg-slate-100 text-slate-600' : 'bg-orange-100 text-orange-700'}`}>
              {sessionProps.mode === 'learn' ? 'Learn' : 'Challenge'}
            </div>
            <div className="text-sm md:text-base font-bold text-slate-700 whitespace-nowrap">
              Level <span className="text-indigo-600">{sessionProps.level}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-slate-200">
           <div className="text-lg leading-none">⭐</div>
           <motion.span 
              key={xp}
              initial={{ scale: 1.2, color: '#f59e0b' }} 
              animate={{ scale: 1, color: '#334155' }} 
              className="font-semibold text-slate-700 text-sm md:text-base"
           >
             {xp.toLocaleString()} XP
           </motion.span>
        </div>
        <button 
           onClick={onProfileClick}
           className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 shrink-0 shadow-sm flex items-center justify-center overflow-hidden transition-colors cursor-pointer group"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-indigo-300 group-hover:text-indigo-400 mt-2 transition-colors"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        </button>
      </div>
    </nav>
    <div className="flex-1 flex flex-col w-full h-[calc(100vh-5rem)] relative">
      {children}
    </div>
  </div>
  );
};

export const GameEngine: React.FC = () => {
  const [viewState, setViewState] = useState<'menu' | 'profile'>('menu');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [totalXP, setTotalXP] = useState<number>(0);
  
  const [sessionActive, setSessionActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [wrongFeedback, setWrongFeedback] = useState(false);
  const [scoreData, setScoreData] = useState<GameSessionData | null>(null);

  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem('mathquest_progress');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      'place_value': { topicId: 'place_value', levelReached: 1, timesPlayed: 0, lastPlayed: null, totalScore: 0, totalTimeSeconds: 0, mistakesMade: 0 },
      'addition_subtraction': { topicId: 'addition_subtraction', levelReached: 1, timesPlayed: 0, lastPlayed: null, totalScore: 0, totalTimeSeconds: 0, mistakesMade: 0 },
      'multiplication': { topicId: 'multiplication', levelReached: 1, timesPlayed: 0, lastPlayed: null, totalScore: 0, totalTimeSeconds: 0, mistakesMade: 0 },
      'division': { topicId: 'division', levelReached: 1, timesPlayed: 0, lastPlayed: null, totalScore: 0, totalTimeSeconds: 0, mistakesMade: 0 },
      'measurement': { topicId: 'measurement', levelReached: 1, timesPlayed: 0, lastPlayed: null, totalScore: 0, totalTimeSeconds: 0, mistakesMade: 0 },
      'time': { topicId: 'time', levelReached: 1, timesPlayed: 0, lastPlayed: null, totalScore: 0, totalTimeSeconds: 0, mistakesMade: 0 },
    };
  });

  useEffect(() => {
    localStorage.setItem('mathquest_progress', JSON.stringify(progress));
    const totalXP = Object.values(progress).reduce((acc, curr) => acc + curr.totalScore, 0);
    setTotalXP(totalXP);
  }, [progress]);

  const startSession = (t: Topic, m: Mode, l: DifficultyLevel) => {
    setTopic(t);
    setMode(m);
    setLevel(l);
    setViewState('menu');
    
    // Setup question
    const q = generateQuestion(t, l);
    setCurrentQuestion(q);
    setAttempts(0);
    setSessionStartTime(Date.now());
    setSessionActive(true);
    setScoreData(null);
    setWrongFeedback(false);
  };

  const handleLevelSelect = (t: Topic, m: Mode) => {
    startSession(t, m, progress[t].levelReached as DifficultyLevel);
  };

  const handleAnswerSubmit = (isCorrect: boolean, userAnswer: any) => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (isCorrect) {
      // Completed successfully
      const timeTaken = Math.floor((Date.now() - sessionStartTime) / 1000);
      const metrics = calculateScore(timeTaken, newAttempts, isCorrect, level);
      
      const result: GameSessionResult = {
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect
      };

      const sessionData: GameSessionData = {
        userId: 'student_xyz', // Mock user id
        simulationId: uuidv4(),
        topic: topic!,
        mode: mode!,
        level,
        question: currentQuestion.data,
        input: userAnswer,
        result,
        metrics,
        timestamp: new Date().toISOString()
      };

      console.log("GAME SESSION OUTCOME:", JSON.stringify(sessionData, null, 2));

      // Update progress
      setProgress(prev => {
        const t = topic!;
        const xpEarned = mode! === 'challenge' ? metrics.score : Math.floor(metrics.score * 0.2); // Learn mode gives less XP
        return {
          ...prev,
          [t]: {
            ...prev[t],
            timesPlayed: prev[t].timesPlayed + 1,
            lastPlayed: Date.now(),
            totalScore: prev[t].totalScore + xpEarned,
            totalTimeSeconds: (prev[t].totalTimeSeconds || 0) + timeTaken,
            levelReached: Math.max(prev[t].levelReached, level + (mode! === 'challenge' ? 1 : 0))
          }
        };
      });
      
      setScoreData(sessionData);
      setSessionActive(false);
    } else {
      // Wrong Answer! Provide visual feedback but do NOT skip the level.
      // They must solve it to progress (as requested by user).
      setProgress(prev => {
        const t = topic!;
        return {
          ...prev,
          [t]: {
            ...prev[t],
            totalScore: Math.max(0, prev[t].totalScore - 15), // penalize 15 XP
            mistakesMade: (prev[t].mistakesMade || 0) + 1
          }
        };
      });
      setWrongFeedback(true);
      setTimeout(() => setWrongFeedback(false), 2500);
    }
  };

  const nextLevel = () => {
    if (topic && mode) {
      startSession(topic, mode, Math.min(10, level + 1) as DifficultyLevel);
    }
  };

  if (scoreData) {
    return (
      <Layout xp={totalXP} sessionProps={{ active: true, onMenu: () => { setScoreData(null); setViewState('menu'); }, level: level, mode: mode, topic: topic }} onProfileClick={() => { setScoreData(null); setSessionActive(false); setViewState('profile'); }}>
        <div className="flex-1 overflow-y-auto">
          <ScoreScreen data={scoreData} onNext={nextLevel} onMenu={() => { setScoreData(null); setViewState('menu'); }} />
        </div>
      </Layout>
    );
  }

  if (sessionActive && currentQuestion) {
    const props = {
      question: currentQuestion,
      mode: mode!,
      level,
      onComplete: handleAnswerSubmit
    };
    
    // Minimal runtime log for sidebar
    const consoleJson = JSON.stringify({
       userId: "student_xyz",
       topic,
       mode,
       level,
       question: currentQuestion.data,
       attempts,
       timeTaken: Math.floor((Date.now() - sessionStartTime) / 1000) + 's'
    }, null, 2);

    return (
      <Layout xp={totalXP} sessionProps={{ active: true, onMenu: () => { setSessionActive(false); setViewState('menu'); }, level, mode, topic }} onProfileClick={() => { setSessionActive(false); setViewState('profile'); }}>
        <div className="w-full h-full flex flex-1 overflow-hidden relative">
          <AnimatePresence>
            {wrongFeedback && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-6 left-1/2 -translate-x-1/2 bg-rose-500 text-white px-6 py-3 rounded-full shadow-lg font-semibold z-50 flex items-center gap-2"
              >
                 <XCircle size={20} />
                 Not quite right. Try again!
              </motion.div>
            )}
          </AnimatePresence>
          
          <main className="flex-1 bg-[#F8FAFC] p-4 md:p-8 flex flex-col items-center overflow-y-auto w-full relative pt-12">
            <div className="flex-1 w-full flex items-center justify-center pb-16">
              <div className="w-full flex justify-center">
                {topic === 'place_value' && <PlaceValueGame {...props} />}
                {topic === 'addition_subtraction' && <AdditionSubtractionGame {...props} />}
                {topic === 'multiplication' && <MultiplicationGame {...props} />}
                {topic === 'division' && <DivisionGame {...props} />}
                {topic === 'measurement' && <MeasurementGame {...props} />}
                {topic === 'time' && <TimeGame {...props} />}
              </div>
            </div>
          </main>

          <aside className="w-80 bg-gray-900 text-green-400 p-6 font-mono text-[11px] shrink-0 overflow-y-auto leading-relaxed border-l-4 border-gray-800 hidden lg:block">
            <div className="mb-4 text-white opacity-50 uppercase tracking-widest text-[9px]">Real-time Simulation Data</div>
            <pre className="whitespace-pre-wrap">{consoleJson}</pre>
            
            <div className="mt-8">
               <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-white opacity-70">LOGGING EVENTS...</span>
               </div>
               <div className="text-[#1cb0f6]">&gt;&gt; Waiting for user input...</div>
            </div>
          </aside>
        </div>
      </Layout>
    );
  }

  // Main Menu
  const topics: { id: Topic, label: string, color: string, bg: string, bgGradient: string, icon: string, description: string }[] = [
    { id: 'place_value', label: 'Place Value', color: 'text-indigo-600', bg: 'bg-indigo-100', bgGradient: 'from-indigo-400 to-indigo-50', icon: '🔟', description: 'Understand numbers up to 1000.' },
    { id: 'addition_subtraction', label: 'Add & Subtract', color: 'text-rose-600', bg: 'bg-rose-100', bgGradient: 'from-rose-400 to-rose-50', icon: '➕', description: 'Combine totals and find differences.' },
    { id: 'multiplication', label: 'Multiplication', color: 'text-emerald-600', bg: 'bg-emerald-100', bgGradient: 'from-emerald-400 to-emerald-50', icon: '✖️', description: 'Learn about groups and arrays.' },
    { id: 'division', label: 'Division', color: 'text-amber-600', bg: 'bg-amber-100', bgGradient: 'from-amber-400 to-amber-50', icon: '➗', description: 'Distribute and share equally.' },
    { id: 'measurement', label: 'Measurement', color: 'text-cyan-600', bg: 'bg-cyan-100', bgGradient: 'from-cyan-400 to-cyan-50', icon: '📏', description: 'Explore length and scale.' },
    { id: 'time', label: 'Time', color: 'text-violet-600', bg: 'bg-violet-100', bgGradient: 'from-violet-400 to-violet-50', icon: '⏰', description: 'Read analog and digital clocks.' },
  ];

  return (
    <Layout xp={totalXP} onProfileClick={() => setViewState('profile')}>
      {viewState === 'profile' ? (
         <ProfileAnalytics progress={progress} totalXP={totalXP} onBack={() => setViewState('menu')} />
      ) : (
        <div className="w-full flex flex-col items-center p-4 md:p-6 overflow-y-auto flex-1">
          <div className="max-w-4xl w-full text-center mt-8 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4 font-display">
              Interactive Math Simulations
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Master Grade 3 foundational math concepts including arithmetic, measurement, and time through interactive, visual problem-solving environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full pb-16">
            {topics.map(t => (
              <div key={t.id} className="group relative bg-white rounded-2xl border border-slate-200 p-6 flex flex-col transition-all duration-300 hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 overflow-hidden">
                 <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${t.bgGradient} opacity-30 rounded-bl-full z-0 group-hover:scale-125 transition-transform duration-500 origin-top-right`} />
                 
                 <div className="relative z-10 flex flex-col h-full">
                   <div className={`w-14 h-14 rounded-xl ${t.bg} flex items-center justify-center text-3xl mb-5 shadow-sm border border-white/50 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                     {t.icon}
                   </div>

                   <h2 className="text-xl font-bold mb-2 text-slate-800">{t.label}</h2>
                   <p className="text-slate-500 mb-8 flex-1 leading-relaxed text-sm md:text-base">{t.description}</p>

                   <div className="flex gap-3 w-full mt-auto">
                      <button 
                        onClick={() => handleLevelSelect(t.id, 'learn')}
                        className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl py-2.5 font-semibold text-sm transition-all shadow-sm hover:shadow active:scale-[0.98]"
                      >
                        Learn
                      </button>
                      <button 
                        onClick={() => handleLevelSelect(t.id, 'challenge')}
                        className="flex-[1.5] bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 font-semibold text-sm shadow-md transition-all active:scale-[0.98]"
                      >
                        Challenge
                      </button>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};
