import { db } from '../init';
import { Sample } from '../../types/database.types';

export const getAllSamples = async (): Promise<Sample[]> => {
    return await db.getAllAsync<Sample>('SELECT * FROM samples WHERE is_active = 1 ORDER BY name_ar ASC');
};

export const createSample = async (sample: Omit<Sample, 'id' | 'is_active'>): Promise<number> => {
    const result = await db.runAsync(
        'INSERT INTO samples (name_ar, weight_grams) VALUES (?, ?)',
        [sample.name_ar, sample.weight_grams]
    );
    return result.lastInsertRowId;
};

export const updateSample = async (id: number, sample: Partial<Sample>): Promise<void> => {
    const fields = Object.keys(sample).map(key => `${key} = ?`).join(', ');
    const values = Object.values(sample);
    await db.runAsync(`UPDATE samples SET ${fields} WHERE id = ?`, [...values, id]);
};
