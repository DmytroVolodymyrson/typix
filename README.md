# Typix Drawing App

A cross-platform drawing application built with React Native and Expo that allows users to create and save digital artwork.

## Features

- Drawing canvas with smooth path rendering
- Color picker for stroke colors
- Brush size adjustment
- Eraser tool
- Undo functionality
- Canvas clearing
- Save drawings to device gallery
- Copy drawings to clipboard as PNG with transparency

## Technology Stack

- React Native
- Expo
- React Context for state management
- SVG for vector graphics
- TypeScript

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/YOUR_USERNAME/typix.git
   cd typix/typix-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Follow the instructions to open the app on your device or emulator.

## Project Structure

- `src/components`: UI components
- `src/contexts`: React Context providers
- `src/modules`: Core functionality modules
  - `canvas`: Drawing and path utilities
  - `clipboard`: Clipboard integration
  - `image`: Image processing and saving
  - `storage`: File storage utilities
  - `tools`: Drawing tools implementation
- `src/types`: TypeScript type definitions
- `src/utils`: Helper utilities

## License

MIT 