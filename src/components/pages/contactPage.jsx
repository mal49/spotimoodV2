import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, MessageCircle, Heart, Star, CheckCircle, User, Music, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ContactPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setIsSubmitting(false);
        setIsSubmitted(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: '',
                type: 'general'
            });
        }, 3000);
    };

    const contactMethods = [
        {
            icon: Mail,
            title: "Email Support",
            description: "Get in touch with our support team",
            value: "support@spotimood.com",
            action: "mailto:support@spotimood.com",
            color: "from-blue-500 to-indigo-500"
        },
        {
            icon: MessageCircle,
            title: "Live Chat",
            description: "Chat with us in real-time",
            value: "Available 24/7",
            action: "#chat",
            color: "from-green-500 to-teal-500"
        },
        {
            icon: Phone,
            title: "Phone Support",
            description: "Speak directly with our team",
            value: "+60 3-5544 3322",
            action: "tel:+60355443322",
            color: "from-purple-500 to-pink-500"
        }
    ];

    const supportCategories = [
        {
            icon: HelpCircle,
            title: "General Support",
            description: "Questions about using Spotimood",
            topics: ["Account setup", "Basic features", "Getting started"]
        },
        {
            icon: Music,
            title: "Technical Issues",
            description: "Problems with the app or playback",
            topics: ["Playback issues", "Login problems", "App crashes"]
        },
        {
            icon: Star,
            title: "Feedback",
            description: "Share your thoughts and suggestions",
            topics: ["Feature requests", "User experience", "Improvements"]
        },
        {
            icon: Heart,
            title: "Partnership",
            description: "Business inquiries and collaborations",
            topics: ["Business partnerships", "API access", "Licensing"]
        }
    ];

    const offices = [
        {
            city: "Shah Alam",
            address: "123 Jalan Teknologi, Seksyen 7, 40000 Shah Alam, Selangor",
            phone: "+60 3-5544 3322",
            email: "shahalam@spotimood.com"
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
                            <MessageCircle className="w-5 h-5" />
                            Get in Touch
                        </span>
                    </div>
                    
                    <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                            We're Here to
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Help You
                        </span>
                    </h1>
                    
                    <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                        Have questions, feedback, or need support? Our dedicated team is ready to assist you 
                        with anything related to your Spotimood experience.
                    </p>
                </div>
            </div>

            {/* Contact Methods */}
            <div className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6">How Can We Help?</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Choose the contact method that works best for you. We're committed to responding quickly and thoroughly.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {contactMethods.map((method, index) => {
                            const IconComponent = method.icon;
                            return (
                                <a 
                                    key={index}
                                    href={method.action}
                                    className="group bg-white rounded-2xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center"
                                >
                                    <div className={`w-16 h-16 bg-gradient-to-r ${method.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <IconComponent className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{method.title}</h3>
                                    <p className="text-gray-600 mb-4">{method.description}</p>
                                    <div className="text-purple-600 font-medium">{method.value}</div>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Contact Form and Support Categories */}
            <div className="py-20 px-6 bg-white/60 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Send us a Message</h2>
                            <p className="text-gray-600 mb-8">
                                Fill out the form below and we'll get back to you as soon as possible.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                    >
                                        <option value="general">General Support</option>
                                        <option value="technical">Technical Issues</option>
                                        <option value="feedback">Feedback</option>
                                        <option value="partnership">Partnership</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                        placeholder="Brief description of your inquiry"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                                        placeholder="Please provide as much detail as possible..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || isSubmitted}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Sending...</span>
                                        </>
                                    ) : isSubmitted ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Message Sent!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            <span>Send Message</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Support Categories */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Support Categories</h2>
                            <p className="text-gray-600 mb-8">
                                Browse our support categories to find the help you need quickly.
                            </p>

                            <div className="space-y-6">
                                {supportCategories.map((category, index) => {
                                    const IconComponent = category.icon;
                                    return (
                                        <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-purple-100">
                                            <div className="flex items-start space-x-4">
                                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <IconComponent className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{category.title}</h3>
                                                    <p className="text-gray-600 mb-3">{category.description}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {category.topics.map((topic, topicIndex) => (
                                                            <span key={topicIndex} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                                                {topic}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Office Locations */}
            <div className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Office</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Visit us at our Shah Alam headquarters or reach out to us directly.
                        </p>
                    </div>

                    <div className="flex justify-center">
                        {offices.map((office, index) => (
                            <div key={index} className="bg-white rounded-xl p-8 shadow-lg border border-purple-100 text-center max-w-md">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">{office.city}</h3>
                                <div className="space-y-2 text-gray-600">
                                    <p className="text-sm">{office.address}</p>
                                    <p className="text-sm">{office.phone}</p>
                                    <p className="text-sm text-purple-600 font-medium">{office.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Business Hours */}
            <div className="py-16 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-6">Support Hours</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Email & Chat Support</h3>
                            <p className="text-lg opacity-90">24/7 Available</p>
                            <p className="text-sm opacity-75">We typically respond within 2 hours</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Phone Support</h3>
                            <p className="text-lg opacity-90">Mon - Fri: 8AM - 8PM GMT+8</p>
                            <p className="text-sm opacity-75">Weekend support: 10AM - 6PM GMT+8</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 