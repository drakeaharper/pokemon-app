import { Pokemon } from './Pokemon';

export type QuizType = 'names' | 'types' | 'abilities' | 'hidden-abilities' | 'moves';

export interface QuizOption {
  id: string;
  label: string;
  description: string;
  type: QuizType;
}

export interface QuizQuestion {
  id: string;
  pokemon: Pokemon;
  correctAnswer: string;
  options: string[];
  type: QuizType;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number; // percentage
  totalTime: number; // in seconds
  answers: QuizAnswer[];
}

export interface QuizSettings {
  type: QuizType;
  numberOfQuestions: number;
  timeLimit?: number; // in seconds, optional
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizState {
  isActive: boolean;
  currentQuestionIndex: number;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  startTime: number;
  settings: QuizSettings;
}

// Available quiz types with their configurations
export const QUIZ_TYPES: QuizOption[] = [
  {
    id: 'names',
    label: 'Pokemon Names',
    description: 'Identify Pokemon by their appearance',
    type: 'names'
  },
  {
    id: 'abilities',
    label: 'Pokemon Abilities',
    description: 'Match Pokemon with their abilities',
    type: 'abilities'
  },
  {
    id: 'hidden-abilities',
    label: 'Hidden Abilities',
    description: 'Identify Pokemon hidden abilities',
    type: 'hidden-abilities'
  },
  // Future quiz types can be added here
  // {
  //   id: 'types',
  //   label: 'Pokemon Types',
  //   description: 'Guess the type of Pokemon',
  //   type: 'types'
  // }
];