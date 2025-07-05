import React from 'react';
import { AlertTriangle, Clock, RefreshCw, Info } from 'lucide-react';

const RateLimitInfo = ({ isOpen, onClose, rateLimitType, retryAfter }) => {
    if (!isOpen) return null;

    const getRateLimitInfo = () => {
        switch (rateLimitType) {
            case 'QUOTA_EXCEEDED':
                return {
                    icon: <AlertTriangle className="h-6 w-6 text-red-400" />,
                    title: 'Daily API Quota Exceeded',
                    message: 'We\'ve reached the daily limit for YouTube music data. Content will refresh automatically tomorrow.',
                    bgColor: 'bg-red-900/20 border-red-500',
                    textColor: 'text-red-100'
                };
            case 'RATE_LIMITED':
                return {
                    icon: <Clock className="h-6 w-6 text-yellow-400" />,
                    title: 'Rate Limit Reached',
                    message: 'Too many requests in a short time. Please wait a moment before refreshing.',
                    bgColor: 'bg-yellow-900/20 border-yellow-500',
                    textColor: 'text-yellow-100'
                };
            default:
                return {
                    icon: <Info className="h-6 w-6 text-blue-400" />,
                    title: 'Loading Content',
                    message: 'Using cached content to provide the best experience.',
                    bgColor: 'bg-blue-900/20 border-blue-500',
                    textColor: 'text-blue-100'
                };
        }
    };

    const { icon, title, message, bgColor, textColor } = getRateLimitInfo();

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-dark-card rounded-lg shadow-xl max-w-md w-full p-6">
                <div className={`flex items-center space-x-3 mb-4 p-4 rounded-lg border-l-4 ${bgColor}`}>
                    {icon}
                    <div>
                        <h3 className={`font-semibold ${textColor}`}>{title}</h3>
                        <p className={`text-sm ${textColor}/80`}>{message}</p>
                    </div>
                </div>

                <div className="space-y-3 text-text-light">
                    <div>
                        <h4 className="font-medium text-white mb-2">What's happening?</h4>
                        <p className="text-sm text-text-medium">
                            {rateLimitType === 'QUOTA_EXCEEDED' 
                                ? 'YouTube limits how much music data we can fetch per day. This helps protect their servers and ensures fair usage for all applications.'
                                : 'We\'ve temporarily slowed down requests to YouTube\'s servers to prevent overloading them. This is a normal part of responsible API usage.'
                            }
                        </p>
                    </div>

                    <div>
                        <h4 className="font-medium text-white mb-2">What you can do:</h4>
                        <ul className="text-sm text-text-medium space-y-1">
                            <li>• Browse cached content (still works great!)</li>
                            <li>• Use the mood playlist generator</li>
                            <li>• Explore your saved playlists</li>
                            {rateLimitType === 'QUOTA_EXCEEDED' 
                                ? <li>• Fresh content will load automatically tomorrow</li>
                                : <li>• Try refreshing in a few minutes</li>
                            }
                        </ul>
                    </div>

                    {retryAfter && (
                        <div className="bg-dark-bg p-3 rounded-lg">
                            <p className="text-sm text-text-medium">
                                <RefreshCw className="inline h-4 w-4 mr-1" />
                                Refresh available in: {Math.ceil(retryAfter / 60)} minutes
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-primary-purple text-white rounded-md hover:bg-primary-purple/80 transition-colors"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RateLimitInfo; 