import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Question from './Question';

const moods = [
  { id: 'happy', label: 'Happy', emoji: '😊', color: 'bg-yellow-400' },
  { id: 'sad', label: 'Sad', emoji: '😢', color: 'bg-blue-400' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡', color: 'bg-red-400' },
  { id: 'relaxed', label: 'Relaxed', emoji: '😌', color: 'bg-green-400' },
  { id: 'angry', label: 'Angry', emoji: '😠', color: 'bg-orange-400' },
  { id: 'nostalgic', label: 'Nostalgic', emoji: '🕰️', color: 'bg-purple-400' },
];

const MoodQuestionnaireModal = ({ onClose, onSubmitMood }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setStep(2);
  };

  const handleSubmit = () => {
    if (selectedMood) {
      onSubmitMood(selectedMood);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-bg p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">How are you feeling today?</h2>
        
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                className={`p-4 rounded-lg flex flex-col items-center justify-center transition-transform hover:scale-105 ${mood.color}`}
              >
                <span className="text-4xl mb-2">{mood.emoji}</span>
                <span className="font-medium">{mood.label}</span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <p className="text-xl mb-6">
              You selected: <span className="font-bold">{moods.find(m => m.id === selectedMood)?.label}</span>
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoodQuestionnaireModal;
