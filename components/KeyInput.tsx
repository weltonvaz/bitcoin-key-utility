
import React from 'react';

interface KeyInputProps {
  inputValue: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateClick: () => void;
  onProcessClick: () => void;
  isLoading: boolean;
  inputError: string | null;
}

const KeyInput: React.FC<KeyInputProps> = ({
  inputValue,
  onInputChange,
  onGenerateClick,
  onProcessClick,
  isLoading,
  inputError,
}) => {
  return (
    <div className="mb-8 p-6 bg-slate-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-sky-400 mb-4">Private Key Input</h2>
      <div className="mb-4">
        <label htmlFor="privateKeyInput" className="block text-sm font-medium text-slate-300 mb-1">
          Enter 64-char Hex Private Key (or generate one):
        </label>
        <input
          type="text"
          id="privateKeyInput"
          value={inputValue}
          onChange={onInputChange}
          placeholder="e.g., 0000...0001 or click Generate"
          className={`w-full px-4 py-2 bg-slate-700 border ${
            inputError ? 'border-red-500' : 'border-slate-600'
          } rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-slate-100 placeholder-slate-400 font-mono`}
          maxLength={64}
          disabled={isLoading}
        />
        {inputError && <p className="mt-2 text-sm text-red-400">{inputError}</p>}
      </div>
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={onGenerateClick}
          disabled={isLoading}
          className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Generate & Process Random Key'}
        </button>
        <button
          onClick={onProcessClick}
          disabled={isLoading || !inputValue.trim()}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Process Input Key'}
        </button>
      </div>
    </div>
  );
};

export default KeyInput;
