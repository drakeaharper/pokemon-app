// Simple Pokemon AI service that doesn't require loading large models
class PokemonAI {
  private isLoaded = false;

  async loadModel(): Promise<void> {
    // Simulate model loading
    await new Promise(resolve => setTimeout(resolve, 500));
    this.isLoaded = true;
    console.log('Pokemon AI service initialized');
  }

  async answerQuestion(question: string, context: string): Promise<string> {
    if (!this.isLoaded) {
      await this.loadModel();
    }

    // Convert question to lowercase for easier matching
    const q = question.toLowerCase();
    
    // Extract Pokemon info from context
    const nameMatch = context.match(/^(\w+) is Pokemon #(\d+)/);
    const pokemonName = nameMatch ? nameMatch[1] : 'this Pokemon';
    
    // Extract stats
    const statsMatch = context.match(/Base stats: (.*?)\./);
    const stats: Record<string, number> = {};
    if (statsMatch) {
      const statPairs = statsMatch[1].split(', ');
      statPairs.forEach(pair => {
        const [stat, value] = pair.split(': ');
        stats[stat.toLowerCase().replace(/-/g, '')] = parseInt(value);
      });
    }
    
    // Extract types
    const typeMatch = context.match(/It is a (.*?) type Pokemon/);
    const types = typeMatch ? typeMatch[1].split(' and ') : [];
    
    // Extract abilities
    const abilityMatch = context.match(/abilities are: (.*?)\./);
    const abilities = abilityMatch ? abilityMatch[1].split(', ') : [];
    
    // Extract height and weight
    const heightMatch = context.match(/It is ([\d.]+) meters tall/);
    const weightMatch = context.match(/weighs ([\d.]+) kg/);
    const height = heightMatch ? heightMatch[1] : null;
    const weight = weightMatch ? weightMatch[1] : null;

    // Answer different types of questions
    if (q.includes('number') && (q.includes('what') || q.includes('which'))) {
      const numberMatch = context.match(/^(\w+) is Pokemon #(\d+)/);
      if (numberMatch) {
        const pokemonNumber = numberMatch[2];
        return `${pokemonName} is Pokemon #${pokemonNumber}.`;
      }
      return `I don't have the Pokedex number for ${pokemonName}.`;
    }
    
    if (q.includes('type') && (q.includes('what') || q.includes('which'))) {
      if (types.length > 0) {
        return `${pokemonName} is ${types.length > 1 ? 'a dual' : 'a'} ${types.join('/')} type Pokemon.`;
      }
      return `I don't have type information for ${pokemonName}.`;
    }
    
    if (q.includes('ability') || q.includes('abilities')) {
      if (abilities.length > 0) {
        return `${pokemonName} has the following abilities: ${abilities.join(', ')}.`;
      }
      return `I don't have ability information for ${pokemonName}.`;
    }
    
    if (q.includes('stat') || q.includes('hp') || q.includes('attack') || q.includes('defense') || q.includes('speed')) {
      const statResponses = [];
      
      if (q.includes('hp') && stats['hp']) {
        statResponses.push(`HP: ${stats['hp']}`);
      }
      if (q.includes('attack') && stats['attack']) {
        statResponses.push(`Attack: ${stats['attack']}`);
      }
      if (q.includes('defense') && stats['defense']) {
        statResponses.push(`Defense: ${stats['defense']}`);
      }
      if (q.includes('special attack') && stats['special attack']) {
        statResponses.push(`Special Attack: ${stats['special attack']}`);
      }
      if (q.includes('special defense') && stats['special defense']) {
        statResponses.push(`Special Defense: ${stats['special defense']}`);
      }
      if (q.includes('speed') && stats['speed']) {
        statResponses.push(`Speed: ${stats['speed']}`);
      }
      
      if (q.includes('highest') || q.includes('best')) {
        const highestStat = Object.entries(stats).reduce((a, b) => a[1] > b[1] ? a : b);
        return `${pokemonName}'s highest stat is ${highestStat[0]} with a value of ${highestStat[1]}.`;
      }
      
      if (q.includes('lowest') || q.includes('worst')) {
        const lowestStat = Object.entries(stats).reduce((a, b) => a[1] < b[1] ? a : b);
        return `${pokemonName}'s lowest stat is ${lowestStat[0]} with a value of ${lowestStat[1]}.`;
      }
      
      if (statResponses.length > 0) {
        return `${pokemonName}'s ${statResponses.join(', ')}.`;
      }
      
      if (Object.keys(stats).length > 0) {
        const allStats = Object.entries(stats).map(([stat, value]) => `${stat}: ${value}`).join(', ');
        return `${pokemonName}'s base stats are: ${allStats}.`;
      }
    }
    
    if (q.includes('height') || q.includes('tall')) {
      if (height) {
        return `${pokemonName} is ${height} meters tall.`;
      }
      return `I don't have height information for ${pokemonName}.`;
    }
    
    if (q.includes('weight') || q.includes('heavy')) {
      if (weight) {
        return `${pokemonName} weighs ${weight} kg.`;
      }
      return `I don't have weight information for ${pokemonName}.`;
    }
    
    if (q.includes('strong against') || q.includes('effective against')) {
      const typeEffectiveness = this.getTypeEffectiveness(types);
      if (typeEffectiveness.strongAgainst.length > 0) {
        return `${pokemonName} is strong against ${typeEffectiveness.strongAgainst.join(', ')} type Pokemon.`;
      }
      return `${pokemonName}'s type effectiveness depends on its moves.`;
    }
    
    if (q.includes('weak against') || q.includes('weak to')) {
      const typeEffectiveness = this.getTypeEffectiveness(types);
      if (typeEffectiveness.weakTo.length > 0) {
        return `${pokemonName} is weak to ${typeEffectiveness.weakTo.join(', ')} type attacks.`;
      }
      return `${pokemonName} doesn't have any particular type weaknesses.`;
    }
    
    if (q.includes('evolve') || q.includes('evolution')) {
      const evolutionInfo = context.match(/Description: (.*evolution.*)/i);
      if (evolutionInfo) {
        return evolutionInfo[1];
      }
      return `I don't have specific evolution information for ${pokemonName}. Check the evolution chain section for details.`;
    }
    
    if (q.includes('description') || q.includes('about') || q.includes('tell me')) {
      const descriptionMatch = context.match(/Description: (.*?)$/);
      if (descriptionMatch) {
        return descriptionMatch[1];
      }
      return this.generateGeneralDescription(pokemonName, types, stats, abilities);
    }
    
    // Default response with available information
    return this.generateGeneralDescription(pokemonName, types, stats, abilities);
  }

  private generateGeneralDescription(name: string, types: string[], stats: Record<string, number>, abilities: string[]): string {
    let description = `${name} is`;
    
    if (types.length > 0) {
      description += ` a ${types.join('/')} type Pokemon`;
    }
    
    if (abilities.length > 0) {
      description += ` with ${abilities.length > 1 ? 'abilities' : 'the ability'} ${abilities.join(' and ')}`;
    }
    
    if (Object.keys(stats).length > 0) {
      const totalStats = Object.values(stats).reduce((a, b) => a + b, 0);
      description += `. It has a total base stat of ${totalStats}`;
      
      const highestStat = Object.entries(stats).reduce((a, b) => a[1] > b[1] ? a : b);
      description += `, with ${highestStat[0]} being its strongest stat at ${highestStat[1]}`;
    }
    
    description += '.';
    return description;
  }

  private getTypeEffectiveness(types: string[]): { strongAgainst: string[], weakTo: string[] } {
    const effectiveness: Record<string, { strongAgainst: string[], weakTo: string[] }> = {
      normal: { strongAgainst: [], weakTo: ['fighting'] },
      fire: { strongAgainst: ['grass', 'ice', 'bug', 'steel'], weakTo: ['water', 'ground', 'rock'] },
      water: { strongAgainst: ['fire', 'ground', 'rock'], weakTo: ['electric', 'grass'] },
      electric: { strongAgainst: ['water', 'flying'], weakTo: ['ground'] },
      grass: { strongAgainst: ['water', 'ground', 'rock'], weakTo: ['fire', 'ice', 'poison', 'flying', 'bug'] },
      ice: { strongAgainst: ['grass', 'ground', 'flying', 'dragon'], weakTo: ['fire', 'fighting', 'rock', 'steel'] },
      fighting: { strongAgainst: ['normal', 'ice', 'rock', 'dark', 'steel'], weakTo: ['flying', 'psychic', 'fairy'] },
      poison: { strongAgainst: ['grass', 'fairy'], weakTo: ['ground', 'psychic'] },
      ground: { strongAgainst: ['fire', 'electric', 'poison', 'rock', 'steel'], weakTo: ['water', 'grass', 'ice'] },
      flying: { strongAgainst: ['grass', 'fighting', 'bug'], weakTo: ['electric', 'ice', 'rock'] },
      psychic: { strongAgainst: ['fighting', 'poison'], weakTo: ['bug', 'ghost', 'dark'] },
      bug: { strongAgainst: ['grass', 'psychic', 'dark'], weakTo: ['fire', 'flying', 'rock'] },
      rock: { strongAgainst: ['fire', 'ice', 'flying', 'bug'], weakTo: ['water', 'grass', 'fighting', 'ground', 'steel'] },
      ghost: { strongAgainst: ['psychic', 'ghost'], weakTo: ['ghost', 'dark'] },
      dragon: { strongAgainst: ['dragon'], weakTo: ['ice', 'dragon', 'fairy'] },
      dark: { strongAgainst: ['psychic', 'ghost'], weakTo: ['fighting', 'bug', 'fairy'] },
      steel: { strongAgainst: ['ice', 'rock', 'fairy'], weakTo: ['fire', 'fighting', 'ground'] },
      fairy: { strongAgainst: ['fighting', 'dragon', 'dark'], weakTo: ['poison', 'steel'] }
    };
    
    const result = { strongAgainst: new Set<string>(), weakTo: new Set<string>() };
    
    types.forEach(type => {
      const typeData = effectiveness[type.toLowerCase()];
      if (typeData) {
        typeData.strongAgainst.forEach(t => result.strongAgainst.add(t));
        typeData.weakTo.forEach(t => result.weakTo.add(t));
      }
    });
    
    return {
      strongAgainst: Array.from(result.strongAgainst),
      weakTo: Array.from(result.weakTo)
    };
  }

  isModelLoading(): boolean {
    return false;
  }

  isModelLoaded(): boolean {
    return this.isLoaded;
  }
}

// Create a singleton instance
export const pokemonAI = new PokemonAI();

// Helper function to generate Pokemon context from data
export function generatePokemonContext(pokemonData: any): string {
  if (!pokemonData) return '';

  const { name, id, height, weight, types, abilities, stats, species } = pokemonData;
  
  let context = `${name} is Pokemon #${id}. `;
  context += `It is ${height/10} meters tall and weighs ${weight/10} kg. `;
  
  if (types?.length) {
    const typeNames = types.map((t: any) => t.type.name).join(' and ');
    context += `It is a ${typeNames} type Pokemon. `;
  }
  
  if (abilities?.length) {
    const abilityNames = abilities.map((a: any) => a.ability.name).join(', ');
    context += `Its abilities are: ${abilityNames}. `;
  }
  
  if (stats?.length) {
    const statInfo = stats.map((s: any) => `${s.stat.name}: ${s.base_stat}`).join(', ');
    context += `Base stats: ${statInfo}. `;
  }
  
  if (species?.flavor_text_entries?.length) {
    const englishEntry = species.flavor_text_entries.find((entry: any) => 
      entry.language.name === 'en'
    );
    if (englishEntry) {
      context += `Description: ${englishEntry.flavor_text.replace(/\n/g, ' ')}`;
    }
  }
  
  return context;
}