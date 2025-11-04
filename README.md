
# AI Sudoku Solver & Teacher

Welcome to the AI Sudoku Solver & Teacher, an intelligent web application powered by the Google Gemini API. This app is designed not just to play Sudoku, but to enhance the experience with powerful AI features that can help you solve puzzles, learn new techniques, and even digitize puzzles from photos.

## Features

This application combines a classic Sudoku interface with cutting-edge AI capabilities:

### 1. Multiple Ways to Play
- **Generate New Games**: Instantly create a new Sudoku puzzle by selecting one of three difficulty levels: **Easy**, **Medium**, or **Hard**.
- **Upload a Photo**: Have a puzzle in a newspaper or book? Just take a photo and upload it. The Gemini vision model will analyze the image, extract the numbers, and set up the board for you to solve.

### 2. Interactive & User-Friendly Grid
- **Real-time Conflict Highlighting**: The app automatically detects and highlights any incorrect number placements in red, helping you spot mistakes instantly.
- **Smart Cell Highlighting**: When you select a cell, its entire row, column, and 3x3 box are subtly highlighted to help you focus.
- **Number Highlighting**: Clicking on a cell that contains a number will highlight all other cells on the board with that same number, making it easy to see placements and patterns.
- **Win Detection**: The application automatically recognizes when you have successfully and correctly completed the puzzle and displays a congratulatory message.

### 3. AI-Powered Assistance
- **One-Click AI Solve**: If you're completely stumped or just curious, click the "Solve with AI" button. The powerful Gemini Pro model will solve the entire puzzle in seconds.
- **Intelligent Hints ("Guide Mode")**: This is more than just a simple hint. When you ask for a hint, the AI analyzes the current board state and identifies a cell that can be solved using logical deduction. It then provides:
    - The correct number for that cell.
    - A clear, step-by-step **explanation** of the logic used to determine the answer (e.g., "This is the only possible cell for the number 5 in this row"). This feature helps you learn the techniques to become a better Sudoku player.

## 🚀 How to Play

Getting started is simple:

1.  **Start a Puzzle**:
    - **To generate one**: Click the **Easy**, **Medium**, or **Hard** button.
    - **To use your own**: Click **Upload Photo**, select an image file of a Sudoku puzzle, and the grid will be populated automatically.
2.  **Select a Cell**: Click on any empty (non-bold) cell you want to fill.
3.  **Enter a Number**: Type a number from 1 to 9.
4.  **Stuck?**:
    - Click **Get Hint** to have the AI find and explain the next logical move. The hinted cell will briefly flash green before being filled in.
    - If you want to see the complete solution, click **Solve with AI**.
5.  **Win**: Continue filling cells until the entire board is correct. A success message will appear!

## 🛠️ Technology Stack

-   **Frontend**: Built with [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/).
-   **Styling**: Styled with [Tailwind CSS](https://tailwindcss.com/) for a modern, responsive design.
-   **AI Engine**: Powered by the **[Google Gemini API](https://ai.google.dev/)**:
    -   **Gemini 2.5 Flash**: Used for fast tasks like generating puzzles, analyzing images (OCR), and providing hints.
    -   **Gemini 2.5 Pro**: Used for the more complex reasoning task of solving an entire puzzle from its initial state.
