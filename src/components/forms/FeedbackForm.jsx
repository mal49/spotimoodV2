import React, { useState } from 'react';
import Button from '../UI/Button.jsx';
import { Loader2, Music, Lightbulb, Check, Star } from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext.jsx';

export default function FeedbackForm({ onSubmit, onClose, isModal = false }) {
    const [feedback, setFeedback] = useState({
        category: '',
        rating: 0,
        message: '',
        email: '',
        improvementSuggestions: '',
        wouldRecommend: null
    });
    
    const [submitted, setSubmitted] = useState(false);
    const { submitFeedback, isLoading, error } = useFeedback();

    const categories = [
        { id: 'mood-detection', label: 'Mood Detection Accuracy', icon: <div className="text-2xl">🧠</div>, type: 'general' },
        { id: 'playlist-quality', label: 'Playlist Quality', icon: <Music className="w-6 h-6" />, type: 'general' },
        { id: 'user-interface', label: 'User Interface', icon: <div className="text-2xl">🎨</div>, type: 'general' },
        { id: 'performance', label: 'App Performance', icon: <div className="text-2xl">⚡</div>, type: 'bug' },
        { id: 'features', label: 'Feature Requests', icon: <Lightbulb className="w-6 h-6" />, type: 'feature' },
        { id: 'general', label: 'General Feedback', icon: <div className="text-2xl">💬</div>, type: 'general' }
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

        try {
            // Find the selected category to get its type
            const selectedCategory = categories.find(cat => cat.id === feedback.category);
            const feedbackType = selectedCategory ? selectedCategory.type : 'general';
            
            // Combine main message with improvement suggestions
            let fullMessage = feedback.message.trim();
            if (feedback.improvementSuggestions.trim()) {
                fullMessage += '\n\nImprovement Suggestions:\n' + feedback.improvementSuggestions.trim();
            }
            if (feedback.wouldRecommend !== null) {
                fullMessage += '\n\nWould recommend to others: ' + (feedback.wouldRecommend ? 'Yes' : 'No');
            }

            // Prepare data for database
            const feedbackData = {
                type: feedbackType,
                category: feedback.category,
                message: fullMessage,
                rating: feedback.rating,
                email: feedback.email.trim() || null,
                improvementSuggestions: feedback.improvementSuggestions.trim() || null,
                wouldRecommend: feedback.wouldRecommend
            };

            const result = await submitFeedback(feedbackData);
            
            if (result.error) {
                throw new Error(result.error.message || 'Failed to submit feedback');
            }

            setSubmitted(true);
            if (onSubmit) onSubmit(feedback);
            
            // Auto-close after successful submission if it's a modal
            if (isModal) {
                setTimeout(() => {
                    onClose && onClose();
                }, 2000);
            }
        } catch (submitError) {
            console.error('Error submitting feedback:', submitError);
            // You could add error state handling here if needed
        }
    };

    if (submitted) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
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
                                    <div className="mb-2">{category.icon}</div>
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
                                    <Star className={`w-7 h-7 ${star <= feedback.rating ? 'fill-current' : ''}`} />
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

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg">
                            <p className="font-medium">Error submitting feedback:</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                    )}

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
                            disabled={!feedback.category || !feedback.rating || !feedback.message.trim() || isLoading}
                            className={`px-8 py-3 ${
                                !feedback.category || !feedback.rating || !feedback.message.trim()
                                    ? 'bg-dark-hover text-text-medium cursor-not-allowed'
                                    : 'bg-primary-purple text-text-light hover:bg-[#C879E6]'
                            }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <Loader2 className="animate-spin h-5 w-5" />
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