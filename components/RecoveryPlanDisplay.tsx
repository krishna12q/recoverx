import React, { memo } from 'react';
import type { InjuryReport } from '../types';

interface RecoveryPlanDisplayProps {
    report: InjuryReport;
    onBack: () => void;
    onReprogram: () => void;
    onStartChat: () => void;
}

const RecoveryPlanDisplay: React.FC<RecoveryPlanDisplayProps> = ({ report, onBack, onReprogram, onStartChat }) => {
    // Simple function to remove common markdown characters
    const cleanText = (text: string) => {
        return text ? text.replace(/[*#]/g, '') : '';
    };

    const plan = report.plan;
    const hasOtcSuggestions = plan.otcSuggestions && plan.otcSuggestions.length > 0;

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 opacity-0 animate-fade-in-up">
            {/* Back Button and Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back to Dashboard
                </button>
                 <div className="flex items-center gap-2 flex-wrap">
                    <button 
                        onClick={onStartChat}
                        className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-semibold text-white bg-brand-accent hover:bg-brand-accent-dark transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1z" /></svg>
                        Discuss with AI
                    </button>
                    <button 
                        onClick={onReprogram}
                        className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                        Re-analyze Injury
                    </button>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                <div className="p-6 sm:p-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{cleanText(plan.injury)} Recovery Plan</h1>
                     <div className="mt-4 flex items-center gap-3 text-brand-accent bg-brand-accent/10 px-3 py-1.5 rounded-full text-sm font-semibold w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                        Estimated Recovery: {plan.estimatedRecoveryTime}
                    </div>
                    <p className="mt-4 text-lg text-gray-300">{cleanText(plan.summary)}</p>
                </div>

                {/* Disclaimer */}
                <div className="bg-red-900/50 border-t border-b border-red-700/50 px-6 sm:px-8 py-4">
                    <h3 className="font-bold text-red-200">Important Disclaimer</h3>
                    <p className="text-sm text-red-300 mt-1">{cleanText(plan.disclaimer)}</p>
                </div>

                {/* OTC Suggestions (if any) */}
                {hasOtcSuggestions && (
                    <div className="px-6 sm:px-8 py-5 border-b border-white/10">
                        <div className="flex items-start gap-3">
                             <div className="flex-shrink-0 text-amber-400 mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-amber-300">Pain Management Suggestions</h3>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-amber-200/90">
                                    {plan.otcSuggestions?.map((suggestion, index) => (
                                        <li key={index}>{cleanText(suggestion)}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}


                {/* Phases */}
                <div className="p-6 sm:p-8 space-y-8">
                    {plan.phases.map((phase, phaseIndex) => (
                        <div key={phaseIndex} className="border-l-4 border-brand-accent pl-6">
                            <h2 className="text-2xl font-bold text-gray-100">{cleanText(phase.phase_name)}</h2>
                            <p className="text-sm font-medium text-gray-400 mt-1">Duration: {phase.duration}</p>

                            <div className="mt-4">
                                <h4 className="font-semibold text-gray-200">Goals:</h4>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300">
                                    {phase.goals.map((goal, goalIndex) => (
                                        <li key={goalIndex}>{cleanText(goal)}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-6">
                                <h4 className="font-semibold text-gray-200 mb-3">Exercises & Activities:</h4>
                                <div className="space-y-4">
                                    {phase.exercises.map((exercise, exIndex) => (
                                        <div key={exIndex} className="bg-white/5 p-4 rounded-lg border border-white/10">
                                            <h5 className="font-bold text-brand-light">{cleanText(exercise.name)}</h5>
                                            <p className="text-sm text-gray-400 mt-2">{cleanText(exercise.description)}</p>
                                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                                                <p><span className="font-semibold text-gray-300">Sets:</span> {exercise.sets}</p>
                                                <p><span className="font-semibold text-gray-300">Reps:</span> {exercise.reps}</p>
                                                <p><span className="font-semibold text-gray-300">Frequency:</span> {exercise.frequency}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default memo(RecoveryPlanDisplay);