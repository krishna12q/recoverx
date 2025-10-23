import type { Exercise } from '../types';

export type LibraryExercise = Exercise & { id: string; category: string; targetArea: string; };

// This list is programmatically generated to simulate a large database.
const bodyParts = ['Ankle', 'Knee', 'Hip', 'Lower Back', 'Upper Back', 'Shoulder', 'Elbow', 'Wrist', 'Core', 'Glutes', 'Hamstrings', 'Quadriceps', 'Calves', 'Chest', 'Biceps', 'Triceps'];
const strengthVerbs = ['Raise', 'Lift', 'Curl', 'Extension', 'Press', 'Hold', 'Squat', 'Lunge', 'Row', 'Pull', 'Fly'];
const stretchVerbs = ['Stretch', 'Circle', 'Rotation', 'Flexion', 'Extension', 'Release'];
const balanceVerbs = ['Stand', 'Reach', 'Walk', 'Tap', 'Sway'];
const variations = ['Isometric', 'Eccentric', 'Banded', 'Dumbbell', 'Single Leg', 'Alternating'];

const generatedExercises: Omit<LibraryExercise, 'id'>[] = [];

// Generate Strength Exercises
bodyParts.forEach(part => {
    strengthVerbs.forEach(verb => {
        variations.forEach(variation => {
            // Filter nonsensical combinations
            if ((part.includes('Back') || part === 'Core') && (verb === 'Squat' || verb === 'Lunge')) return;
            if ((part === 'Wrist' || part === 'Elbow') && (verb === 'Squat' || verb === 'Lunge')) return;
            if (verb === 'Squat' && !['Glutes', 'Quadriceps', 'Hamstrings'].includes(part)) return;
            if (verb === 'Lunge' && !['Glutes', 'Quadriceps', 'Hamstrings'].includes(part)) return;
            if (['Single Leg', 'Alternating'].includes(variation) && ['Core', 'Chest', 'Upper Back', 'Lower Back'].includes(part)) return;

            generatedExercises.push({
                name: `${variation} ${part} ${verb}`,
                category: 'Strengthening',
                targetArea: part,
                description: `A strengthening exercise focusing on the ${part.toLowerCase()}. The ${variation.toLowerCase()} variation emphasizes a specific type of muscle contraction or equipment.`,
                sets: '3',
                reps: '10-15',
                frequency: '3 times a week'
            });
        });
    });
});

// Generate Stretching Exercises
bodyParts.forEach(part => {
    stretchVerbs.forEach(verb => {
        generatedExercises.push({
            name: `Gentle ${part} ${verb}`,
            category: 'Stretching',
            targetArea: part,
            description: `A stretch for the ${part.toLowerCase()} to improve flexibility. Hold the stretch without pain or bouncing.`,
            sets: '2-3',
            reps: 'Hold 20-30s',
            frequency: 'Daily'
        });
    });
});

// Generate Balance Exercises
['Single Leg', 'Tandem', 'Unstable Surface'].forEach(prefix => {
    balanceVerbs.forEach(verb => {
        generatedExercises.push({
            name: `${prefix} ${verb}`,
            category: 'Balance',
            targetArea: 'Full Body',
            description: 'An exercise to improve balance and proprioception. Focus on core stability.',
            sets: '3',
            reps: 'Hold 30-60s',
            frequency: 'Daily'
        });
    });
});

// Add Specific and Cardio Exercises
const specificExercises: Omit<LibraryExercise, 'id'>[] = [
    { name: 'Glute Bridge', category: 'Strengthening', targetArea: 'Glutes, Core', description: 'Lie on your back with knees bent. Lift your hips off the floor until your body forms a straight line from shoulders to knees.', sets: '3', reps: '15', frequency: '3 times a week' },
    { name: 'Plank', category: 'Strengthening', targetArea: 'Core', description: 'Hold a push-up position, keeping your body in a straight line from head to heels.', sets: '3', reps: '30-60s hold', frequency: 'Daily' },
    { name: 'Side Plank', category: 'Strengthening', targetArea: 'Core, Obliques', description: 'Lie on your side, propped up on one elbow. Lift your hips so your body is in a straight line.', sets: '3', reps: '30s each side', frequency: 'Daily' },
    { name: 'Cat-Cow Stretch', category: 'Stretching', targetArea: 'Back', description: 'On hands and knees, alternate between arching and rounding your back.', sets: '2', reps: '10-15 cycles', frequency: 'Daily' },
    { name: 'Dead Bug', category: 'Strengthening', targetArea: 'Core', description: 'Lie on your back, knees bent at 90 degrees. Slowly lower opposite arm and leg.', sets: '3', reps: '10-12 each side', frequency: '3 times a week' },
    { name: 'Clamshells', category: 'Strengthening', targetArea: 'Hips, Glutes', description: 'Lie on your side with knees bent. Lift your top knee while keeping your feet together.', sets: '3', reps: '15-20 each side', frequency: 'Daily' },
    { name: 'Stationary Cycling', category: 'Cardio', targetArea: 'Full Body', description: 'Low-impact cardiovascular exercise.', sets: '1', reps: '20-30 mins', frequency: '3-5 times/week' },
    { name: 'Swimming', category: 'Cardio', targetArea: 'Full Body', description: 'Excellent low-impact cardio that reduces stress on joints.', sets: '1', reps: '30 mins', frequency: '2-3 times/week' },
];

generatedExercises.push(...specificExercises);


// Remove duplicates and ensure Bird-Dog is not present, then assign unique IDs
const uniqueExercises = Array.from(new Map(generatedExercises.map(item => [item.name, item])).values());
const MOCK_LIBRARY_EXERCISES: LibraryExercise[] = uniqueExercises
    .filter(ex => !ex.name.toLowerCase().includes('bird-dog'))
    .map((ex, index) => ({...ex, id: `ex-${String(index + 1).padStart(3, '0')}` }));


export const getAllExercises = (): Promise<LibraryExercise[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_LIBRARY_EXERCISES);
        }, 300); // Simulate network delay
    });
};