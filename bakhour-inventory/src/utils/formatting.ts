import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const formatDate = (dateString: string, locale: 'ar' | 'en' = 'ar'): string => {
    const date = new Date(dateString);
    return format(date, 'dd MMM yyyy', { locale: locale === 'ar' ? ar : undefined });
};

export const formatNumber = (num: number, locale: 'ar' | 'en' = 'ar'): string => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(num);
};

export const formatSKU = (sku: string): string => {
    return sku.toUpperCase().trim();
};

export const formatWeight = (grams: number): string => {
    if (grams >= 1000) {
        return `${(grams / 1000).toFixed(2)} كيلو`;
    }
    return `${grams} جرام`;
};
