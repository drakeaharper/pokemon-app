import React, { useState, useEffect, useRef } from 'react';
import { pokemonAI, generatePokemonContext } from '../services/pokemonAI';
import { usePokemon, usePokemonSpecies } from '../hooks/usePokemonQueries';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface PokemonAIChatProps {
  pokemonName?: string;
  className?: string;
}

const PokemonAIChat: React.FC<PokemonAIChatProps> = ({ pokemonName, className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Pokemon data for context (if a specific Pokemon is provided)
  const { data: pokemonData } = usePokemon(pokemonName || null);
  const { data: speciesData } = usePokemonSpecies(pokemonData?.id || null);
  
  // State for dynamically fetching Pokemon based on user questions
  const [contextPokemonName, setContextPokemonName] = useState<string | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const { data: contextPokemonData, isLoading: contextPokemonLoading, error: contextPokemonError } = usePokemon(contextPokemonName);
  const { data: contextSpeciesData } = usePokemonSpecies(contextPokemonData?.id || null);

  useEffect(() => {
    // Initialize the AI model
    const initializeModel = async () => {
      try {
        await pokemonAI.loadModel();
        setModelStatus('loaded');
        // Add welcome message
        setMessages([{
          id: '1',
          text: pokemonName 
            ? `Hi! I'm ready to answer questions about ${pokemonName}. What would you like to know?`
            : "Hi! I'm your Pokemon AI Assistant! Ask me about any Pokemon - their stats, abilities, types, evolutions, or anything else you'd like to know!",
          isUser: false,
          timestamp: new Date()
        }]);
      } catch (error) {
        console.error('Failed to load AI model:', error);
        setModelStatus('error');
        setMessages([{
          id: '1',
          text: "Sorry, I couldn't load the AI model. Please refresh the page to try again.",
          isUser: false,
          timestamp: new Date()
        }]);
      }
    };

    initializeModel();
  }, [pokemonName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle when Pokemon data becomes available
  useEffect(() => {
    if (contextPokemonData && pendingQuestion && !contextPokemonLoading) {
      console.log('Debug - Pokemon data loaded:', contextPokemonData.name);
      
      const { context } = generateContext(pendingQuestion);
      
      // Check if we now have actual Pokemon data (not just generic context)
      const hasSpecificData = context.includes(`is Pokemon #`) || 
                            context.includes(`meters tall`) || 
                            context.includes(`Base stats:`);
      
      console.log('Debug - useEffect hasSpecificData:', hasSpecificData);
      
      if (hasSpecificData) {
        pokemonAI.answerQuestion(pendingQuestion, context).then(answer => {
          const aiMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: answer,
            isUser: false,
            timestamp: new Date()
          };

          // Remove the waiting message and add the real response
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.text.includes('Let me look up')) {
              return [...prev.slice(0, -1), aiMessage];
            }
            return [...prev, aiMessage];
          });
          setIsLoading(false);
          setPendingQuestion(null);
        }).catch(error => {
          console.error('Error getting AI response:', error);
          const errorMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: `I'm having trouble finding information about ${contextPokemonName}. Error: ${error instanceof Error ? error.message : String(error)}`,
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.text.includes('Let me look up')) {
              return [...prev.slice(0, -1), errorMessage];
            }
            return [...prev, errorMessage];
          });
          setIsLoading(false);
          setPendingQuestion(null);
        });
      }
    }
  }, [contextPokemonData, contextPokemonLoading, pendingQuestion]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateContext = (question: string): { context: string, detectedPokemon: string | null } => {
    let context = '';
    let detectedPokemon: string | null = null;
    
    // Try to detect Pokemon number first (e.g., "#150", "150", "Pokemon 150", "what pokemon is 150")
    const pokemonNumberMatch = question.match(/(?:#|pokemon\s+|number\s+|is\s+)(\d{1,4})\b/i);
    if (pokemonNumberMatch) {
      const pokemonNumber = parseInt(pokemonNumberMatch[1]);
      if (pokemonNumber >= 1 && pokemonNumber <= 1025) {
        detectedPokemon = pokemonNumber.toString();
      }
    }
    
    // If no number found, try to detect Pokemon name using a more flexible approach
    if (!detectedPokemon) {
      // Common Pokemon patterns - this covers most well-known Pokemon
      const commonPokemonMatch = question.match(/\b(pikachu|charizard|bulbasaur|squirtle|charmander|mewtwo|mew|eevee|snorlax|gengar|dragonite|gyarados|lapras|ditto|lucario|garchomp|rayquaza|dialga|palkia|giratina|arceus|reshiram|zekrom|kyurem|xerneas|yveltal|zygarde|solgaleo|lunala|necrozma|zacian|zamazenta|eternatus|calyrex|koraidon|miraidon|treecko|grovyle|sceptile|torchic|combusken|blaziken|mudkip|marshtomp|swampert)\b/i);
      
      if (commonPokemonMatch) {
        detectedPokemon = commonPokemonMatch[1].toLowerCase();
      } else {
        // For less common Pokemon, try to extract any word that might be a Pokemon name
        // Look for all words that are 3+ characters and filter out common English words
        const words = question.match(/\b[A-Za-z][a-z]{2,}(?:-?[A-Za-z]?[a-z]*)*\b/g);
        if (words) {
          // Basic validation - avoid common English words
          const commonWords = ['pokemon', 'what', 'type', 'ability', 'stats', 'height', 'weight', 'about', 'tell', 'does', 'have', 'strong', 'weak', 'against', 'number', 'which', 'that', 'this', 'they', 'them', 'their', 'with', 'from', 'like', 'much', 'many', 'some', 'more', 'most', 'very', 'good', 'best', 'high', 'fast', 'slow', 'move', 'moves', 'attack', 'defense', 'special'];
          
          // Find the first word that's not a common English word
          for (const word of words) {
            const candidate = word.toLowerCase();
            if (!commonWords.includes(candidate) && candidate.length >= 3) {
              detectedPokemon = candidate;
              break;
            }
          }
        }
      }
    }
    
    // No mapping needed - API works with Pokemon names directly
    
    // Use context Pokemon data if available and matches the detected Pokemon
    if (contextPokemonData && (contextPokemonData.name === detectedPokemon || contextPokemonData.id.toString() === detectedPokemon)) {
      const pokemonContext = generatePokemonContext({ ...contextPokemonData, species: contextSpeciesData });
      context += pokemonContext + ' ';
      
      // Add basic move information if available
      if (contextPokemonData.moves && contextPokemonData.moves.length > 0) {
        const moveNames = contextPokemonData.moves.slice(0, 20).map(m => m.move.name).join(', ');
        context += `This Pokemon can learn moves including: ${moveNames}. `;
      }
      
      // Add basic ability information if available
      if (contextPokemonData.abilities && contextPokemonData.abilities.length > 0) {
        const abilityNames = contextPokemonData.abilities.map(a => a.ability.name).join(', ');
        context += `This Pokemon has abilities: ${abilityNames}. `;
      }
    }
    // Use provided Pokemon data if no Pokemon detected in question
    else if (pokemonData && !detectedPokemon) {
      const pokemonContext = generatePokemonContext({ ...pokemonData, species: speciesData });
      context += pokemonContext + ' ';
      
      // Add basic move information if available
      if (pokemonData.moves && pokemonData.moves.length > 0) {
        const moveNames = pokemonData.moves.slice(0, 20).map(m => m.move.name).join(', ');
        context += `This Pokemon can learn moves including: ${moveNames}. `;
      }
      
      // Add basic ability information if available
      if (pokemonData.abilities && pokemonData.abilities.length > 0) {
        const abilityNames = pokemonData.abilities.map(a => a.ability.name).join(', ');
        context += `This Pokemon has abilities: ${abilityNames}. `;
      }
    }
    
    // If no specific Pokemon context, provide general Pokemon knowledge
    if (!context.trim()) {
      context = `Pokemon are creatures with various types, abilities, and moves. They can be categorized by generations, 
                 have different stats like HP, Attack, Defense, Special Attack, Special Defense, and Speed. 
                 Pokemon can evolve and learn new moves as they level up. Popular Pokemon include Pikachu, Charizard, Mewtwo, and many others.`;
    }
    
    return { context: context.trim(), detectedPokemon };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || modelStatus !== 'loaded') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const question = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      const { context, detectedPokemon } = generateContext(question);
      
      console.log('Debug - detectedPokemon:', detectedPokemon);
      console.log('Debug - contextPokemonData:', contextPokemonData);
      console.log('Debug - contextPokemonError:', contextPokemonError);
      console.log('Debug - contextPokemonLoading:', contextPokemonLoading);
      
      // If we detected a Pokemon name/number but don't have its data, fetch it
      if (detectedPokemon && (!contextPokemonData || (contextPokemonData.name !== detectedPokemon && contextPokemonData.id.toString() !== detectedPokemon))) {
        // Set the context Pokemon name to trigger data fetching and store the question
        if (contextPokemonName !== detectedPokemon) {
          console.log('Debug - Setting contextPokemonName to:', detectedPokemon);
          setContextPokemonName(detectedPokemon);
          setPendingQuestion(question);
        }
        
        // Show loading message
        const waitMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Let me look up information about ${detectedPokemon}...`,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, waitMessage]);
        
        // Fallback timeout in case data never loads
        setTimeout(() => {
          if (isLoading && pendingQuestion === question) {
            const errorMessage: Message = {
              id: (Date.now() + 2).toString(),
              text: `I'm having trouble finding information about ${detectedPokemon}. Please make sure the Pokemon name is spelled correctly.`,
              isUser: false,
              timestamp: new Date()
            };
            setMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.text.includes('Let me look up')) {
                return [...prev.slice(0, -1), errorMessage];
              }
              return [...prev, errorMessage];
            });
            setIsLoading(false);
            setPendingQuestion(null);
          }
        }, 10000); // 10 second timeout
        
        return;
      }
      
      const answer = await pokemonAI.answerQuestion(question, context);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: answer,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error while processing your question. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (modelStatus === 'error') {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
        <p className="text-red-700 dark:text-red-300">
          Failed to load the AI model. Please refresh the page to try again.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-3 rounded-t-lg">
        <h3 className="font-semibold flex items-center gap-2">
          🤖 Pokemon AI Assistant
          {modelStatus === 'loading' && (
            <span className="text-xs bg-blue-400 px-2 py-1 rounded">Loading...</span>
          )}
          {modelStatus === 'loaded' && (
            <span className="text-xs bg-green-500 px-2 py-1 rounded">Ready</span>
          )}
        </h3>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                message.isUser
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <span>Thinking</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleInputKeyPress}
            placeholder={
              modelStatus === 'loading' 
                ? 'Loading AI model...' 
                : 'Ask me about any Pokemon! Try "What type is Pikachu?" or "Tell me about Charizard"'
            }
            disabled={modelStatus !== 'loaded' || isLoading}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading || modelStatus !== 'loaded'}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 
                     dark:disabled:bg-gray-600 text-white rounded-lg transition-colors
                     disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default PokemonAIChat;