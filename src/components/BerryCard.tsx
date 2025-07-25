import React from 'react';
import { Berry } from '../types/Berry';

interface BerryCardProps {
  berry: Berry;
}

const BerryCard: React.FC<BerryCardProps> = ({ berry }) => {
  // Get the dominant flavor (highest potency)
  const dominantFlavor = berry.flavors.reduce((prev, current) => 
    (prev.potency > current.potency) ? prev : current
  );

  // Color mapping for berry flavors
  const flavorColors: { [key: string]: string } = {
    spicy: '#FF6B6B',
    dry: '#4ECDC4', 
    sweet: '#FFE66D',
    bitter: '#95E1D3',
    sour: '#A8E6CF'
  };

  const dominantColor = flavorColors[dominantFlavor?.flavor.name] || '#E8E8E8';

  // Format berry name for display
  const formatBerryName = (name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Get berry sprite URL
  const berryImageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${berry.item.name}.png`;

  return (
    <div className="max-w-sm mx-auto">
      <div 
        className="bg-white rounded-xl shadow-lg p-6 border-t-4 transition-transform hover:scale-105"
        style={{ borderTopColor: dominantColor }}
      >
        {/* Berry Image and Header */}
        <div className="text-center mb-4">
          <div className="flex justify-center mb-3">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center shadow-md"
              style={{ backgroundColor: `${dominantColor}20` }}
            >
              <img
                src={berryImageUrl}
                alt={`${berry.name} berry`}
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  // Fallback to a generic berry icon or hide image
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            {formatBerryName(berry.name)} Berry
          </h2>
          <p className="text-gray-600 text-sm">
            #{berry.id.toString().padStart(2, '0')}
          </p>
        </div>

        {/* Berry Properties */}
        <div className="space-y-3">
          {/* Dominant Flavor */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="font-semibold text-gray-700 mb-2">Primary Flavor</h3>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: dominantColor }}
              ></div>
              <span className="capitalize font-medium">{dominantFlavor?.flavor.name}</span>
              <span className="text-gray-600">({dominantFlavor?.potency} potency)</span>
            </div>
          </div>

          {/* All Flavors */}
          {berry.flavors.length > 1 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="font-semibold text-gray-700 mb-2">All Flavors</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {berry.flavors.map((flavor) => (
                  <div key={flavor.flavor.name} className="flex justify-between">
                    <span className="capitalize">{flavor.flavor.name}:</span>
                    <span className="font-medium">{flavor.potency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Growth Information */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="font-semibold text-gray-700 mb-2">Growth Info</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>Growth Time:</span>
                <span className="font-medium">{berry.growth_time}h</span>
              </div>
              <div className="flex justify-between">
                <span>Max Harvest:</span>
                <span className="font-medium">{berry.max_harvest}</span>
              </div>
              <div className="flex justify-between">
                <span>Size:</span>
                <span className="font-medium">{berry.size}mm</span>
              </div>
              <div className="flex justify-between">
                <span>Firmness:</span>
                <span className="font-medium capitalize">{berry.firmness.name}</span>
              </div>
            </div>
          </div>

          {/* Battle Properties */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="font-semibold text-gray-700 mb-2">Battle Properties</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>Natural Gift Power:</span>
                <span className="font-medium">{berry.natural_gift_power}</span>
              </div>
              <div className="flex justify-between">
                <span>Natural Gift Type:</span>
                <span className="font-medium capitalize">{berry.natural_gift_type.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Smoothness:</span>
                <span className="font-medium">{berry.smoothness}</span>
              </div>
              <div className="flex justify-between">
                <span>Soil Dryness:</span>
                <span className="font-medium">{berry.soil_dryness}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BerryCard;