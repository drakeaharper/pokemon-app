import React from 'react';
import { EvolutionDisplay as EvolutionDisplayType, ProcessedEvolution } from '../types/Evolution';

interface EvolutionDisplayProps {
  evolutionData: EvolutionDisplayType;
}

const EvolutionCard: React.FC<{ 
  evolution: ProcessedEvolution; 
  isCurrent?: boolean;
  onClick?: () => void;
}> = ({ evolution, isCurrent = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        textAlign: 'center',
        padding: '10px',
        backgroundColor: isCurrent ? '#4CAF50' : '#fff',
        border: `2px solid ${isCurrent ? '#45a049' : '#ddd'}`,
        borderRadius: '10px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
        boxShadow: isCurrent ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'
      }}
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
        src={evolution.sprite}
        alt={evolution.name}
        style={{
          width: '80px',
          height: '80px',
          imageRendering: 'pixelated'
        }}
      />
      <p style={{
        margin: '5px 0',
        textTransform: 'capitalize',
        fontWeight: isCurrent ? 'bold' : 'normal',
        color: isCurrent ? '#fff' : '#333',
        fontSize: '14px'
      }}>
        {evolution.name}
      </p>
      <p style={{
        margin: '0',
        fontSize: '12px',
        color: isCurrent ? '#fff' : '#666'
      }}>
        #{evolution.id.toString().padStart(3, '0')}
      </p>
      {evolution.evolutionDetails && (
        <p style={{
          margin: '5px 0 0 0',
          fontSize: '10px',
          color: isCurrent ? '#e8f5e9' : '#999'
        }}>
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
      <span style={{
        fontSize: '24px',
        color: '#666',
        transform: isDown ? 'rotate(90deg)' : 'none'
      }}>
        →
      </span>
    </div>
  );
};

const EvolutionDisplay: React.FC<EvolutionDisplayProps> = ({ evolutionData }) => {
  const { previous, current, next } = evolutionData;

  const handleEvolutionClick = (pokemonId: number) => {
    // Update the input field and trigger search
    const input = document.querySelector('input[type="number"]') as HTMLInputElement;
    if (input) {
      input.value = pokemonId.toString();
      input.dispatchEvent(new Event('change', { bubbles: true }));
      const form = input.closest('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      }
    }
  };

  return (
    <div style={{
      margin: '30px 0',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '15px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Evolution Chain</h3>
      
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
            />
            {index < previous.length - 1 && <Arrow />}
          </React.Fragment>
        ))}
        
        {/* Arrow from previous to current */}
        {previous.length > 0 && <Arrow />}
        
        {/* Current Pokemon */}
        <EvolutionCard evolution={current} isCurrent={true} />
        
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
        <p style={{
          textAlign: 'center',
          marginTop: '15px',
          fontSize: '12px',
          color: '#666',
          fontStyle: 'italic'
        }}>
          This Pokemon has multiple evolution paths
        </p>
      )}
    </div>
  );
};

export default EvolutionDisplay;