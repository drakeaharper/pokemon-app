import { useState, useCallback } from 'react';
import { useAllPokemon } from './usePokemonQueries';
import { QuizQuestion, QuizType } from '../types/Quiz';
import { Pokemon } from '../types/Pokemon';

// Extract ID from PokeAPI URL
const extractIdFromUrl = (url: string): number => {
  const matches = url.match(/\/(\d+)\/$/);
  return matches ? parseInt(matches[1], 10) : 0;
};

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Format Pokemon name for display
const formatPokemonName = (name: string): string => {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const useQuizGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: allPokemonData } = useAllPokemon();

  const generateQuizQuestions = useCallback(async (
    type: QuizType,
    numberOfQuestions: number
  ): Promise<QuizQuestion[]> => {
    if (!allPokemonData?.results || type !== 'names') {
      return [];
    }

    setIsGenerating(true);

    try {
      // Get random Pokemon IDs for questions (limit to first 1000 for performance)
      const availablePokemon = allPokemonData.results.slice(0, 1000);
      const shuffledPokemon = shuffleArray(availablePokemon);
      const selectedPokemon = shuffledPokemon.slice(0, numberOfQuestions);

      const questions: QuizQuestion[] = [];

      for (const pokemonData of selectedPokemon) {
        const pokemonId = extractIdFromUrl(pokemonData.url);
        
        // Create a simplified Pokemon object for quiz purposes
        const pokemon: Pokemon = {
          id: pokemonId,
          name: pokemonData.name,
          height: 0,
          weight: 0,
          sprites: {
            front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
            front_shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemonId}.png`,
            other: {
              'official-artwork': {
                front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`,
                front_shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemonId}.png`
              }
            }
          },
          abilities: [],
          types: [],
          stats: []
        };

        // Generate wrong answers
        const wrongAnswers = shuffleArray(
          availablePokemon
            .filter(p => p.name !== pokemonData.name)
            .slice(0, 3)
        ).map(p => formatPokemonName(p.name));

        const correctAnswer = formatPokemonName(pokemonData.name);
        const allOptions = shuffleArray([correctAnswer, ...wrongAnswers]);

        questions.push({
          id: `question-${pokemonId}`,
          pokemon,
          correctAnswer,
          options: allOptions,
          type
        });
      }

      return questions;
    } finally {
      setIsGenerating(false);
    }
  }, [allPokemonData]);

  return {
    generateQuizQuestions,
    isGenerating
  };
};