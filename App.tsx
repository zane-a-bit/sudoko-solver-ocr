
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SudokuGrid from './components/SudokuGrid';
import Controls from './components/Controls';
import { SudokuGrid as SudokuGridType, Difficulty, Hint } from './types';
import { analyzeSudokuImage, generateSudoku, solveSudoku, getSudokuHint } from './services/geminiService';

const emptyGrid: SudokuGridType = Array(9).fill(null).map(() => Array(9).fill(null));
const emptyConflicts: boolean[][] = Array(9).fill(false).map(() => Array(9).fill(false));

const App: React.FC = () => {
    const [initialGrid, setInitialGrid] = useState<SudokuGridType>(emptyGrid);
    const [currentGrid, setCurrentGrid] = useState<SudokuGridType>(emptyGrid);
    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [conflicts, setConflicts] = useState<boolean[][]>(emptyConflicts);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSolving, setIsSolving] = useState(false);
    const [isHinting, setIsHinting] = useState(false);
    const [hint, setHint] = useState<Hint | null>(null);
    const [hintCell, setHintCell] = useState<{row: number, col: number} | null>(null);
    const [message, setMessage] = useState<string>("Generate a new game or upload a photo to start!");

    const checkConflicts = useCallback((grid: SudokuGridType) => {
        const newConflicts = Array(9).fill(null).map(() => Array(9).fill(false));
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (grid[i][j] === null) continue;
                // Check row
                for (let k = 0; k < 9; k++) {
                    if (k !== j && grid[i][k] === grid[i][j]) newConflicts[i][j] = true;
                }
                // Check column
                for (let k = 0; k < 9; k++) {
                    if (k !== i && grid[k][j] === grid[i][j]) newConflicts[i][j] = true;
                }
                // Check 3x3 box
                const startRow = Math.floor(i / 3) * 3;
                const startCol = Math.floor(j / 3) * 3;
                for (let row = startRow; row < startRow + 3; row++) {
                    for (let col = startCol; col < startCol + 3; col++) {
                        if ((row !== i || col !== j) && grid[row][col] === grid[i][j]) {
                            newConflicts[i][j] = true;
                        }
                    }
                }
            }
        }
        setConflicts(newConflicts);
    }, []);

    useEffect(() => {
        checkConflicts(currentGrid);
    }, [currentGrid, checkConflicts]);

    const resetState = () => {
        setHint(null);
        setHintCell(null);
        setMessage("");
    };

    const handleGenerate = async (difficulty: Difficulty) => {
        resetState();
        setIsLoading(true);
        setIsGenerating(true);
        setMessage(`Generating ${difficulty} puzzle...`);
        const newGrid = await generateSudoku(difficulty);
        if (newGrid) {
            setInitialGrid(newGrid);
            setCurrentGrid(newGrid);
            setMessage(`New ${difficulty} puzzle ready!`);
        } else {
            setMessage("Error: Could not generate a new puzzle.");
        }
        setIsLoading(false);
        setIsGenerating(false);
    };

    const handleSolve = async () => {
        resetState();
        setIsLoading(true);
        setIsSolving(true);
        setMessage("AI is solving the puzzle...");
        const solution = await solveSudoku(initialGrid);
        if (solution) {
            setCurrentGrid(solution);
            setMessage("Puzzle solved by AI!");
        } else {
            setMessage("Error: AI could not solve the puzzle.");
        }
        setIsLoading(false);
        setIsSolving(false);
    };

    const handleHint = async () => {
        resetState();
        setIsLoading(true);
        setIsHinting(true);
        setMessage("AI is thinking of a hint...");
        const hintResult = await getSudokuHint(currentGrid);
        if (hintResult) {
            setHint(hintResult);
            setHintCell({row: hintResult.row, col: hintResult.col})
            setMessage(hintResult.explanation);
            setTimeout(() => {
                const newGrid = currentGrid.map(row => [...row]);
                newGrid[hintResult.row][hintResult.col] = hintResult.value;
                setCurrentGrid(newGrid);
                setHintCell(null);
            }, 2000);
        } else {
            setMessage("Error: Could not get a hint.");
        }
        setIsLoading(false);
        setIsHinting(false);
    };

    const handleImageUpload = async (file: File) => {
        resetState();
        setIsLoading(true);
        setMessage("Analyzing image with AI...");
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = (e.target?.result as string).split(',')[1];
            if (base64) {
                const grid = await analyzeSudokuImage(base64, file.type);
                if (grid) {
                    setInitialGrid(grid);
                    setCurrentGrid(grid);
                    setMessage("Puzzle extracted from image! You can now edit any mistakes.");
                } else {
                    setMessage("Error: Could not extract puzzle from image.");
                }
            }
            setIsLoading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleCellChange = (row: number, col: number, value: number | null) => {
        const newGrid = currentGrid.map((r, rowIndex) =>
            rowIndex === row ? r.map((c, colIndex) => (colIndex === col ? value : c)) : r
        );
        setCurrentGrid(newGrid);
    };
    
    const isPuzzleSolved = useMemo(() => {
        if(currentGrid.flat().some(cell => cell === null)) return false;
        
        let hasConflict = false;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (currentGrid[i][j] === null) return false;
                const val = currentGrid[i][j];

                for (let k = 0; k < 9; k++) {
                    if (k !== j && currentGrid[i][k] === val) hasConflict = true;
                    if (k !== i && currentGrid[k][j] === val) hasConflict = true;
                }
                
                const startRow = Math.floor(i / 3) * 3;
                const startCol = Math.floor(j / 3) * 3;
                for (let r = startRow; r < startRow + 3; r++) {
                    for (let c = startCol; c < startCol + 3; c++) {
                        if ((r !== i || c !== j) && currentGrid[r][c] === val) hasConflict = true;
                    }
                }
            }
        }
        return !hasConflict;

    }, [currentGrid]);

    useEffect(() => {
        if(isPuzzleSolved) {
            setMessage("Congratulations! You solved the puzzle!");
        }
    }, [isPuzzleSolved])

    const highlightedValue = selectedCell ? currentGrid[selectedCell.row][selectedCell.col] : null;

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
            <header className="text-center mb-6">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
                    AI Sudoku Solver & Teacher
                </h1>
                <p className="text-slate-400 mt-2">Powered by Gemini</p>
            </header>
            
            <main className="w-full max-w-lg mx-auto flex flex-col items-center gap-4">
                <SudokuGrid
                    grid={currentGrid}
                    initialGrid={initialGrid}
                    onCellChange={handleCellChange}
                    selectedCell={selectedCell}
                    onCellSelect={(row, col) => setSelectedCell({ row, col })}
                    conflicts={conflicts}
                    hintCell={hintCell}
                    highlightedValue={highlightedValue}
                />
                 <div className="w-full p-4 bg-slate-800/50 rounded-lg shadow-xl min-h-[6rem] flex items-center justify-center">
                    <p className={`text-center transition-opacity duration-300 ${isLoading ? 'animate-pulse text-slate-400' : 'text-slate-200'}`}>
                        {isPuzzleSolved ? '🎉 Congratulations! You solved the puzzle! 🎉' : message}
                    </p>
                </div>
                <Controls
                    onGenerate={handleGenerate}
                    onSolve={handleSolve}
                    onHint={handleHint}
                    onImageUpload={handleImageUpload}
                    isLoading={isLoading}
                    isGenerating={isGenerating}
                    isSolving={isSolving}
                    isHinting={isHinting}
                />
            </main>
        </div>
    );
};

export default App;