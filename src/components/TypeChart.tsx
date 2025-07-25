import React, { useMemo } from 'react';
import TypeEffectivenessGrid from './TypeEffectivenessGrid';
import { useAllMainTypes } from '../hooks/useTypeQueries';
import { buildTypeEffectivenessMatrix } from '../utils/typeEffectiveness';

const TypeChart: React.FC = () => {
  const { data: types, isLoading, error } = useAllMainTypes();

  const effectivenessMatrix = useMemo(() => {
    if (!types) return {};
    return buildTypeEffectivenessMatrix(types);
  }, [types]);

  if (isLoading) {
    return (
      <div style={{ 
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          Pokemon Type Effectiveness Chart
        </h1>
        <div style={{ 
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          minHeight: '200px'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #4CAF50',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Loading type effectiveness data...
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          Pokemon Type Effectiveness Chart
        </h1>
        <div style={{ 
          color: 'red',
          fontSize: '18px',
          marginBottom: '20px'
        }}>
          Error loading type effectiveness data. Please try again later.
        </div>
      </div>
    );
  }

  if (!types || Object.keys(effectivenessMatrix).length === 0) {
    return (
      <div style={{ 
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          Pokemon Type Effectiveness Chart
        </h1>
        <div style={{ fontSize: '18px' }}>
          No type data available.
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>
        Pokemon Type Effectiveness Chart
      </h1>
      
      <p style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        fontSize: '16px',
        color: '#666'
      }}>
        Interactive type matchup chart showing attack effectiveness
      </p>

      <div style={{ marginBottom: '20px' }}>
        <TypeEffectivenessGrid effectivenessMatrix={effectivenessMatrix} />
      </div>

      <div style={{ 
        textAlign: 'center',
        marginTop: '30px',
        fontSize: '14px',
        color: '#666'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <strong>How to read this chart:</strong>
        </div>
        <div style={{ marginBottom: '5px' }}>
          • Find the attacking type on the left (rows)
        </div>
        <div style={{ marginBottom: '5px' }}>
          • Find the defending type on the top (columns)
        </div>
        <div style={{ marginBottom: '5px' }}>
          • The intersection shows the damage multiplier
        </div>
        <div style={{ marginBottom: '15px' }}>
          • Click type headers to highlight, hover cells for details
        </div>
        
        <div style={{
          display: 'inline-block',
          backgroundColor: '#f9f9f9',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '13px'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Examples:</strong>
          </div>
          <div>Fire attacks Grass = 2x (Super Effective)</div>
          <div>Water attacks Fire = 2x (Super Effective)</div>
          <div>Normal attacks Ghost = 0x (No Effect)</div>
          <div>Fire attacks Water = ½x (Not Very Effective)</div>
        </div>
      </div>
    </div>
  );
};

export default TypeChart;