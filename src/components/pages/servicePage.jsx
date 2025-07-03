import React from 'react';
import { ArrowLeft, Music, Brain, Heart, Zap, Shield, Star, Play, Users, Headphones, Sparkles, Target, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ServicePage() {
    const navigate = useNavigate();

    const features = [
        {
            icon: Brain,
            title: "AI-Powered Mood Analysis",
            description: "Advanced algorithms analyze your responses to understand your emotional state and music preferences.",
            color: "from-purple-500 to-indigo-500"
        },
        {
            icon: Music,
            title: "Personalized Playlists",
            description: "Custom curated playlists that match your mood, energy level, and musical taste perfectly.",
            color: "from-pink-500 to-purple-500"
        },
        {
            icon: Heart,
            title: "Emotional Wellbeing",
            description: "Music therapy-inspired recommendations to support your mental health and emotional journey.",
            color: "from-red-500 to-pink-500"
        },
        {
            icon: Zap,
            title: "Real-time Adaptation",
            description: "Dynamic playlist adjustments based on your feedback and changing mood throughout the day.",
            color: "from-yellow-500 to-orange-500"
        },
        {
            icon: Shield,
            title: "Privacy First",
            description: "Your emotional data is encrypted and secure. We prioritize your privacy above everything else.",
            color: "from-green-500 to-teal-500"
        },
        {
            icon: Star,
            title: "Premium Experience",
            description: "Ad-free listening, unlimited skips, and exclusive access to mood-based radio stations.",
            color: "from-indigo-500 to-blue-500"
        }
    ];

    const plans = [
        {
            name: "Free",
            price: "0",
            period: "forever",
            description: "Perfect for getting started with mood-based music",
            features: [
                "3 mood assessments per day",
                "Basic playlist generation",
                "Limited song skips",
                "Standard audio quality",
                "Community support"
            ],
            cta: "Get Started Free",
            popular: false
        },
        {
            name: "Premium",
            price: "9.99",
            period: "month",
            description: "Unlock the full power of mood-based music discovery",
            features: [
                "Unlimited mood assessments",
                "Advanced AI curation",
                "Unlimited skips",
                "High-quality audio",
                "Mood history & analytics",
                "Custom mood presets",
                "Priority support"
            ],
            cta: "Start Premium",
            popular: true
        },
        {
            name: "Family",
            price: "14.99",
            period: "month",
            description: "Premium features for up to 6 family members",
            features: [
                "All Premium features",
                "6 individual accounts",
                "Family mood insights",
                "Parental controls",
                "Shared playlists",
                "Family dashboard"
            ],
            cta: "Choose Family",
            popular: false
        }
    ];

    const benefits = [
        {
            icon: Target,
            title: "Precision Matching",
            description: "Our AI understands the subtle nuances of emotions and maps them to the perfect musical elements."
        },
        {
            icon: Users,
            title: "Community Driven",
            description: "Learn from millions of users' mood-music associations to enhance your own experience."
        },
        {
            icon: Headphones,
            title: "Immersive Experience",
            description: "High-quality audio with spatial sound support for the most immersive listening experience."
        },
        {
            icon: Sparkles,
            title: "Continuous Learning",
            description: "The more you use Spotimood, the better it gets at understanding your unique musical preferences."
        }
    ];

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
                            <Music className="w-5 h-5" />
                            Our Services
                        </span>
                    </div>
                    
                    <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                            Transform Your Music
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Experience
                        </span>
                    </h1>
                    
                    <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                        Discover our comprehensive suite of services designed to create the perfect musical journey 
                        tailored to your emotions, preferences, and wellbeing goals.
                    </p>
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6">Core Features</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Cutting-edge technology meets musical expertise to deliver an unparalleled personalized experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <div key={index} className="group bg-white rounded-2xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <IconComponent className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">{feature.title}</h3>
                                    <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* How It Benefits You */}
            <div className="py-20 px-6 bg-white/60 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6">Why Choose Spotimood?</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Experience the difference with our innovative approach to music discovery and emotional wellbeing.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {benefits.map((benefit, index) => {
                            const IconComponent = benefit.icon;
                            return (
                                <div key={index} className="flex items-start space-x-6 p-6 bg-white rounded-xl shadow-md border border-purple-100">
                                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <IconComponent className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3">{benefit.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Pricing Plans */}
            <div className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6">Choose Your Plan</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Start free and upgrade anytime. All plans include our core mood-based music discovery features.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan, index) => (
                            <div key={index} className={`relative bg-white rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 transform hover:scale-105 ${plan.popular ? 'border-purple-500 shadow-purple-200' : 'border-purple-100'}`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                                    <div className="mb-4">
                                        <span className="text-4xl font-bold text-gray-800">${plan.price}</span>
                                        <span className="text-gray-600">/{plan.period}</span>
                                    </div>
                                    <p className="text-gray-600">{plan.description}</p>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center space-x-3">
                                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                <ChevronRight className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button 
                                    onClick={() => navigate('/auth')}
                                    className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
                                        plan.popular 
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                    }`}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Service Showcase */}
            <div className="py-20 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6">Experience the Magic</h2>
                    <p className="text-xl leading-relaxed mb-8">
                        Join millions of users who have transformed their relationship with music through our innovative platform.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-2">50M+</div>
                            <div className="text-lg opacity-90">Songs Analyzed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-2">1M+</div>
                            <div className="text-lg opacity-90">Happy Users</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-2">99.9%</div>
                            <div className="text-lg opacity-90">Uptime</div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={() => navigate('/auth')}
                            className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                        >
                            Start Your Free Trial
                        </button>
                        <button 
                            onClick={() => navigate('/about')}
                            className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-purple-600 transition-all duration-300"
                        >
                            Learn More
                        </button>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
                    </div>

                    <div className="space-y-6">
                        {[
                            {
                                question: "How does Spotimood analyze my mood?",
                                answer: "We use a combination of psychological assessment techniques and machine learning to understand your emotional state through a series of intuitive questions about your feelings, energy level, and preferences."
                            },
                            {
                                question: "Can I use Spotimood with my existing music service?",
                                answer: "Yes! Spotimood integrates with popular music streaming services including Spotify, Apple Music, and YouTube Music to create playlists on your preferred platform."
                            },
                            {
                                question: "Is my emotional data private and secure?",
                                answer: "Absolutely. We use end-to-end encryption for all emotional data and never share personal information with third parties. Your privacy is our top priority."
                            },
                            {
                                question: "How accurate are the mood-based recommendations?",
                                answer: "Our AI achieves 95%+ accuracy in mood matching based on user feedback. The system continuously learns from your preferences to improve recommendations over time."
                            }
                        ].map((faq, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-purple-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">{faq.question}</h3>
                                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 