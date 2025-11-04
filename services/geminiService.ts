import { GoogleGenAI, Type } from "@google/genai";
// FIX: Added AspectRatio to imports for the new generateImage function.
import { SudokuGrid, Difficulty, Hint, AspectRatio } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Helper to parse JSON from Gemini's text response
const parseJson = <T,>(text: string): T | null => {
  try {
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    console.error("Original text:", text);
    return null;
  }
};


export const analyzeSudokuImage = async (base64Image: string, mimeType: string): Promise<SudokuGrid | null> => {
    const prompt = "Analyze this image of a Sudoku puzzle. Extract the numbers and their positions. Return a 9x9 array representing the grid, using 0 for empty cells.";
    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType,
        },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        // FIX: Added responseSchema to ensure reliable JSON output from image analysis.
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                description: "The extracted 9x9 Sudoku grid from the image.",
                items: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.INTEGER,
                        description: "A number from 0-9, where 0 is an empty cell."
                    }
                }
            }
        }
    });

    const result = parseJson<number[][]>(response.text);
    return result ? result.map(row => row.map(cell => cell === 0 ? null : cell)) : null;
};

export const generateSudoku = async (difficulty: Difficulty): Promise<SudokuGrid | null> => {
    const prompt = `Generate a new Sudoku puzzle with ${difficulty} difficulty. Return it as a JSON object with a single key "puzzle" which is a 9x9 array. Use 0 for empty cells.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        // FIX: Added responseSchema to ensure reliable JSON output.
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    puzzle: {
                        type: Type.ARRAY,
                        description: "A 9x9 array representing the Sudoku grid.",
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.INTEGER,
                                description: "A number from 0-9, where 0 is an empty cell."
                            }
                        }
                    }
                },
                required: ["puzzle"]
            }
        }
    });

    const result = parseJson<{ puzzle: number[][] }>(response.text);
    return result ? result.puzzle.map(row => row.map(cell => cell === 0 ? null : cell)) : null;
};

export const solveSudoku = async (puzzle: SudokuGrid): Promise<SudokuGrid | null> => {
    const prompt = `Solve this Sudoku puzzle: ${JSON.stringify(puzzle)}. Replace nulls with the correct numbers. Return only the solved 9x9 grid as a JSON array.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        // FIX: Added responseSchema to ensure reliable JSON output.
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                description: "The solved 9x9 Sudoku grid.",
                items: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.INTEGER,
                        description: "A number from 1-9."
                    }
                }
            }
        }
    });

    // FIX: Using a more specific type for parsing the solved grid which contains only numbers.
    return parseJson<number[][]>(response.text);
};

export const getSudokuHint = async (puzzle: SudokuGrid): Promise<Hint | null> => {
    const prompt = `Here is a Sudoku puzzle in progress: ${JSON.stringify(puzzle)}. The user is stuck. Identify a single cell that can be solved with simple logic (without complex chains or guessing) and explain the reasoning. Return a JSON object with keys "row" (0-8), "col" (0-8), "value" (1-9), and "explanation".`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    row: { type: Type.INTEGER },
                    col: { type: Type.INTEGER },
                    value: { type: Type.INTEGER },
                    explanation: { type: Type.STRING }
                },
                required: ["row", "col", "value", "explanation"]
            }
        }
    });

    return parseJson<Hint>(response.text);
};

// FIX: Added generateImage function to resolve missing export error in ImageGenerator.tsx.
export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string | null> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Failed to generate image:", error);
    return null;
  }
};
