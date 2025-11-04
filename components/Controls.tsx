
import React, { useRef } from 'react';
import { Difficulty } from '../types';

interface ControlsProps {
  onGenerate: (difficulty: Difficulty) => void;
  onSolve: () => void;
  onHint: () => void;
  onImageUpload: (file: File) => void;
  isLoading: boolean;
  isGenerating: boolean;
  isSolving: boolean;
  isHinting: boolean;
}

const Button: React.FC<{ onClick?: () => void; disabled?: boolean; className?: string; children: React.ReactNode }> = ({ onClick, disabled, className = '', children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
        disabled
          ? 'bg-slate-600 cursor-not-allowed animate-pulse-bg'
          : 'bg-cyan-600 hover:bg-cyan-500 shadow-md hover:shadow-lg'
      } ${className}`}
    >
      {children}
    </button>
  );

const Controls: React.FC<ControlsProps> = ({ 
    onGenerate, 
    onSolve, 
    onHint, 
    onImageUpload, 
    isLoading,
    isGenerating,
    isSolving,
    isHinting
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-slate-800/50 rounded-lg shadow-xl mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <h3 className="sm:col-span-3 text-lg font-bold text-center text-slate-300">New Game</h3>
        {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
          <Button key={diff} onClick={() => onGenerate(diff)} disabled={isLoading}>
            {isGenerating ? 'Generating...' : diff.charAt(0).toUpperCase() + diff.slice(1)}
          </Button>
        ))}
      </div>
      <div className="border-t border-slate-600 my-4"></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
         <Button onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Upload Photo'}
        </Button>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        
        <Button onClick={onHint} disabled={isLoading}>
          {isHinting ? 'Thinking...' : 'Get Hint'}
        </Button>

        <Button onClick={onSolve} disabled={isLoading} className="bg-green-600 hover:bg-green-500">
          {isSolving ? 'Solving...' : 'Solve with AI'}
        </Button>
      </div>
    </div>
  );
};

export default Controls;
