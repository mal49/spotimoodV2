import React from 'react';
import { ArrowLeft, Music, Heart, Users, Target, Sparkles, Brain, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button 
                            onClick={() => navigate('/')}
                            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Back to Home</span>
                        </button>
                        
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                spotimood
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-8">
                        <span className="text-purple-700 font-medium flex items-center gap-2">
                            <Heart className="w-5 h-5" />
                            About Spotimood
                        </span>
                    </div>
                    
                    <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                            Where Music Meets
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Your Emotions
                        </span>
                    </h1>
                    
                    <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                        Spotimood is revolutionizing how we experience music by connecting your emotional state 
                        with the perfect soundtrack. We believe music has the power to transform, heal, and inspire.
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <div className="py-20 px-6 bg-white/60 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Mission</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            To create meaningful connections between people and music through emotional intelligence, 
                            helping individuals explore, understand, and enhance their wellbeing through personalized musical experiences.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-purple-100">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Brain className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Emotional Intelligence</h3>
                            <p className="text-gray-600">
                                Advanced mood analysis that understands the nuances of human emotions and translates them into musical preferences.
                            </p>
                        </div>

                        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-purple-100">
                            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Music className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Personalized Curation</h3>
                            <p className="text-gray-600">
                                Every playlist is uniquely crafted for you, considering your musical taste, current mood, and emotional goals.
                            </p>
                        </div>

                        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-purple-100">
                            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Wellbeing Focus</h3>
                            <p className="text-gray-600">
                                Music therapy principles guide our recommendations to support mental health and emotional wellness.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6">How Spotimood Works</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Our innovative approach combines psychology, music theory, and artificial intelligence 
                            to create the perfect musical experience for your current state of mind.
                        </p>
                    </div>

                    <div className="space-y-12">
                        <div className="flex flex-col lg:flex-row items-center gap-8">
                            <div className="flex-1 text-center lg:text-left">
                                <div className="inline-block w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                                    1
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Mood Assessment</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Our intelligent questionnaire analyzes your current emotional state, energy level, 
                                    and musical preferences to understand exactly what you're feeling.
                                </p>
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="w-64 h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                                    <Target className="w-20 h-20 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row-reverse items-center gap-8">
                            <div className="flex-1 text-center lg:text-left">
                                <div className="inline-block w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                                    2
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-800 mb-4">AI-Powered Curation</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Our advanced algorithm processes your mood data and matches it with our extensive 
                                    music database to find songs that perfectly complement your emotional state.
                                </p>
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="w-64 h-48 bg-gradient-to-br from-pink-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                                    <Sparkles className="w-20 h-20 text-pink-600" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row items-center gap-8">
                            <div className="flex-1 text-center lg:text-left">
                                <div className="inline-block w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
                                    3
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Personalized Experience</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Enjoy your custom playlist while we track your preferences and mood patterns 
                                    to make even better recommendations in the future.
                                </p>
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="w-64 h-48 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                                    <Headphones className="w-20 h-20 text-indigo-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vision Section */}
            <div className="py-20 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6">Our Vision</h2>
                    <p className="text-xl leading-relaxed mb-8">
                        We envision a world where music becomes a universal language for emotional healing and personal growth. 
                        Through Spotimood, we're building bridges between technology and human emotion, creating spaces where 
                        people can discover new aspects of themselves through the power of music.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <div className="flex items-center space-x-3">
                            <Users className="w-6 h-6" />
                            <span className="font-semibold">10K+ Happy Users</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Music className="w-6 h-6" />
                            <span className="font-semibold">1M+ Songs Analyzed</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Heart className="w-6 h-6" />
                            <span className="font-semibold">Countless Moments Enhanced</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="py-16 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Ready to Discover Your Musical Mood?</h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Join thousands of users who have transformed their relationship with music through Spotimood.
                    </p>
                    <button 
                        onClick={() => navigate('/auth')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                        Start Your Journey
                    </button>
                </div>
            </div>
        </div>
    );
} 