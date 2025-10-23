import React, { useState, useEffect, useCallback } from 'react';
import type { User, DailyLog } from '../types';
import { getLogsForUser, addLog } from '../services/trackingService';
import { generateTrackingFeedback } from '../services/geminiService';
import { showToast } from '../hooks/useToast';
import LoadingSpinner from '../components/LoadingSpinner';
import FeedbackModal from '../components/FeedbackModal';

interface TrackingPageProps {
    user: User;
}

const TrackingPage: React.FC<TrackingPageProps> = ({ user }) => {
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // AI Feedback State
    const [aiFeedback, setAiFeedback] = useState<string | null>(null);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

    // Form state
    const [painLevel, setPainLevel] = useState<number>(5);
    const [sleepQuality, setSleepQuality] = useState<'Poor' | 'Fair' | 'Good' | 'Excellent'>('Good');
    const [injuryFeeling, setInjuryFeeling] = useState<'Worse' | 'Same' | 'Better'>('Same');
    const [hydration, setHydration] = useState<'Low' | 'Adequate' | 'High'>('Adequate');
    const [notes, setNotes] = useState('');

    const fetchLogs = useCallback(async () => {
        try {
            setIsLoading(true);
            const userLogs = await getLogsForUser(user);
            setLogs(userLogs);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch tracking history.');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const resetForm = () => {
        setPainLevel(5);
        setSleepQuality('Good');
        setInjuryFeeling('Same');
        setHydration('Adequate');
        setNotes('');
    };

    const handleCloseModal = () => {
        setAiFeedback(null);
        setIsFeedbackLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const newLogData = { painLevel, sleepQuality, injuryFeeling, hydration, notes };
            const newLog = await addLog(newLogData, user);
            
            setLogs(prev => [newLog, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            
            showToast(`Progress logged!`, 'success');
            resetForm();

            // Generate AI feedback
            setIsFeedbackLoading(true);
            const feedback = await generateTrackingFeedback(newLog);
            setAiFeedback(feedback);
            setIsFeedbackLoading(false);

        } catch (err: any) {
            setError('Failed to save log. Please try again.');
            setAiFeedback(null);
            setIsFeedbackLoading(false);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    const RadioButtonGroup = ({ label, options, selected, onChange, name }: { label: string, options: string[], selected: string, onChange: (value: any) => void, name: string }) => (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
            <div className="flex flex-wrap gap-2">
                {options.map(option => (
                    <label key={option} className={`cursor-pointer px-3 py-1.5 text-sm rounded-full transition-all duration-200 border ${selected === option ? 'bg-brand-accent border-brand-accent text-white shadow-lg' : 'bg-white/5 border-white/10 hover:border-white/30 text-gray-300'}`}>
                        <input type="radio" name={name} value={option} checked={selected === option} onChange={e => onChange(e.target.value)} className="sr-only" />
                        {option}
                    </label>
                ))}
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-5xl mx-auto opacity-0 animate-fade-in-up">
            <FeedbackModal
                isOpen={isFeedbackLoading || !!aiFeedback}
                feedback={aiFeedback}
                isLoading={isFeedbackLoading}
                onClose={handleCloseModal}
            />

            <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-white tracking-tight">Progress Tracking</h2>
                <p className="mt-2 text-lg text-gray-400">Log your daily metrics to monitor your recovery journey.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-2">
                    <div className="sticky top-24 space-y-6">
                         <form onSubmit={handleSubmit} className="p-6 bg-white/5 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 space-y-6">
                            <h3 className="text-xl font-bold text-white">Log Today's Progress</h3>
                            
                            <div>
                                <label htmlFor="painLevel" className="block text-sm font-medium text-gray-300">Pain Level: <span className="font-bold text-brand-accent">{painLevel}</span>/10</label>
                                <input id="painLevel" type="range" min="1" max="10" value={painLevel} onChange={e => setPainLevel(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-accent mt-2" />
                            </div>
                            
                            <RadioButtonGroup name="sleepQuality" label="Sleep Quality" options={['Poor', 'Fair', 'Good', 'Excellent']} selected={sleepQuality} onChange={setSleepQuality} />
                            <RadioButtonGroup name="injuryFeeling" label="How does the injury feel?" options={['Worse', 'Same', 'Better']} selected={injuryFeeling} onChange={setInjuryFeeling} />
                            <RadioButtonGroup name="hydration" label="Hydration" options={['Low', 'Adequate', 'High']} selected={hydration} onChange={setHydration} />

                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-300">Notes (optional)</label>
                                <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 w-full p-2 bg-white/5 border border-white/10 rounded-lg text-gray-200 focus:ring-2 focus:ring-brand-accent transition duration-200 resize-none placeholder-gray-500" placeholder="e.g., Felt a slight twinge during stretches..." />
                            </div>

                            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

                            <button type="submit" disabled={isSubmitting} className="w-full py-2.5 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-brand-accent to-purple-500 hover:from-brand-accent-dark hover:to-purple-600 disabled:bg-gray-600 disabled:bg-none transition-all">
                                {isSubmitting ? 'Saving...' : 'Save Log'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* History Column */}
                <div className="lg:col-span-3">
                     <h3 className="text-xl font-bold text-white mb-4">Your History</h3>
                     {isLoading ? <div className="flex justify-center mt-10"><LoadingSpinner /></div> : 
                     logs.length === 0 ? (
                        <div className="text-center p-8 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                            <p className="text-gray-400">No logs yet. Fill out the form to start tracking your progress!</p>
                        </div>
                     ) : (
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                           {logs.map(log => (
                               <div key={log.id} className="bg-white/5 p-4 rounded-lg border border-white/10">
                                   <p className="text-sm font-semibold text-brand-accent">{formatDate(log.createdAt)}</p>
                                   <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                       <p><span className="font-semibold text-gray-300">Pain:</span> {log.painLevel}/10</p>
                                       <p><span className="font-semibold text-gray-300">Sleep:</span> {log.sleepQuality}</p>
                                       <p><span className="font-semibold text-gray-300">Feeling:</span> {log.injuryFeeling}</p>
                                       <p><span className="font-semibold text-gray-300">Hydration:</span> {log.hydration}</p>
                                   </div>
                                   {log.notes && <p className="text-sm text-gray-400 mt-3 border-t border-white/10 pt-2"><strong>Notes:</strong> {log.notes}</p>}
                               </div>
                           ))}
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default TrackingPage;