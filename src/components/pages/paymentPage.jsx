import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Smartphone, QrCode } from 'lucide-react';
import Button from '../UI/Button.jsx';

export default function PaymentPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const plan = searchParams.get('plan');
    
    // Plan details for display
    const planDetails = {
        premium: {
            name: 'SpotiMood Premium',
            price: '$9.99/month',
            description: 'Enhanced mood music experience with unlimited features'
        },
        family: {
            name: 'SpotiMood Family',
            price: '$14.99/month',
            description: 'Premium for the whole family with up to 6 accounts'
        }
    };

    const currentPlan = planDetails[plan] || planDetails.premium;

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleBackToSubscription = () => {
        navigate('/subscription');
    };

    return (
        <div className="min-h-screen bg-dark-bg text-text-light">
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Header with back button */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={handleBackToSubscription}
                        className="flex items-center space-x-2 text-text-medium hover:text-text-light transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Plans</span>
                    </button>
                </div>

                {/* Page Title */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-purple to-[#C879E6] bg-clip-text text-transparent">
                        Complete Your Payment
                    </h1>
                    <p className="text-xl text-text-medium">
                        You're upgrading to <span className="text-primary-purple font-semibold">{currentPlan.name}</span>
                    </p>
                </div>

                {/* Main Payment Section */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Plan Info */}
                    <div className="space-y-6">
                        <div className="bg-dark-card rounded-2xl p-8 border border-dark-hover">
                            <h3 className="text-2xl font-bold mb-4">{currentPlan.name}</h3>
                            <p className="text-text-medium mb-6">{currentPlan.description}</p>
                            
                            <div className="border-t border-dark-hover pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg">Monthly Subscription</span>
                                    <span className="text-xl font-bold text-primary-purple">{currentPlan.price}</span>
                                </div>
                                <p className="text-sm text-text-medium">
                                    You can cancel anytime. No hidden fees.
                                </p>
                            </div>
                        </div>

                        {/* Payment Instructions */}
                        <div className="bg-dark-card rounded-2xl p-6 border border-dark-hover">
                            <div className="flex items-center space-x-3 mb-4">
                                <QrCode className="w-6 h-6 text-primary-purple" />
                                <h4 className="text-lg font-semibold">Payment Instructions</h4>
                            </div>
                            <ol className="space-y-3 text-text-medium">
                                <li className="flex items-start space-x-3">
                                    <span className="bg-primary-purple text-text-light text-sm rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">1</span>
                                    <span>Scan the QR code with your mobile banking app or e-wallet</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <span className="bg-primary-purple text-text-light text-sm rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">2</span>
                                    <span>Confirm the payment amount matches your selected plan</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <span className="bg-primary-purple text-text-light text-sm rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">3</span>
                                    <span>Complete the payment and your subscription will be activated instantly</span>
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* Right Side - QR Code */}
                    <div className="flex flex-col items-center">
                        <div className="bg-white rounded-2xl p-8 shadow-2xl">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Maybank</h3>
                                <p className="text-lg text-gray-700 font-semibold">Ikhmal Hanif Bin Soimin</p>
                            </div>
                            
                            {/* QR Code Image */}
                            <div className="flex justify-center mb-6">
                                <img 
                                    src="/qr.jpeg" 
                                    alt="Payment QR Code" 
                                    className="w-64 h-64 object-contain"
                                />
                            </div>
                            
                            <p className="text-center text-gray-600 text-sm">
                                Show your QR code to your friends or<br />
                                family to receive money
                            </p>
                        </div>

                        {/* Alternative Payment Methods */}
                        <div className="mt-8 text-center">
                            <p className="text-text-medium mb-4">Having trouble with QR payment?</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button className="bg-dark-card text-text-light border border-dark-hover hover:bg-dark-hover px-6 py-2">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Bank Transfer
                                </Button>
                                <Button className="bg-dark-card text-text-light border border-dark-hover hover:bg-dark-hover px-6 py-2">
                                    <Smartphone className="w-4 h-4 mr-2" />
                                    E-Wallet
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-16 text-center bg-gradient-to-r from-primary-purple/10 to-[#C879E6]/10 rounded-2xl p-8">
                    <h3 className="text-xl font-bold mb-4">Need Help?</h3>
                    <p className="text-text-medium mb-6">
                        If you encounter any issues with payment, our support team is here to help.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={handleBackToHome}
                            className="bg-primary-purple text-text-light hover:bg-[#C879E6] px-6 py-3"
                        >
                            Back to Homepage
                        </Button>
                        <Button className="bg-transparent text-text-light border border-primary-purple hover:bg-primary-purple/10 px-6 py-3">
                            Contact Support
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
} 