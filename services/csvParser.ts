
export function parseCSV<T>(csvText: string): T[] {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) {
        throw new Error("CSV file must contain a header row and at least one data row.");
    }

    const header = lines[0].split(',').map(h => h.trim());
    const dataRows = lines.slice(1);

    return dataRows.map((line, rowIndex) => {
        const values = line.split(',');
        if (values.length !== header.length) {
            console.warn(`Row ${rowIndex + 2} has a different number of columns than the header. Skipping.`);
            return null;
        }

        const entry = {} as T;
        header.forEach((key, index) => {
            const originalValue = values[index]?.trim() || '';
            
            // Clean the value of common symbols before attempting numeric conversion
            const cleanedValue = originalValue.replace(/[\$,%]/g, '');
            
            // Attempt to convert to number if it looks like one, otherwise keep as string
            if (cleanedValue !== '' && !isNaN(Number(cleanedValue))) {
                 (entry as any)[key] = Number(cleanedValue);
            } else {
                 (entry as any)[key] = originalValue;
            }
        });
        return entry;
    }).filter(entry => entry !== null) as T[];
}
