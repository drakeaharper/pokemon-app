import { useState, useCallback } from 'react';
import { useAllPokemon } from './usePokemonQueries';
import { QuizQuestion, QuizType } from '../types/Quiz';
import { Pokemon } from '../types/Pokemon';
import { getPokemonIdsForGeneration } from '../utils/generationUtils';
import axios from 'axios';

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
    numberOfQuestions: number,
    generationFilter?: number
  ): Promise<QuizQuestion[]> => {
    if (!allPokemonData?.results) {
      return [];
    }

    setIsGenerating(true);

    try {
      // Apply generation filter if specified
      let availablePokemon = allPokemonData.results.slice(0, 1000); // limit for performance
      
      if (generationFilter) {
        const generationPokemonIds = new Set(getPokemonIdsForGeneration(generationFilter));
        availablePokemon = availablePokemon.filter(pokemon => {
          const pokemonId = extractIdFromUrl(pokemon.url);
          return generationPokemonIds.has(pokemonId);
        });
      }
      
      // Ensure we have enough Pokemon for the quiz
      if (availablePokemon.length < numberOfQuestions) {
        console.warn(`Not enough Pokemon in generation ${generationFilter} for ${numberOfQuestions} questions. Available: ${availablePokemon.length}`);
        // Fall back to using all available Pokemon in the generation
      }
      
      const shuffledPokemon = shuffleArray(availablePokemon);
      const selectedPokemon = shuffledPokemon.slice(0, Math.min(numberOfQuestions, availablePokemon.length));

      const questions: QuizQuestion[] = [];

      if (type === 'names') {
        // Names quiz - show Pokemon sprite, guess name
        for (const pokemonData of selectedPokemon) {
          const pokemonId = extractIdFromUrl(pokemonData.url);
          
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
            stats: [],
            base_experience: null,
            moves: []
          };

          const wrongAnswerOptions = availablePokemon.filter(p => p.name !== pokemonData.name);
          const shuffledWrongOptions = shuffleArray(wrongAnswerOptions);
          const wrongAnswers = shuffledWrongOptions
            .slice(0, 3)
            .map(p => formatPokemonName(p.name));

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
      } else if (type === 'abilities') {
        // Abilities quiz - show Pokemon sprite and name, guess ability
        for (const pokemonData of selectedPokemon) {
          const pokemonId = extractIdFromUrl(pokemonData.url);
          
          try {
            // Fetch full Pokemon data to get abilities
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
            const fullPokemonData = response.data;

            // Skip Pokemon with no abilities
            if (!fullPokemonData.abilities || fullPokemonData.abilities.length === 0) {
              continue;
            }

            // Pick a random ability from this Pokemon
            const randomAbility = fullPokemonData.abilities[Math.floor(Math.random() * fullPokemonData.abilities.length)];
            const correctAbility = formatPokemonName(randomAbility.ability.name);

            const pokemon: Pokemon = {
              id: pokemonId,
              name: pokemonData.name,
              height: fullPokemonData.height,
              weight: fullPokemonData.weight,
              sprites: fullPokemonData.sprites,
              abilities: fullPokemonData.abilities,
              types: fullPokemonData.types,
              stats: fullPokemonData.stats,
              base_experience: fullPokemonData.base_experience || null,
              moves: fullPokemonData.moves || []
            };

            // Generate wrong abilities from other Pokemon
            const wrongAbilities: string[] = [];
            let attempts = 0;
            const maxAttempts = 20;
            
            while (wrongAbilities.length < 3 && attempts < maxAttempts) {
              attempts++;
              const randomPokemonIndex = Math.floor(Math.random() * availablePokemon.length);
              const randomPokemonId = extractIdFromUrl(availablePokemon[randomPokemonIndex].url);
              
              try {
                const randomResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}`);
                const randomPokemonData = randomResponse.data;
                
                if (randomPokemonData.abilities && randomPokemonData.abilities.length > 0) {
                  const randomOtherAbility = randomPokemonData.abilities[Math.floor(Math.random() * randomPokemonData.abilities.length)];
                  const abilityName = formatPokemonName(randomOtherAbility.ability.name);
                  
                  // Make sure it's not the correct ability and not already added
                  if (abilityName !== correctAbility && !wrongAbilities.includes(abilityName)) {
                    wrongAbilities.push(abilityName);
                  }
                }
              } catch (error) {
                // Skip this Pokemon if there's an error
                continue;
              }
            }

            // If we couldn't get 3 wrong abilities, use some common ones as fallback
            const fallbackAbilities = ['Overgrow', 'Blaze', 'Torrent', 'Swarm', 'Keen Eye', 'Hyper Cutter', 'Intimidate', 'Static'];
            while (wrongAbilities.length < 3) {
              const fallback = fallbackAbilities[Math.floor(Math.random() * fallbackAbilities.length)];
              if (fallback !== correctAbility && !wrongAbilities.includes(fallback)) {
                wrongAbilities.push(fallback);
              }
            }

            const allOptions = shuffleArray([correctAbility, ...wrongAbilities.slice(0, 3)]);

            questions.push({
              id: `question-${pokemonId}`,
              pokemon,
              correctAnswer: correctAbility,
              options: allOptions,
              type
            });
          } catch (error) {
            // Skip this Pokemon if we can't fetch its data
            console.warn(`Failed to fetch data for Pokemon ID ${pokemonId}:`, error);
            continue;
          }
        }
      } else if (type === 'hidden-abilities') {
        // Hidden abilities quiz - show Pokemon sprite and name, guess hidden ability
        for (const pokemonData of selectedPokemon) {
          const pokemonId = extractIdFromUrl(pokemonData.url);
          
          try {
            // Fetch full Pokemon data to get abilities
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
            const fullPokemonData = response.data;

            // Find hidden ability (is_hidden: true)
            const hiddenAbility = fullPokemonData.abilities?.find((ability: any) => ability.is_hidden);
            
            // Skip Pokemon with no hidden abilities
            if (!hiddenAbility) {
              continue;
            }

            const correctAbility = formatPokemonName(hiddenAbility.ability.name);

            const pokemon: Pokemon = {
              id: pokemonId,
              name: pokemonData.name,
              height: fullPokemonData.height,
              weight: fullPokemonData.weight,
              sprites: fullPokemonData.sprites,
              abilities: fullPokemonData.abilities,
              types: fullPokemonData.types,
              stats: fullPokemonData.stats,
              base_experience: fullPokemonData.base_experience || null,
              moves: fullPokemonData.moves || []
            };

            // Generate wrong hidden abilities from other Pokemon
            const wrongAbilities: string[] = [];
            let attempts = 0;
            const maxAttempts = 30; // Increase attempts since hidden abilities are rarer
            
            while (wrongAbilities.length < 3 && attempts < maxAttempts) {
              attempts++;
              const randomPokemonIndex = Math.floor(Math.random() * availablePokemon.length);
              const randomPokemonId = extractIdFromUrl(availablePokemon[randomPokemonIndex].url);
              
              try {
                const randomResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}`);
                const randomPokemonData = randomResponse.data;
                
                // Find hidden ability from this random Pokemon
                const randomHiddenAbility = randomPokemonData.abilities?.find((ability: any) => ability.is_hidden);
                
                if (randomHiddenAbility) {
                  const abilityName = formatPokemonName(randomHiddenAbility.ability.name);
                  
                  // Make sure it's not the correct ability and not already added
                  if (abilityName !== correctAbility && !wrongAbilities.includes(abilityName)) {
                    wrongAbilities.push(abilityName);
                  }
                }
              } catch (error) {
                // Skip this Pokemon if there's an error
                continue;
              }
            }

            // If we couldn't get 3 wrong hidden abilities, use some common hidden abilities as fallback
            const fallbackHiddenAbilities = ['Chlorophyll', 'Solar Power', 'Drought', 'Speed Boost', 'Moody', 'Protean', 'Gale Wings', 'Pixilate'];
            while (wrongAbilities.length < 3) {
              const fallback = fallbackHiddenAbilities[Math.floor(Math.random() * fallbackHiddenAbilities.length)];
              if (fallback !== correctAbility && !wrongAbilities.includes(fallback)) {
                wrongAbilities.push(fallback);
              }
            }

            const allOptions = shuffleArray([correctAbility, ...wrongAbilities.slice(0, 3)]);

            questions.push({
              id: `question-${pokemonId}`,
              pokemon,
              correctAnswer: correctAbility,
              options: allOptions,
              type
            });
          } catch (error) {
            // Skip this Pokemon if we can't fetch its data
            console.warn(`Failed to fetch data for Pokemon ID ${pokemonId}:`, error);
            continue;
          }
        }
      } else if (type === 'types') {
        // Types quiz - show Pokemon sprite and name, guess types
        for (const pokemonData of selectedPokemon) {
          const pokemonId = extractIdFromUrl(pokemonData.url);
          
          try {
            // Fetch full Pokemon data to get types
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
            const fullPokemonData = response.data;

            // Skip Pokemon with no types (shouldn't happen)
            if (!fullPokemonData.types || fullPokemonData.types.length === 0) {
              continue;
            }

            // Format Pokemon types
            const pokemonTypes = fullPokemonData.types
              .map((typeObj: any) => formatPokemonName(typeObj.type.name))
              .sort(); // Sort alphabetically for consistency

            // Create correct answer string
            const correctAnswer = pokemonTypes.join('/');

            const pokemon: Pokemon = {
              id: pokemonId,
              name: pokemonData.name,
              height: fullPokemonData.height,
              weight: fullPokemonData.weight,
              sprites: fullPokemonData.sprites,
              abilities: fullPokemonData.abilities,
              types: fullPokemonData.types,
              stats: fullPokemonData.stats,
              base_experience: fullPokemonData.base_experience || null,
              moves: fullPokemonData.moves || []
            };

            // Generate wrong type combinations
            const allTypes = [
              'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 
              'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 
              'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
            ];

            const wrongAnswers: string[] = [];
            let attempts = 0;
            const maxAttempts = 50;

            while (wrongAnswers.length < 3 && attempts < maxAttempts) {
              attempts++;
              
              // Generate random type combination (1 or 2 types)
              const numTypes = Math.random() < 0.6 ? 1 : 2; // 60% single type, 40% dual type
              const randomTypes: string[] = [];
              
              // Pick random types
              const shuffledTypes = shuffleArray(allTypes);
              for (let i = 0; i < numTypes && i < shuffledTypes.length; i++) {
                randomTypes.push(shuffledTypes[i]);
              }
              
              const wrongAnswer = randomTypes.sort().join('/');
              
              // Make sure it's not the correct answer and not already added
              if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
                wrongAnswers.push(wrongAnswer);
              }
            }

            // If we still need more wrong answers, generate some specific ones
            if (wrongAnswers.length < 3) {
              const commonWrongCombos = [
                'Fire/Flying', 'Water/Ground', 'Electric/Flying', 'Grass/Poison',
                'Ice/Water', 'Fighting/Normal', 'Psychic/Fairy', 'Bug/Flying',
                'Rock/Ground', 'Ghost/Dark', 'Dragon/Flying', 'Steel/Rock',
                'Normal', 'Fire', 'Water', 'Electric', 'Grass'
              ];
              
              for (const combo of shuffleArray(commonWrongCombos)) {
                if (combo !== correctAnswer && !wrongAnswers.includes(combo) && wrongAnswers.length < 3) {
                  wrongAnswers.push(combo);
                }
              }
            }

            const allOptions = shuffleArray([correctAnswer, ...wrongAnswers.slice(0, 3)]);

            questions.push({
              id: `question-${pokemonId}`,
              pokemon,
              correctAnswer,
              options: allOptions,
              type
            });
          } catch (error) {
            // Skip this Pokemon if we can't fetch its data
            console.warn(`Failed to fetch data for Pokemon ID ${pokemonId}:`, error);
            continue;
          }
        }
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