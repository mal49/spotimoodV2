import React, { useState } from 'react';
import Button from '../UI/Button.jsx';

export default function FeedbackForm({ onSubmit, onClose, isModal = false }) {
    const [feedback, setFeedback] = useState({
        category: '',
        rating: 0,
        message: '',
        email: '',
        improvementSuggestions: '',
        wouldRecommend: null
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const categories = [
        { id: 'mood-detection', label: 'Mood Detection Accuracy', icon: '🧠' },
        { id: 'playlist-quality', label: 'Playlist Quality', icon: '🎵' },
        { id: 'user-interface', label: 'User Interface', icon: '🎨' },
        { id: 'performance', label: 'App Performance', icon: '⚡' },
        { id: 'features', label: 'Feature Requests', icon: '💡' },
        { id: 'general', label: 'General Feedback', icon: '💬' }
    ];

    const handleCategoryChange = (categoryId) => {
        setFeedback(prev => ({ ...prev, category: categoryId }));
    };

    const handleRatingChange = (rating) => {
        setFeedback(prev => ({ ...prev, rating }));
    };

    const handleInputChange = (field, value) => {
        setFeedback(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!feedback.category || !feedback.rating || !feedback.message.trim()) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            // TODO: Integrate with actual feedback API
            console.log('Feedback submitted:', feedback);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setSubmitted(true);
            if (onSubmit) onSubmit(feedback);
            
            // Auto-close after successful submission if it's a modal
            if (isModal) {
                setTimeout(() => {
                    onClose && onClose();
                }, 2000);
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-text-light mb-2">Thank You!</h3>
                <p className="text-text-medium">
                    Your feedback has been submitted successfully. We appreciate your input!
                </p>
                {isModal && (
                    <Button
                        onClick={onClose}
                        className="mt-6 bg-primary-purple text-text-light hover:bg-[#C879E6]"
                    >
                        Close
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className={`${isModal ? '' : 'min-h-screen bg-dark-bg'}`}>
            <div className={`${isModal ? '' : 'max-w-4xl mx-auto px-6 py-12'}`}>
                {!isModal && (
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-purple to-[#C879E6] bg-clip-text text-transparent">
                            We Value Your Feedback
                        </h1>
                        <p className="text-xl text-text-medium">
                            Help us improve SpotiMood by sharing your thoughts and suggestions
                        </p>
                    </div>
                )}

                {isModal && onClose && (
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-text-light">Send Feedback</h2>
                        <button
                            onClick={onClose}
                            className="text-text-medium hover:text-text-light transition-colors"
                        >
                            <span className="text-2xl">×</span>
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Feedback Category */}
                    <div>
                        <label className="block text-lg font-bold text-text-light mb-4">
                            What would you like to give feedback about?
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => handleCategoryChange(category.id)}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                                        feedback.category === category.id
                                            ? 'border-primary-purple bg-primary-purple/20 text-text-light'
                                            : 'border-dark-hover bg-dark-card text-text-medium hover:border-primary-purple/50 hover:text-text-light'
                                    }`}
                                >
                                    <div className="text-2xl mb-2">{category.icon}</div>
                                    <div className="font-medium text-sm">{category.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rating */}
                    <div>
                        <label className="block text-lg font-bold text-text-light mb-4">
                            How would you rate your overall experience?
                        </label>
                        <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRatingChange(star)}
                                    className={`text-3xl transition-colors ${
                                        star <= feedback.rating
                                            ? 'text-yellow-400'
                                            : 'text-dark-hover hover:text-yellow-400'
                                    }`}
                                >
                                    ★
                                </button>
                            ))}
                            {feedback.rating > 0 && (
                                <span className="ml-4 text-text-medium">
                                    {feedback.rating === 1 && 'Poor'}
                                    {feedback.rating === 2 && 'Fair'}
                                    {feedback.rating === 3 && 'Good'}
                                    {feedback.rating === 4 && 'Very Good'}
                                    {feedback.rating === 5 && 'Excellent'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Detailed Feedback */}
                    <div>
                        <label className="block text-lg font-bold text-text-light mb-4">
                            Tell us more about your experience
                        </label>
                        <textarea
                            value={feedback.message}
                            onChange={(e) => handleInputChange('message', e.target.value)}
                            placeholder="Share your thoughts, what you liked, what could be improved..."
                            rows={6}
                            className="w-full bg-dark-bg text-text-light border-2 border-dark-hover rounded-lg p-4 focus:outline-none focus:border-primary-purple transition-colors"
                        />
                    </div>

                    {/* Improvement Suggestions */}
                    <div>
                        <label className="block text-lg font-bold text-text-light mb-4">
                            What specific improvements would you suggest?
                        </label>
                        <textarea
                            value={feedback.improvementSuggestions}
                            onChange={(e) => handleInputChange('improvementSuggestions', e.target.value)}
                            placeholder="Any features you'd like to see or changes you'd recommend..."
                            rows={4}
                            className="w-full bg-dark-bg text-text-light border-2 border-dark-hover rounded-lg p-4 focus:outline-none focus:border-primary-purple transition-colors"
                        />
                    </div>

                    {/* Recommendation */}
                    <div>
                        <label className="block text-lg font-bold text-text-light mb-4">
                            Would you recommend SpotiMood to others?
                        </label>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => handleInputChange('wouldRecommend', true)}
                                className={`px-6 py-3 rounded-lg border-2 transition-all ${
                                    feedback.wouldRecommend === true
                                        ? 'border-green-500 bg-green-500/20 text-green-400'
                                        : 'border-dark-hover bg-dark-card text-text-medium hover:border-green-500/50'
                                }`}
                            >
                                👍 Yes
                            </button>
                            <button
                                type="button"
                                onClick={() => handleInputChange('wouldRecommend', false)}
                                className={`px-6 py-3 rounded-lg border-2 transition-all ${
                                    feedback.wouldRecommend === false
                                        ? 'border-red-500 bg-red-500/20 text-red-400'
                                        : 'border-dark-hover bg-dark-card text-text-medium hover:border-red-500/50'
                                }`}
                            >
                                👎 No
                            </button>
                        </div>
                    </div>

                    {/* Email (Optional) */}
                    <div>
                        <label className="block text-lg font-bold text-text-light mb-4">
                            Email (optional)
                        </label>
                        <input
                            type="email"
                            value={feedback.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="your.email@example.com (if you'd like us to follow up)"
                            className="w-full bg-dark-bg text-text-light border-2 border-dark-hover rounded-lg p-4 focus:outline-none focus:border-primary-purple transition-colors"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        {isModal && onClose && (
                            <Button
                                type="button"
                                onClick={onClose}
                                className="bg-dark-hover text-text-light hover:bg-dark-card"
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={!feedback.category || !feedback.rating || !feedback.message.trim() || isSubmitting}
                            className={`px-8 py-3 ${
                                !feedback.category || !feedback.rating || !feedback.message.trim()
                                    ? 'bg-dark-hover text-text-medium cursor-not-allowed'
                                    : 'bg-primary-purple text-text-light hover:bg-[#C879E6]'
                            }`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center space-x-2">
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Submitting...</span>
                                </div>
                            ) : 'Submit Feedback'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
} 