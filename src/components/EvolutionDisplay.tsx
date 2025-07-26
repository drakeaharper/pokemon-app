import React from 'react';
import { EvolutionDisplay as EvolutionDisplayType, ProcessedEvolution } from '../types/Evolution';

interface EvolutionDisplayProps {
  evolutionData: EvolutionDisplayType;
  onEvolutionClick?: (pokemonId: number) => void;
  isShiny?: boolean;
}

const EvolutionCard: React.FC<{ 
  evolution: ProcessedEvolution; 
  isCurrent?: boolean;
  onClick?: () => void;
  isShiny?: boolean;
}> = ({ evolution, isCurrent = false, onClick, isShiny = false }) => {
  return (
    <div
      onClick={onClick}
      className={`text-center p-2.5 rounded-lg transition-all duration-300 ${
        isCurrent 
          ? 'bg-green-500 border-2 border-green-600 scale-110 shadow-lg' 
          : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 shadow-md'
      } ${
        onClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'
      }`}
      onMouseEnter={(e) => {
        if (onClick && !isCurrent) {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick && !isCurrent) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }
      }}
    >
      <img
        src={isShiny && evolution.shinySprite ? evolution.shinySprite : evolution.sprite}
        alt={`${isShiny ? 'Shiny ' : ''}${evolution.name}`}
        style={{
          width: '80px',
          height: '80px',
          imageRendering: 'pixelated'
        }}
      />
      <p className={`my-1 capitalize text-sm ${
        isCurrent 
          ? 'font-bold text-white' 
          : 'font-normal text-gray-800 dark:text-gray-200'
      }`}>
        {evolution.name}
      </p>
      <p className={`m-0 text-xs ${
        isCurrent 
          ? 'text-white' 
          : 'text-gray-600 dark:text-gray-400'
      }`}>
        #{evolution.id.toString().padStart(3, '0')}
      </p>
      {evolution.evolutionDetails && (
        <p className={`mt-1 mb-0 text-xs ${
          isCurrent 
            ? 'text-green-100' 
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          {evolution.evolutionDetails.min_level && `Lv. ${evolution.evolutionDetails.min_level}`}
          {evolution.evolutionDetails.item && `Use ${evolution.evolutionDetails.item.name.replace('-', ' ')}`}
          {evolution.evolutionDetails.trigger === 'trade' && 'Trade'}
          {evolution.evolutionDetails.min_happiness && 'High Friendship'}
        </p>
      )}
    </div>
  );
};

const Arrow: React.FC<{ direction?: 'right' | 'down' }> = ({ direction = 'right' }) => {
  const isDown = direction === 'down';
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: isDown ? '10px auto' : '0 20px',
      width: isDown ? '40px' : '40px',
      height: isDown ? '30px' : 'auto'
    }}>
      <span className={`text-2xl text-gray-600 dark:text-gray-400 ${
        isDown ? 'rotate-90' : ''
      }`}>
        →
      </span>
    </div>
  );
};

const EvolutionDisplay: React.FC<EvolutionDisplayProps> = ({ evolutionData, onEvolutionClick, isShiny = false }) => {
  const { previous, current, next } = evolutionData;

  const handleEvolutionClick = (pokemonId: number) => {
    if (onEvolutionClick) {
      onEvolutionClick(pokemonId);
    }
  };


  return (
    <div className="my-8 p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg relative transition-colors duration-200">
      <h3 className="text-center mb-5 text-xl font-bold text-gray-800 dark:text-gray-200">Evolution Chain</h3>
      
      {/* Evolution Chain */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* Previous Evolutions */}
        {previous.map((evolution, index) => (
          <React.Fragment key={evolution.id}>
            <EvolutionCard 
              evolution={evolution} 
              onClick={() => handleEvolutionClick(evolution.id)}
              isShiny={isShiny}
            />
            {index < previous.length - 1 && <Arrow />}
          </React.Fragment>
        ))}
        
        {/* Arrow from previous to current */}
        {previous.length > 0 && <Arrow />}
        
        {/* Current Pokemon */}
        <EvolutionCard evolution={current} isCurrent={true} isShiny={isShiny} />
        
        {/* Next Evolutions */}
        {next.length > 0 && (
          <>
            {next.length === 1 ? (
              <>
                <Arrow />
                {next[0].map((evolution, index) => (
                  <React.Fragment key={evolution.id}>
                    {index > 0 && <Arrow />}
                    <EvolutionCard 
                      evolution={evolution}
                      onClick={() => handleEvolutionClick(evolution.id)}
                      isShiny={isShiny}
                    />
                  </React.Fragment>
                ))}
              </>
            ) : (
              <div style={{ marginLeft: '20px' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  {next.map((branch, branchIndex) => (
                    <div key={branchIndex} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      {branchIndex === 0 && <Arrow />}
                      {branchIndex > 0 && <div style={{ width: '60px' }}><Arrow /></div>}
                      {branch.map((evolution, index) => (
                        <React.Fragment key={evolution.id}>
                          {index > 0 && <Arrow />}
                          <EvolutionCard 
                            evolution={evolution}
                            onClick={() => handleEvolutionClick(evolution.id)}
                            isShiny={isShiny}
                          />
                        </React.Fragment>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {next.length > 1 && (
        <p className="text-center mt-4 text-xs text-gray-600 dark:text-gray-400 italic">
          This Pokemon has multiple evolution paths
        </p>
      )}
    </div>
  );
};

export default EvolutionDisplay;