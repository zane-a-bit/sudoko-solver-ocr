
import React from 'react';
import { SudokuGrid as SudokuGridType } from '../types';

interface SudokuGridProps {
  grid: SudokuGridType;
  initialGrid: SudokuGridType;
  onCellChange: (row: number, col: number, value: number | null) => void;
  selectedCell: { row: number; col: number } | null;
  onCellSelect: (row: number, col: number) => void;
  conflicts: boolean[][];
  hintCell: { row: number, col: number } | null;
  highlightedValue: number | null;
}

const SudokuGrid: React.FC<SudokuGridProps> = ({ 
  grid, 
  initialGrid, 
  onCellChange, 
  selectedCell, 
  onCellSelect,
  conflicts,
  hintCell,
  highlightedValue
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, row: number, col: number) => {
    const value = e.target.value;
    if (value === '' || (value.length === 1 && '123456789'.includes(value))) {
      onCellChange(row, col, value === '' ? null : parseInt(value, 10));
    }
  };

  const renderCell = (row: number, col: number) => {
    const value = grid[row]?.[col];
    const isInitial = initialGrid[row]?.[col] !== null;
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isInSelectedRowCol = selectedCell ? selectedCell.row === row || selectedCell.col === col : false;
    const isInSelectedBox = selectedCell ? 
      Math.floor(selectedCell.row / 3) === Math.floor(row / 3) && Math.floor(selectedCell.col / 3) === Math.floor(col / 3) 
      : false;
    const isConflict = conflicts[row]?.[col];
    const isHinted = hintCell?.row === row && hintCell?.col === col;
    const isHighlighted = highlightedValue !== null && value !== null && value === highlightedValue && !isSelected;

    const cellClasses = [
      "w-full h-full text-center text-xl md:text-2xl font-semibold flex items-center justify-center",
      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-400 rounded-md",
      "transition-colors duration-200",
      isInitial ? "text-slate-100" : "text-cyan-400",
      isSelected ? "bg-slate-600" : isHighlighted ? "bg-cyan-800" : (isInSelectedRowCol || isInSelectedBox) ? "bg-slate-700/50" : "bg-slate-800",
      isConflict ? "!text-red-500" : "",
      isHinted ? "bg-green-500/50 animate-cell-pop" : "",
      (col % 3 === 2 && col !== 8) ? "border-r-2 border-slate-500" : "",
      (row % 3 === 2 && row !== 8) ? "border-b-2 border-slate-500" : "",
    ].join(" ");

    return (
      <input
        key={`${row}-${col}`}
        type="text"
        inputMode="numeric"
        pattern="[1-9]"
        maxLength={1}
        className={cellClasses}
        value={value || ''}
        readOnly={isInitial}
        onChange={(e) => handleInputChange(e, row, col)}
        onFocus={() => onCellSelect(row, col)}
        onClick={() => onCellSelect(row, col)}
      />
    );
  };

  return (
    <div className="aspect-square w-full max-w-lg mx-auto grid grid-cols-9 grid-rows-9 gap-1 p-2 bg-slate-700 rounded-lg shadow-2xl">
      {Array.from({ length: 9 }).map((_, row) =>
        Array.from({ length: 9 }).map((_, col) => renderCell(row, col))
      )}
    </div>
  );
};

export default SudokuGrid;