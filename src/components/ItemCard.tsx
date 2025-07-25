import React from 'react';
import { Item } from '../types/Item';

interface ItemCardProps {
  item: Item;
}

// Category color mapping for visual distinction
const getCategoryColor = (categoryName: string): string => {
  const colors: { [key: string]: string } = {
    'pokeballs': '#ef4444', // red
    'medicine': '#10b981', // green
    'berries': '#f59e0b', // amber
    'evolution': '#8b5cf6', // violet
    'held-items': '#3b82f6', // blue
    'machines': '#6b7280', // gray
    'other': '#64748b', // slate
    'collectibles': '#ec4899', // pink
    'battle-items': '#dc2626', // red-600
    'key-items': '#7c3aed', // violet-600
  };
  
  // Try to match category name with our color mapping
  const lowerCategory = categoryName.toLowerCase().replace(/[^a-z]/g, '-');
  for (const key in colors) {
    if (lowerCategory.includes(key) || key.includes(lowerCategory)) {
      return colors[key];
    }
  }
  
  // Default color
  return colors.other;
};

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  // Get English name and description
  const englishName = item.names.find(name => name.language.name === 'en')?.name || item.name;
  const englishEffect = item.effect_entries.find(entry => entry.language.name === 'en');
  const englishFlavorText = item.flavor_text_entries.find(entry => entry.language.name === 'en');
  
  const categoryColor = getCategoryColor(item.category.name);
  const displayName = englishName.replace(/-/g, ' ');
  const categoryName = item.category.name.replace(/-/g, ' ');

  return (
    <div className="bg-white rounded-lg shadow-md p-5 transition-all duration-300 hover:shadow-lg hover:scale-105 border border-gray-200">
      {/* Header with name and ID */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-gray-800 capitalize">
            {displayName}
          </h3>
          <span className="text-sm text-gray-500">#{item.id}</span>
        </div>
        
        {/* Item sprite */}
        {item.sprites.default && (
          <div className="flex-shrink-0">
            <img 
              src={item.sprites.default} 
              alt={displayName}
              className="w-16 h-16 object-contain"
              onError={(e) => {
                // Hide image if it fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Category badge */}
      <div className="mb-3">
        <span 
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white capitalize"
          style={{ backgroundColor: categoryColor }}
        >
          {categoryName}
        </span>
      </div>

      {/* Cost */}
      {item.cost !== null && item.cost > 0 && (
        <div className="mb-3">
          <span className="text-sm font-medium text-gray-600">
            Cost: <span className="text-yellow-600 font-bold">₽{item.cost.toLocaleString()}</span>
          </span>
        </div>
      )}

      {/* Effect */}
      {englishEffect && (
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Effect:</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {englishEffect.short_effect || englishEffect.effect}
          </p>
        </div>
      )}

      {/* Flavor text */}
      {englishFlavorText && (
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Description:</h4>
          <p className="text-sm text-gray-600 italic leading-relaxed">
            "{englishFlavorText.text}"
          </p>
        </div>
      )}

      {/* Attributes */}
      {item.attributes && item.attributes.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Attributes:</h4>
          <div className="flex flex-wrap gap-1">
            {item.attributes.map((attribute, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs capitalize"
              >
                {attribute.name.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Fling power if applicable */}
      {item.fling_power && item.fling_power > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            Fling Power: <span className="font-semibold">{item.fling_power}</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default ItemCard;