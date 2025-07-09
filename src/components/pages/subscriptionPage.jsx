import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../UI/Button.jsx';
import { Music, Brain, Headphones, Check } from 'lucide-react';

export default function SubscriptionPage() {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState(null);

    const plans = [
        {
            id: 'free',
            name: 'SpotiMood Free',
            price: '$0',
            period: '/month',
            description: 'Basic mood-based music discovery',
            features: [
                'Mood-based playlist generation',
                'Limited skips per day',
                'Basic mood analysis',
                'Ads between songs',
                'Standard audio quality'
            ],
            buttonText: 'Current Plan',
            buttonStyle: 'bg-dark-card text-text-medium cursor-not-allowed',
            popular: false
        },
        {
            id: 'premium',
            name: 'SpotiMood Premium',
            price: '$9.99',
            period: '/month',
            description: 'Enhanced mood music experience',
            features: [
                'All Free features',
                'Unlimited mood playlists',
                'Advanced mood analytics',
                'Ad-free listening',
                'High-quality audio',
                'Offline downloads',
                'Personalized mood insights'
            ],
            buttonText: 'Start Premium',
            buttonStyle: 'bg-primary-purple text-text-light hover:bg-[#C879E6]',
            popular: true
        },
        {
            id: 'family',
            name: 'SpotiMood Family',
            price: '$14.99',
            period: '/month',
            description: 'Premium for the whole family',
            features: [
                'All Premium features',
                'Up to 6 accounts',
                'Individual mood profiles',
                'Family mood sharing',
                'Parental controls',
                'Separate listening preferences',
                'Family playlist collaboration'
            ],
            buttonText: 'Start Family Plan',
            buttonStyle: 'bg-primary-purple text-text-light hover:bg-[#C879E6]',
            popular: false
        }
    ];

    const handleSelectPlan = (planId) => {
        setSelectedPlan(planId);
        
        if (planId === 'premium' || planId === 'family') {
            // Navigate to payment page with plan parameter
            navigate(`/payment?plan=${planId}`);
        } else {
            // For free plan, just log (or handle differently)
            console.log(`Selected plan: ${planId}`);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg text-text-light">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary-purple to-[#C879E6] bg-clip-text text-transparent">
                        Choose Your SpotiMood Experience
                    </h1>
                    <p className="text-xl text-text-medium max-w-3xl mx-auto">
                        Discover music that matches your mood with our AI-powered playlist generation. 
                        Choose the plan that fits your lifestyle.
                    </p>
                </div>

                {/* Features Highlight */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-purple rounded-full flex items-center justify-center mx-auto mb-4">
                            <Music className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Mood-Based Discovery</h3>
                        <p className="text-text-medium">AI analyzes your mood to create perfect playlists</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-purple rounded-full flex items-center justify-center mx-auto mb-4">
                            <Brain className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Smart Analytics</h3>
                        <p className="text-text-medium">Track your mood patterns and music preferences</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-purple rounded-full flex items-center justify-center mx-auto mb-4">
                            <Headphones className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
                        <p className="text-text-medium">High-quality audio for the best listening experience</p>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div 
                            key={plan.id}
                            className={`relative bg-dark-card rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
                                plan.popular 
                                    ? 'border-primary-purple shadow-lg shadow-primary-purple/20' 
                                    : 'border-dark-hover hover:border-primary-purple/50'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-primary-purple text-text-light px-4 py-2 rounded-full text-sm font-bold">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <p className="text-text-medium mb-4">{plan.description}</p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    <span className="text-text-medium">{plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center space-x-3">
                                        <Check className="w-4 h-4 text-primary-purple" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={() => handleSelectPlan(plan.id)}
                                className={`w-full py-3 text-center transition-colors ${plan.buttonStyle}`}
                                disabled={plan.id === 'free'}
                            >
                                {plan.buttonText}
                            </Button>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-20">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="bg-dark-card p-6 rounded-lg">
                            <h3 className="text-lg font-bold mb-3">Can I cancel anytime?</h3>
                            <p className="text-text-medium">Yes, you can cancel your subscription at any time with no cancellation fees.</p>
                        </div>
                        <div className="bg-dark-card p-6 rounded-lg">
                            <h3 className="text-lg font-bold mb-3">Is there a free trial?</h3>
                            <p className="text-text-medium">Yes! Premium and Family plans include a 30-day free trial.</p>
                        </div>
                        <div className="bg-dark-card p-6 rounded-lg">
                            <h3 className="text-lg font-bold mb-3">How does mood detection work?</h3>
                            <p className="text-text-medium">Our AI analyzes your input and listening patterns to understand your current mood and preferences.</p>
                        </div>
                        <div className="bg-dark-card p-6 rounded-lg">
                            <h3 className="text-lg font-bold mb-3">Can I switch plans?</h3>
                            <p className="text-text-medium">Yes, you can upgrade or downgrade your plan at any time from your account settings.</p>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center mt-16 bg-gradient-to-r from-primary-purple/20 to-[#C879E6]/20 rounded-2xl p-12">
                    <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Music Experience?</h2>
                    <p className="text-xl text-text-medium mb-8">
                        Join thousands of users who've discovered their perfect soundtrack with SpotiMood.
                    </p>
                    <Button
                        onClick={() => handleSelectPlan('premium')}
                        className="bg-primary-purple text-text-light hover:bg-[#C879E6] px-8 py-4 text-lg"
                    >
                        Start Your Free Trial
                    </Button>
                </div>
            </div>
        </div>
    );
} 