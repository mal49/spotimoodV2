import React from 'react';

const Question = ({ question, options, onSelect, selectedOption }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-4">{question}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`w-full p-3 rounded-lg text-left transition-colors ${
              selectedOption === option.value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Question;
