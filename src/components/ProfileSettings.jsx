import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { X, User, Mail, Calendar, Save, Loader2, Check, AlertCircle } from 'lucide-react';

export default function ProfileSettings({ isModal = false, onClose = null }) {
    const { user, profile, updateProfile, loading: authLoading } = useAuth();
    const [formData, setFormData] = useState({
        display_name: '',
        full_name: '',
        bio: '',
        date_of_birth: '',
        avatar_url: ''
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [updateError, setUpdateError] = useState(null);

    // Initialize form data when profile loads
    useEffect(() => {
        if (profile || user) {
            setFormData({
                display_name: profile?.display_name || user?.user_metadata?.display_name || '',
                full_name: profile?.full_name || user?.user_metadata?.full_name || '',
                bio: profile?.bio || '',
                date_of_birth: profile?.date_of_birth || '',
                avatar_url: profile?.avatar_url || user?.user_metadata?.avatar_url || ''
            });
        }
    }, [profile, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear any existing messages when user starts typing
        if (updateSuccess) setUpdateSuccess(false);
        if (updateError) setUpdateError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setUpdateError(null);
        setUpdateSuccess(false);

        try {
            const result = await updateProfile(formData);
            
            if (result.error) {
                throw result.error;
            }

            setUpdateSuccess(true);
            setTimeout(() => setUpdateSuccess(false), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setUpdateError(error.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClose = () => {
        if (onClose && typeof onClose === 'function') {
            onClose();
        }
    };

    if (authLoading) {
        return (
            <div className={`${isModal ? 'p-6' : 'min-h-screen'} bg-dark-bg flex items-center justify-center`}>
                <div className="text-center">
                    <Loader2 className="animate-spin h-8 w-8 text-primary-purple mx-auto mb-4" />
                    <p className="text-text-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    const containerClass = isModal 
        ? "bg-dark-card rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        : "min-h-screen bg-dark-bg text-text-light p-4 sm:p-6";

    const contentClass = isModal 
        ? "p-6"
        : "max-w-2xl mx-auto";

    return (
        <div className={containerClass}>
            <div className={contentClass}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-purple rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-text-light">Profile Settings</h2>
                            <p className="text-text-medium text-sm">Manage your account information</p>
                        </div>
                    </div>
                    {isModal && onClose && (
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-dark-hover rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-text-medium hover:text-text-light" />
                        </button>
                    )}
                </div>

                {/* Account Info Display */}
                <div className="bg-dark-hover p-4 rounded-lg mb-6">
                    <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-primary-purple" />
                        <div>
                            <p className="text-text-light font-medium">Email Address</p>
                            <p className="text-text-medium text-sm">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {updateSuccess && (
                    <div className="bg-green-900/20 border border-green-500 text-green-100 p-4 rounded-lg mb-6 flex items-center space-x-2">
                        <Check className="w-5 h-5 text-green-400" />
                        <span>Profile updated successfully!</span>
                    </div>
                )}

                {updateError && (
                    <div className="bg-red-900/20 border border-red-500 text-red-100 p-4 rounded-lg mb-6 flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span>{updateError}</span>
                    </div>
                )}

                {/* Profile Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Display Name */}
                    <div>
                        <label htmlFor="display_name" className="block text-text-light font-medium mb-2">
                            Display Name
                        </label>
                        <input
                            type="text"
                            id="display_name"
                            name="display_name"
                            value={formData.display_name}
                            onChange={handleInputChange}
                            className="w-full bg-dark-bg border border-dark-hover rounded-lg p-3 text-text-light focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                            placeholder="How others will see your name"
                        />
                    </div>

                    {/* Full Name */}
                    <div>
                        <label htmlFor="full_name" className="block text-text-light font-medium mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            className="w-full bg-dark-bg border border-dark-hover rounded-lg p-3 text-text-light focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                            placeholder="Your complete name"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label htmlFor="bio" className="block text-text-light font-medium mb-2">
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full bg-dark-bg border border-dark-hover rounded-lg p-3 text-text-light focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent resize-none"
                            placeholder="Tell us about yourself and your music taste..."
                        />
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label htmlFor="date_of_birth" className="block text-text-light font-medium mb-2">
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            id="date_of_birth"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleInputChange}
                            className="w-full bg-dark-bg border border-dark-hover rounded-lg p-3 text-text-light focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                        />
                    </div>

                    {/* Avatar URL */}
                    <div>
                        <label htmlFor="avatar_url" className="block text-text-light font-medium mb-2">
                            Profile Picture URL
                        </label>
                        <input
                            type="url"
                            id="avatar_url"
                            name="avatar_url"
                            value={formData.avatar_url}
                            onChange={handleInputChange}
                            className="w-full bg-dark-bg border border-dark-hover rounded-lg p-3 text-text-light focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                            placeholder="https://example.com/your-photo.jpg"
                        />
                        {formData.avatar_url && (
                            <div className="mt-2">
                                <p className="text-text-medium text-sm mb-2">Preview:</p>
                                <img
                                    src={formData.avatar_url}
                                    alt="Profile preview"
                                    className="w-16 h-16 rounded-full object-cover border-2 border-primary-purple"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="flex-1 bg-primary-purple text-white py-3 px-6 rounded-lg font-medium hover:bg-[#C879E6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5" />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                        
                        {isModal && onClose && (
                            <button
                                type="button"
                                onClick={handleClose}
                                className="sm:w-auto px-6 py-3 border border-dark-hover text-text-medium hover:text-text-light hover:border-text-medium rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                {/* Additional Info */}
                <div className="mt-8 p-4 bg-dark-hover rounded-lg">
                    <h3 className="text-text-light font-medium mb-2">About Your Profile</h3>
                    <ul className="text-text-medium text-sm space-y-1">
                        <li>• Your display name is shown to other users</li>
                        <li>• Your email address is private and used for authentication</li>
                        <li>• Profile information helps personalize your music experience</li>
                        <li>• You can update your information anytime</li>
                    </ul>
                </div>
            </div>
        </div>
    );
} 