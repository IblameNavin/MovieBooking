import React, { useState } from 'react';
import { seedFirestore } from '../seed/seedData';
import { toast } from 'react-toastify';

export const Seeder = () => {
    const [loading, setLoading] = useState(false);
    const [log, setLog] = useState([]);

    const handleSeed = async () => {
        if (!window.confirm("This will WIPE all existing movie/theatre data. Continue?")) return;

        setLoading(true);
        setLog(prev => [...prev, "Starting seed process..."]);

        try {
            // Hijack console.log to show in UI
            const originalLog = console.log;
            console.log = (...args) => {
                setLog(prev => [...prev, args.join(' ')]);
                originalLog(...args);
            };

            await seedFirestore();

            toast.success("Seeding Complete!");
            console.log = originalLog; // Restore
        } catch (error) {
            console.error(error);
            toast.error("Seeding Failed");
            setLog(prev => [...prev, `ERROR: ${error.message}`]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4">Database Seeder</h1>
            <p className="mb-8 text-gray-400">Click below to populate Firebase with real data.</p>

            <button
                onClick={handleSeed}
                disabled={loading}
                className={`px-6 py-3 rounded font-bold text-lg ${loading ? 'bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
            >
                {loading ? 'Seeding...' : 'SEED DATABASE'}
            </button>

            <div className="mt-8 w-full max-w-2xl bg-gray-900 p-4 rounded border border-gray-700 font-mono text-sm h-64 overflow-y-auto">
                {log.map((line, i) => <div key={i}>{line}</div>)}
            </div>
        </div>
    );
};
