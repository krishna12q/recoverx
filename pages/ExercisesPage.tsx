import React, { useState, useEffect, useMemo } from 'react';
import { getAllExercises } from '../services/exerciseService';
import type { LibraryExercise } from '../services/exerciseService';
import LoadingSpinner from '../components/LoadingSpinner';

const ExercisesPage: React.FC = () => {
    const [exercises, setExercises] = useState<LibraryExercise[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const data = await getAllExercises();
                setExercises(data);
            } catch (err) {
                setError('Failed to load exercises. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchExercises();
    }, []);

    const categories = useMemo(() => {
        const uniqueCategories = new Set(exercises.map(ex => ex.category));
        return ['All', ...Array.from(uniqueCategories).sort()];
    }, [exercises]);

    const filteredExercises = useMemo(() => {
        return exercises.filter(ex => {
            const matchesCategory = selectedCategory === 'All' || ex.category === selectedCategory;
            const matchesSearch = searchTerm.trim() === '' || 
                ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                ex.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ex.targetArea.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [exercises, searchTerm, selectedCategory]);

    if (isLoading) {
        return <div className="flex justify-center mt-10"><LoadingSpinner /></div>;
    }

    if (error) {
        return <div className="text-center p-8 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">{error}</div>;
    }

    return (
        <div className="w-full max-w-6xl mx-auto opacity-0 animate-fade-in-up">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-white tracking-tight">Exercise Library</h2>
                <p className="mt-2 text-lg text-gray-400">Browse over 250 exercises to support your recovery. These are for informational purposes only—always consult a professional.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 sticky top-4 z-20">
                <div className="flex-grow">
                    <input 
                        type="text"
                        placeholder="Search exercises by name, target area..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-gray-200 focus:ring-2 focus:ring-brand-accent transition duration-200 placeholder-gray-400"
                    />
                </div>
                <div className="flex-shrink-0">
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="w-full md:w-auto p-3 bg-white/10 border border-white/20 rounded-lg text-gray-200 focus:ring-2 focus:ring-brand-accent transition duration-200"
                    >
                        {categories.map(cat => <option key={cat} value={cat} className="text-brand-dark bg-brand-light">{cat}</option>)}
                    </select>
                </div>
            </div>

            {/* Exercise List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExercises.length > 0 ? (
                    filteredExercises.map((exercise, index) => (
                        <div key={exercise.id} 
                             className="bg-brand-secondary-dark/40 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/10 flex flex-col transition-all duration-300 hover:border-brand-accent/80 hover:shadow-brand-accent/10 hover:shadow-2xl opacity-0 animate-fade-in-up"
                             style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <h3 className="text-xl font-bold text-brand-light">{exercise.name}</h3>
                            <div className="flex items-center gap-2 mt-2 mb-3 text-xs">
                                <span className="px-2 py-1 bg-brand-accent/20 text-brand-accent rounded-full font-semibold">{exercise.category}</span>
                                <span className="px-2 py-1 bg-white/10 text-gray-300 rounded-full font-semibold">{exercise.targetArea}</span>
                            </div>
                            <p className="text-sm text-gray-400 flex-grow">{exercise.description}</p>
                            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-sm text-center">
                                <div><p className="font-semibold text-gray-300">Sets</p><p>{exercise.sets}</p></div>
                                <div><p className="font-semibold text-gray-300">Reps</p><p>{exercise.reps}</p></div>
                                <div><p className="font-semibold text-gray-300">Frequency</p><p>{exercise.frequency}</p></div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="md:col-span-2 lg:col-span-3 text-center p-8 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                        <p className="text-gray-400">No exercises match your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExercisesPage;