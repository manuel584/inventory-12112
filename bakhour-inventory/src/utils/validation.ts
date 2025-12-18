export const validateSKU = (sku: string): boolean => {
    // Example: MALT-BK-XXXXX
    const regex = /^[A-Z0-9-]+$/;
    return regex.test(sku) && sku.length >= 5;
};

export const validateQuantity = (qty: number): boolean => {
    return Number.isInteger(qty) && qty > 0;
};

export const validateCSVStructure = (data: any[]): boolean => {
    if (!data || data.length === 0) return false;
    const firstRow = data[0];
    // Check for required columns (flexible matching)
    const requiredKeys = ['Order Number', 'Product SKU', 'Quantity'];
    const keys = Object.keys(firstRow);
    return requiredKeys.every(req => keys.some(k => k.toLowerCase().includes(req.toLowerCase())));
};
