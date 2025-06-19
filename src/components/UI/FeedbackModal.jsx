import React from 'react';
import Modal from './Modal.jsx';
import FeedbackForm from '../forms/FeedbackForm.jsx';

export default function FeedbackModal({ isOpen, onClose }) {
    const handleFeedbackSubmit = (feedbackData) => {
        console.log('Feedback submitted from modal:', feedbackData);
        // TODO: Handle feedback submission (API call, analytics, etc.)
    };

    if (!isOpen) return null;

    return (
        <Modal onClose={onClose}>
            <FeedbackForm 
                onSubmit={handleFeedbackSubmit}
                onClose={onClose}
                isModal={true}
            />
        </Modal>
    );
} 