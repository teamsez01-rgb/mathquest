import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowLeft, BarChart3, Clock, Trophy, Target, Gamepad2, BrainCircuit } from 'lucide-react';
import { Topic } from '@/lib/types';
import { UserProgress, TOPIC_NAMES } from './GameEngine';

interface ProfileAnalyticsProps {
  progress: UserProgress;
  totalXP: number;
  onBack: () => void;
}

export const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({ progress, totalXP, onBack }) => {
  const topicsList = Object.values(progress).filter(p => p.timesPlayed > 0).sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
  const totalSimulationsPlayed = Object.values(progress).reduce((acc, curr) => acc + curr.timesPlayed, 0);
  const totalTimePlayedSeconds = Object.values(progress).reduce((acc, curr) => acc + (curr.totalTimeSeconds || 0), 0);

  const formatTime = (seconds: number) => {
     if (seconds < 60) return `${seconds}s`;
     const m = Math.floor(seconds / 60);
     const s = seconds % 60;
     if (m < 60) return `${m}m ${s}s`;
     const h = Math.floor(m / 60);
     const remainingM = m % 60;
     return `${h}h ${remainingM}m`;
  };
  
  return (
    <div className="w-full flex flex-col items-center p-4 md:p-8 overflow-y-auto flex-1">
      <div className="max-w-4xl w-full flex items-center mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm"
        >
          <ArrowLeft size={18} />
          <span>Back to Menu</span>
        </button>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 flex flex-col items-center justify-center text-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <p className="text-indigo-100 font-medium uppercase tracking-wider text-sm mb-1">Total XP</p>
          <h2 className="text-4xl font-bold">{totalXP.toLocaleString()}</h2>
        </Card>

        <Card className="p-6 flex flex-col items-center justify-center text-center border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full z-0" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mb-3">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium text-sm mb-1">Total Sessions</p>
            <h2 className="text-3xl font-bold text-slate-800">{totalSimulationsPlayed}</h2>
          </div>
        </Card>

        <Card className="p-6 flex flex-col items-center justify-center text-center border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-50 rounded-full z-0" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-cyan-100 text-cyan-500 rounded-2xl flex items-center justify-center mb-3">
              <Clock className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium text-sm mb-1">Total Time Spent</p>
            <h2 className="text-3xl font-bold text-slate-800">{formatTime(totalTimePlayedSeconds)}</h2>
          </div>
        </Card>

        <Card className="p-6 flex flex-col items-center justify-center text-center border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full z-0" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center mb-3">
              <Target className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium text-sm mb-1">Topics Mastered</p>
            <h2 className="text-3xl font-bold text-slate-800">{topicsList.length} / 6</h2>
          </div>
        </Card>
      </div>

      <div className="max-w-4xl w-full">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BarChart3 className="text-indigo-500" />
          Simulation Progress & History
        </h3>
        
        {topicsList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 flex flex-col items-center">
            <BrainCircuit className="w-16 h-16 text-slate-200 mb-4" />
            <p className="text-lg">No simulations played yet!</p>
            <p className="text-sm">Head back to the menu and challenge yourself.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topicsList.map((topicProgress) => (
              <Card key={topicProgress.topicId} className="p-6 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-lg font-bold text-slate-800 border-b-2 border-indigo-100 pb-1">
                    {TOPIC_NAMES[topicProgress.topicId]}
                  </h4>
                  {topicProgress.lastPlayed && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                      <Clock size={12} />
                      {new Date(topicProgress.lastPlayed).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-600 font-medium text-sm">Highest Level Reached</span>
                    <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-md">Level {topicProgress.levelReached}</span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-600 font-medium text-sm">Total Sessions</span>
                    <span className="text-slate-800 font-bold">{topicProgress.timesPlayed}</span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-600 font-medium text-sm">Total Topic Score</span>
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      {topicProgress.totalScore.toLocaleString()} XP
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-600 font-medium text-sm">Total Time Spent</span>
                    <span className="text-slate-800 font-bold">{formatTime(topicProgress.totalTimeSeconds || 0)}</span>
                  </div>

                  <div className="flex justify-between items-center bg-rose-50/50 p-3 rounded-lg border border-rose-100/50">
                    <span className="text-rose-600 font-medium text-sm">Mistakes Made</span>
                    <span className="text-rose-700 font-bold">{topicProgress.mistakesMade || 0}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
