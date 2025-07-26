import React, { useState } from 'react';
import QuizCard from './QuizCard';
import { useQuizGenerator } from '../hooks/useQuizGenerator';
import { QUIZ_TYPES, QuizType, QuizQuestion, QuizAnswer, QuizResult } from '../types/Quiz';
import { GENERATIONS } from '../utils/generationUtils';

type QuizPhase = 'selection' | 'quiz' | 'results';

const PokemonQuiz: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<QuizPhase>('selection');
  const [selectedQuizType, setSelectedQuizType] = useState<QuizType>('names');
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(5);
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  const { generateQuizQuestions, isGenerating } = useQuizGenerator();

  const startQuiz = async () => {
    const generatedQuestions = await generateQuizQuestions(selectedQuizType, numberOfQuestions, selectedGeneration || undefined);
    if (generatedQuestions.length > 0) {
      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setSelectedAnswer('');
      setShowResult(false);
      setCurrentPhase('quiz');
      setQuestionStartTime(Date.now());
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const submitAnswer = () => {
    if (!selectedAnswer || !questions[currentQuestionIndex]) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      timeSpent
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setShowResult(true);

    // Auto-advance to next question after showing result
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer('');
        setShowResult(false);
        setQuestionStartTime(Date.now());
      } else {
        // Quiz finished
        setCurrentPhase('results');
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setCurrentPhase('selection');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer('');
    setShowResult(false);
    setSelectedGeneration(null);
  };

  const calculateResults = (): QuizResult => {
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const totalTime = answers.reduce((sum, a) => sum + a.timeSpent, 0);
    
    return {
      totalQuestions: questions.length,
      correctAnswers,
      incorrectAnswers: questions.length - correctAnswers,
      score: Math.round((correctAnswers / questions.length) * 100),
      totalTime,
      answers
    };
  };

  // Quiz Type Selection Phase
  if (currentPhase === 'selection') {
    return (
      <div className="p-5 max-w-4xl mx-auto">
        <h1 className="text-center mb-2.5 text-3xl font-bold text-gray-800 dark:text-white">
          Pokemon Quiz
        </h1>
        
        <p className="text-center mb-8 text-base text-gray-600 dark:text-gray-400">
          Test your Pokemon knowledge with different quiz types
        </p>

        <div className="max-w-2xl mx-auto">
          {/* Quiz Type Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">Choose Quiz Type</h2>
            <div className="grid gap-4">
              {QUIZ_TYPES.map((quizType) => (
                <button
                  key={quizType.id}
                  onClick={() => setSelectedQuizType(quizType.type)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedQuizType === quizType.type
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-gray-300 bg-white hover:border-green-300'
                  }`}
                >
                  <h3 className="font-bold text-lg">{quizType.label}</h3>
                  <p className="text-sm text-gray-600 mt-1">{quizType.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Number of Questions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">Number of Questions</h2>
            <div className="flex justify-center gap-4">
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => setNumberOfQuestions(num)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                    numberOfQuestions === num
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 bg-white hover:border-green-300'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Generation Filter */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">Generation Filter (Optional)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedGeneration(null)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                  selectedGeneration === null
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-gray-300 bg-white hover:border-green-300'
                }`}
              >
                <h4 className="font-bold text-sm">All Generations</h4>
                <p className="text-xs text-gray-600">No filter</p>
              </button>
              {GENERATIONS.map((gen) => (
                <button
                  key={gen.id}
                  onClick={() => setSelectedGeneration(gen.id)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedGeneration === gen.id
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-gray-300 bg-white hover:border-green-300'
                  }`}
                >
                  <h4 className="font-bold text-sm">{gen.region}</h4>
                  <p className="text-xs text-gray-600">{gen.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Start Quiz Button */}
          <div className="text-center">
            <button
              onClick={startQuiz}
              disabled={isGenerating}
              className="px-8 py-3 bg-green-500 text-white rounded-lg font-bold text-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isGenerating ? 'Generating Quiz...' : 'Start Quiz'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Phase
  if (currentPhase === 'quiz' && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div className="p-5 max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-500">
              Score: {answers.filter(a => a.isCorrect).length}/{answers.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Quiz Question */}
        <div className="text-center mb-8">
          <QuizCard pokemon={currentQuestion.pokemon} quizType={selectedQuizType} />
        </div>

        {/* Answer Options */}
        <div className="max-w-md mx-auto">
          <div className="grid gap-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showResult}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left font-medium ${
                  showResult
                    ? option === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-100 text-green-800'
                      : option === selectedAnswer
                        ? 'border-red-500 bg-red-100 text-red-800'
                        : 'border-gray-300 bg-gray-100 text-gray-500'
                    : selectedAnswer === option
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-gray-300 bg-white hover:border-green-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          {!showResult && (
            <div className="text-center">
              <button
                onClick={submitAnswer}
                disabled={!selectedAnswer}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Submit Answer
              </button>
            </div>
          )}

          {/* Result Feedback */}
          {showResult && (
            <div className="text-center">
              <div className={`text-lg font-bold mb-2 ${
                answers[answers.length - 1]?.isCorrect ? 'text-green-600' : 'text-red-600'
              }`}>
                {answers[answers.length - 1]?.isCorrect ? 'Correct!' : 'Incorrect!'}
              </div>
              <div className="text-gray-600">
                The correct answer is: <span className="font-bold">{currentQuestion.correctAnswer}</span>
              </div>
              {currentQuestionIndex < questions.length - 1 && (
                <div className="text-sm text-gray-500 mt-2">
                  Next question in 2 seconds...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Results Phase
  if (currentPhase === 'results') {
    const results = calculateResults();
    
    return (
      <div className="p-5 max-w-4xl mx-auto">
        <h1 className="text-center mb-6 text-3xl font-bold text-gray-800 dark:text-white">
          Quiz Results
        </h1>

        <div className="max-w-2xl mx-auto">
          {/* Score Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-center">
            <div className="text-6xl font-bold text-green-500 mb-2">
              {results.score}%
            </div>
            <div className="text-lg text-gray-700 mb-4">
              {results.correctAnswers} out of {results.totalQuestions} correct
            </div>
            <div className="text-sm text-gray-500">
              Total time: {Math.floor(results.totalTime / 60)}:{(results.totalTime % 60).toString().padStart(2, '0')}
            </div>
          </div>

          {/* Performance Message */}
          <div className="text-center mb-6">
            <div className="text-lg font-medium text-gray-700">
              {results.score >= 90 ? '🎉 Excellent! You\'re a Pokemon Master!' :
               results.score >= 70 ? '👍 Great job! You know your Pokemon well!' :
               results.score >= 50 ? '👌 Not bad! Keep practicing!' :
               '💪 Keep trying! You\'ll get better!'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={startQuiz}
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-200"
            >
              Try Again
            </button>
            <button
              onClick={resetQuiz}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PokemonQuiz;