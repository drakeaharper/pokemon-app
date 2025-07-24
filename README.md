# Pokemon Card App

A React TypeScript application that displays Pokemon information as interactive cards using the PokeAPI.

🎮 **[Live Demo](https://drakeaharper.github.io/pokemon-app)**

## Features

- 🔍 Search Pokemon by number (1-1010)
- 🎴 Beautiful card display with Pokemon stats and types
- 🔄 Interactive evolution chain visualization
- 🌳 Support for branched evolutions (like Eevee)
- 🎨 Type-based color theming
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone git@github.com:drakeaharper/pokemon-app.git
cd pokemon-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

## Available Scripts

### `npm start`
Runs the app in development mode.

### `npm test`
Launches the test runner.

### `npm run build`
Builds the app for production.

### `npm run deploy`
Deploys the app to GitHub Pages.

## Usage

1. Navigate to the Pokemon Finder from the homepage
2. Enter a Pokemon number (1-1010)
3. View the Pokemon card with:
   - Official artwork
   - Type information with color coding
   - Base stats with visual bars
   - Height and weight
   - Evolution chain with clickable cards

## Example Pokemon to Try

- **25** - Pikachu (has both previous and next evolution)
- **133** - Eevee (multiple branched evolutions)
- **1** - Bulbasaur (simple 3-stage evolution)
- **236** - Tyrogue (branches into 3 different Pokemon)

## Technologies Used

- React with TypeScript
- React Router (HashRouter for GitHub Pages)
- Axios for API calls
- PokeAPI for Pokemon data
- GitHub Pages for hosting
- GitHub Actions for CI/CD

## Deployment

The app automatically deploys to GitHub Pages when changes are pushed to the main branch.

To manually deploy:
```bash
npm run deploy
```

## API Reference

This app uses the [PokeAPI](https://pokeapi.co/) to fetch Pokemon data.

## License

This project was bootstrapped with Create React App.