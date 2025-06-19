import React from 'react';
import FeedbackForm from '../forms/FeedbackForm.jsx';

export default function FeedbackPage() {
    const handleFeedbackSubmit = (feedbackData) => {
        console.log('Feedback submitted from page:', feedbackData);
        // TODO: Handle feedback submission (API call, analytics, etc.)
    };

    return (
        <div className="text-text-light">
            <FeedbackForm 
                onSubmit={handleFeedbackSubmit}
                isModal={false}
            />
        </div>
    );
} 