import { v4 as uuidv4 } from 'uuid';
import { Topic, DifficultyLevel, QuestionData, GameSessionMetric } from './types';

// Utility to get random int between min and max (inclusive)
export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateQuestion = (topic: Topic, level: DifficultyLevel): QuestionData => {
  const id = uuidv4();
  
  if (topic === 'place_value') {
    // Level 1-3: 10s and 1s. Level 4-6: up to 100s. Level 7-10: up to 999.
    let maxNum = 99;
    if (level > 3) maxNum = 499;
    if (level > 6) maxNum = 999;
    
    let target = getRandomInt(10, maxNum);
    return {
      id,
      type: 'build_number',
      data: { target },
      correctAnswer: { number: target }
    };
  }
  
  if (topic === 'addition_subtraction') {
    const isAddition = Math.random() > 0.5;
    let max = level * 10;
    if (level > 3) max = level * 20;
    if (level > 6) max = level * 50;

    let num1 = getRandomInt(10, max);
    let num2 = getRandomInt(1, isAddition ? max : num1);

    if (!isAddition && num1 < num2) {
      // swap
      const temp = num1;
      num1 = num2;
      num2 = temp;
    }

    return {
      id,
      type: isAddition ? 'addition' : 'subtraction',
      data: { num1, num2 },
      correctAnswer: { answer: isAddition ? num1 + num2 : num1 - num2 }
    };
  }

  if (topic === 'multiplication') {
    let max = 5;
    if (level > 3) max = 9;
    if (level > 6) max = 12;

    const num1 = getRandomInt(2, max);
    const num2 = getRandomInt(2, max);

    return {
      id,
      type: 'multiplication',
      data: { num1, num2 },
      correctAnswer: { answer: num1 * num2 }
    };
  }

  if (topic === 'division') {
    let maxDivisor = 5;
    if (level > 3) maxDivisor = 9;
    if (level > 6) maxDivisor = 12;

    const divisor = getRandomInt(2, maxDivisor);
    const quotient = getRandomInt(2, maxDivisor);
    const dividend = divisor * quotient;

    return {
      id,
      type: 'division',
      data: { dividend, divisor },
      correctAnswer: { answer: quotient }
    };
  }

  if (topic === 'measurement') {
    // E.g. select the longer object or estimate length.
    const objects = ['Pencil', 'Eraser', 'Ruler', 'Book', 'Desk'];
    const lengths = [15, 5, 30, 25, 120]; // cm
    
    const idx1 = getRandomInt(0, objects.length - 1);
    let idx2 = getRandomInt(0, objects.length - 1);
    while (idx1 === idx2 || lengths[idx1] === lengths[idx2]) {
      idx2 = getRandomInt(0, objects.length - 1);
    }

    const askLonger = Math.random() > 0.5;
    const isFirstLarger = lengths[idx1] > lengths[idx2];
    const correctIdx = askLonger ? (isFirstLarger ? 0 : 1) : (isFirstLarger ? 1 : 0);

    return {
      id,
      type: 'compare_length',
      data: { 
        obj1: { name: objects[idx1], length: lengths[idx1] }, 
        obj2: { name: objects[idx2], length: lengths[idx2] },
        askMetric: askLonger ? 'longer' : 'shorter'
      },
      correctAnswer: { idx: correctIdx }
    };
  }

  if (topic === 'time') {
    let hour = getRandomInt(1, 12);
    let minute = 0; // level 1: o'clock
    
    if (level > 2) minute = getRandomInt(1, 3) * 15; // 15, 30, 45
    if (level > 5) minute = getRandomInt(1, 11) * 5; // 5 minute intervals
    if (level > 8) minute = getRandomInt(1, 59); // exact minutes
    
    return {
      id,
      type: 'read_clock',
      data: { hour, minute },
      correctAnswer: { hour, minute }
    };
  }

  return {
    id,
    type: 'unknown',
    data: {},
    correctAnswer: null,
  }
};

export const checkAnswer = (userAnswer: any, correctAnswer: any): boolean => {
  if (typeof userAnswer === 'object' && typeof correctAnswer === 'object') {
     // simple shallow compare for our needs
     for (const key in correctAnswer) {
       if (userAnswer[key] !== correctAnswer[key]) return false;
     }
     return true;
  }
  return userAnswer === correctAnswer;
};

export const calculateScore = (timeTaken: number, attempts: number, isCorrect: boolean, level: number): GameSessionMetric => {
  let accuracy = isCorrect ? (attempts === 1 ? 100 : Math.max(0, 100 - (attempts - 1) * 20)) : 0;
  
  // Time bonus: fast correct answer gives more points. Base time expected is ~30s for easy, 60s for hard.
  const expectedTime = 15 + (level * 5);
  let timeScore = 0;
  
  if (isCorrect) {
     if (timeTaken < expectedTime) {
         timeScore = Math.floor(((expectedTime - timeTaken) / expectedTime) * 50);
     }
  }

  const baseScore = isCorrect ? (level * 10) : 0;
  let totalScore = Math.floor((accuracy / 100) * baseScore) + timeScore;

  let stars: 1|2|3 = 1;
  if (isCorrect) {
    if (attempts === 1 && timeTaken <= expectedTime * 0.8) {
      stars = 3;
    } else if (attempts <= 2 && timeTaken <= expectedTime * 1.5) {
      stars = 2;
    }
  }

  if (!isCorrect) stars = 1;

  return {
    timeTaken,
    attempts,
    accuracy,
    score: totalScore,
    stars
  };
};
