import React, { useState } from 'react';

type PlanName = 'Starter Recovery' | 'Smart Recovery' | 'Coach / Physio';

const pricingPlans = [
    {
        name: 'Starter Recovery' as PlanName,
        description: 'Get started with essential AI-powered recovery tools. Perfect for occasional injuries.',
        features: [
            '6 AI Injury Scans per month',
            'Static Recovery Plan',
            'Basic Progress Tracking',
            'Daily Reminders'
        ],
        isPopular: false,
    },
    {
        name: 'Smart Recovery' as PlanName,
        description: 'Unlock a dynamic and personalized recovery experience that adapts to your progress.',
        features: [
            'Unlimited AI Injury Scans',
            'Adaptive Recovery Plan',
            'Advanced Progress Tracking',
            'Daily Reminders'
        ],
        isPopular: true,
    },
    {
        name: 'Coach / Physio' as PlanName,
        description: 'For professionals managing multiple clients, offering streamlined oversight and reporting.',
        features: [
            'All Smart Recovery Features',
            'Manage up to 3 Users',
            'Export Recovery Summaries'
        ],
        isPopular: false,
    }
];


const PricingPage: React.FC = () => {
    const [subscribedPlan, setSubscribedPlan] = useState<PlanName>('Starter Recovery');

    return (
        <div className="w-full max-w-5xl mx-auto opacity-0 animate-fade-in-up">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white tracking-tight">Available Plans</h2>
                <p className="mt-3 text-lg text-gray-400">Select the plan that best fits your recovery journey.</p>
            </div>

            {/* Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {pricingPlans.map(plan => {
                    const isCurrentPlan = subscribedPlan === plan.name;
                    
                    return (
                        <div
                            key={plan.name}
                            className={`relative p-8 rounded-2xl shadow-2xl flex flex-col ${
                                plan.isPopular ? 'bg-brand-secondary-dark border-2 border-brand-accent' : 'bg-white/5 border border-white/10'
                            }`}
                        >
                            {plan.isPopular && (
                                <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
                                    <span className="px-4 py-1 text-sm font-semibold text-white bg-brand-accent rounded-full">Most Popular</span>
                                </div>
                            )}
                            <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                            <p className="mt-4 text-gray-400 text-sm h-16">{plan.description}</p>
                            
                            <ul className="mt-8 space-y-4 text-sm text-gray-300 flex-grow">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-center gap-3"><CheckIcon /> {feature}</li>
                                ))}
                            </ul>
                            
                            {isCurrentPlan ? (
                                <button className="mt-10 w-full py-3 px-6 rounded-lg font-semibold text-white bg-white/10 cursor-default" disabled>
                                    Current Plan
                                </button>
                            ) : (
                                <button className={`mt-10 w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${plan.isPopular ? 'bg-brand-accent hover:bg-brand-accent-dark' : 'bg-white/10 hover:bg-white/20'}`} onClick={() => setSubscribedPlan(plan.name)}>
                                    Switch to Plan
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* Comparison Table */}
            <div className="mt-20">
                <h3 className="text-2xl font-bold text-white text-center mb-8">Feature Comparison</h3>
                <div className="bg-white/5 border border-white/10 rounded-lg overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-300 uppercase bg-white/5">
                            <tr>
                                <th scope="col" className="px-6 py-3">Feature</th>
                                <th scope="col" className="px-6 py-3 text-center">Starter Recovery</th>
                                <th scope="col" className="px-6 py-3 text-center">Smart Recovery</th>
                                <th scope="col" className="px-6 py-3 text-center">Coach / Physio</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-white/10">
                                <th scope="row" className="px-6 py-4 font-medium text-white">AI Injury Scans</th>
                                <td className="px-6 py-4 text-center">6 per month</td>
                                <td className="px-6 py-4 text-center">Unlimited</td>
                                <td className="px-6 py-4 text-center">Unlimited</td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <th scope="row" className="px-6 py-4 font-medium text-white">Recovery Plan Type</th>
                                <td className="px-6 py-4 text-center">Static</td>
                                <td className="px-6 py-4 text-center text-brand-accent font-semibold">Adaptive</td>
                                <td className="px-6 py-4 text-center text-brand-accent font-semibold">Adaptive</td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <th scope="row" className="px-6 py-4 font-medium text-white">Progress Tracking</th>
                                <td className="px-6 py-4 text-center">Basic</td>
                                <td className="px-6 py-4 text-center">Advanced</td>
                                <td className="px-6 py-4 text-center">Advanced</td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <th scope="row" className="px-6 py-4 font-medium text-white">Multi-User Management</th>
                                <td className="px-6 py-4 text-center"><CrossIcon /></td>
                                <td className="px-6 py-4 text-center"><CrossIcon /></td>
                                <td className="px-6 py-4 text-center">Up to 3 users</td>
                            </tr>
                            <tr>
                                <th scope="row" className="px-6 py-4 font-medium text-white">Export Summaries</th>
                                <td className="px-6 py-4 text-center"><CrossIcon /></td>
                                <td className="px-6 py-4 text-center"><CrossIcon /></td>
                                <td className="px-6 py-4 text-center"><CheckIcon /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const CrossIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mx-auto" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


export default PricingPage;