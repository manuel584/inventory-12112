import { db } from '../init';
import { GiftCard } from '../../types/database.types';

export const getAllGiftCards = async (): Promise<GiftCard[]> => {
    return await db.getAllAsync<GiftCard>('SELECT * FROM gift_cards ORDER BY name_ar ASC');
};

export const getGiftCardById = async (id: number): Promise<GiftCard | null> => {
    return await db.getFirstAsync<GiftCard>('SELECT * FROM gift_cards WHERE id = ?', [id]);
};

export const createGiftCard = async (card: Omit<GiftCard, 'id'>): Promise<number> => {
    const result = await db.runAsync(
        'INSERT INTO gift_cards (name_ar, sku, is_sold_separately, is_bundled) VALUES (?, ?, ?, ?)',
        [card.name_ar, card.sku, card.is_sold_separately, card.is_bundled]
    );
    return result.lastInsertRowId;
};

export const updateGiftCard = async (id: number, card: Partial<GiftCard>): Promise<void> => {
    const fields = Object.keys(card).map(key => `${key} = ?`).join(', ');
    const values = Object.values(card);
    await db.runAsync(`UPDATE gift_cards SET ${fields} WHERE id = ?`, [...values, id]);
};
