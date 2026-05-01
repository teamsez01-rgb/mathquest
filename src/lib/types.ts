export type Mode = 'learn' | 'challenge';

export type Topic = 
  | 'place_value'
  | 'addition_subtraction'
  | 'multiplication'
  | 'division'
  | 'measurement'
  | 'time';

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface GameSessionMetric {
  timeTaken: number; // in seconds
  attempts: number;
  accuracy: number; // 0 to 100
  score: number; // calculated score
  stars: 1 | 2 | 3;
}

export interface GameSessionResult {
  correctAnswer: any;
  isCorrect: boolean;
}

export interface GameSessionData {
  userId: string;
  simulationId: string;
  topic: Topic;
  mode: Mode;
  level: DifficultyLevel;
  question: any;
  input: any;
  result: GameSessionResult;
  metrics: GameSessionMetric;
  timestamp: string;
}

export interface QuestionData {
  id: string;
  type: string;
  data: any;
  correctAnswer: any;
}
