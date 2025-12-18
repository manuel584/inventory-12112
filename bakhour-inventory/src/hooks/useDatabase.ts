import { useEffect, useState } from 'react';
import { initDatabase } from '../database/init';
import { seedDatabase } from '../database/seeds';

export const useDatabase = () => {
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const setup = async () => {
            try {
                await initDatabase();
                await seedDatabase();
                setIsReady(true);
            } catch (e) {
                setError(e as Error);
            }
        };

        setup();
    }, []);

    return { isReady, error };
};
