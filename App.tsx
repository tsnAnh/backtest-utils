import React, { useState, useCallback } from 'react';
import type { VaultData, PositionData, VaultResults, PositionResults, VaultFileResult, PositionFileResult } from './types';
import { parseCSV } from './services/csvParser';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';
import { SpinnerIcon, ResetIcon } from './components/Icons';

// Helper to check if an object has the required keys to be considered VaultData
const isVaultData = (headers: string[]): boolean => {
    return headers.includes('total_return_usd') && headers.includes('accumulated_fee_earned');
};

// Helper to check if an object has the required keys to be considered PositionData
const isPositionData = (headers: string[]): boolean => {
    return headers.includes('trigger_reason') && headers.includes('position_width_percentage');
};


const App: React.FC = () => {
    const [vaultFileResults, setVaultFileResults] = useState<VaultFileResult[]>([]);
    const [positionFileResults, setPositionFileResults] = useState<PositionFileResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resetKey, setResetKey] = useState(0);

    const calculateVaultMetrics = useCallback((data: VaultData[]): VaultResults | null => {
        if (data.length === 0) {
            return null;
        }

        const returns = data.map(d => d.total_return_usd).filter(r => typeof r === 'number' && isFinite(r));
        if (returns.length === 0) return null;

        const highestProfit = Math.max(...returns);
        const lowestProfit = Math.min(...returns);

        // Filter for entries with valid timestamps to prevent "Invalid time value" errors
        const dataWithValidTimestamps = data.filter(d => d.timestamp && !isNaN(new Date(d.timestamp as string | number).getTime()));

        if (dataWithValidTimestamps.length === 0) {
            // If no valid timestamps, we can't determine the latest entry for fees.
            return { highestProfit, lowestProfit, totalFeeReturned: NaN, totalGasFee: NaN, finalTotalValueUSD: NaN };
        }

        const sortedByTime = dataWithValidTimestamps.sort((a, b) => 
            new Date(b.timestamp as string | number).getTime() - new Date(a.timestamp as string | number).getTime()
        );
        const latestEntry = sortedByTime[0];

        const totalFeeReturned = latestEntry.accumulated_fee_earned;
        const totalGasFee = latestEntry.accumulated_gas_fee;
        const finalTotalValueUSD = latestEntry.total_value_usd;

        return { highestProfit, lowestProfit, totalFeeReturned, totalGasFee, finalTotalValueUSD };
    }, []);

    const calculatePositionMetrics = useCallback((data: PositionData[]): PositionResults | null => {
        if (data.length === 0) {
            return null;
        }
        
        // Daily out-of-range count
        const outOfRangeCount = data.filter(d => d.trigger_reason === "Position out of range").length;

        // Filter for entries with valid timestamps to prevent "Invalid time value" errors
        const dataWithValidTimestamps = data.filter(d => d.timestamp && !isNaN(new Date(d.timestamp as string | number).getTime()));
        
        const uniqueDays = new Set(dataWithValidTimestamps.map(d => new Date(d.timestamp as string | number).toISOString().split('T')[0])).size;
        const dailyOutOfRangeCount = uniqueDays > 0 ? outOfRangeCount / uniqueDays : 0;

        // Average price range
        if (dataWithValidTimestamps.length === 0) {
            return { dailyOutOfRangeCount, avgPriceRangeLast30Days: NaN };
        }
        
        const openPositions = dataWithValidTimestamps.filter(d => d.event_type === "OPEN");
        const sumOfWidths = openPositions.reduce((sum, d) => sum + d.position_width_percentage, 0);
        const countOfOpens = openPositions.length;
        
        // Corrected calculation to match: (SUMIF / COUNTIF) / 2
        const avgPriceRangeLast30Days = countOfOpens > 0 ? (sumOfWidths / countOfOpens) / 2 : 0;
        
        return { dailyOutOfRangeCount, avgPriceRangeLast30Days };
    }, []);

    const handleFileChange = async (files: FileList) => {
        if (!files || files.length === 0) return;
        setIsLoading(true);
        setError(null);
        let unknownFileErrors: string[] = [];

        try {
            const processFile = async (file: File): Promise<{ type: 'vault' | 'position' | 'error', data: any }> => {
                const content = await file.text();
                const parsedData = parseCSV<Record<string, any>>(content);
                if (parsedData.length === 0) {
                    return { type: 'error', data: `File ${file.name} is empty or invalid.` };
                }
                const headers = Object.keys(parsedData[0]);

                if (isVaultData(headers)) {
                    const results = calculateVaultMetrics(parsedData as VaultData[]);
                    return { type: 'vault', data: results ? { fileName: file.name, results } : null };
                } else if (isPositionData(headers)) {
                    const results = calculatePositionMetrics(parsedData as PositionData[]);
                    return { type: 'position', data: results ? { fileName: file.name, results } : null };
                } else {
                     unknownFileErrors.push(file.name);
                    return { type: 'error', data: null };
                }
            };
            
            const resultsPromises = Array.from(files).map(processFile);
            const resolvedResults = await Promise.all(resultsPromises);

            const newVaultResults = resolvedResults
                .filter(r => r.type === 'vault' && r.data)
                .map(r => r.data as VaultFileResult);
            
            const newPositionResults = resolvedResults
                .filter(r => r.type === 'position' && r.data)
                .map(r => r.data as PositionFileResult);

            setVaultFileResults(prev => [...prev, ...newVaultResults]);
            setPositionFileResults(prev => [...prev, ...newPositionResults]);
            
            if (unknownFileErrors.length > 0) {
                 setError(`Could not determine format for: ${unknownFileErrors.join(', ')}. Please check file columns.`);
            }

        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during parsing.';
            setError(`Failed to parse files. Please check file formats. Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setVaultFileResults([]);
        setPositionFileResults([]);
        setError(null);
        setIsLoading(false);
        setResetKey(prevKey => prevKey + 1);
    };

    const hasResults = vaultFileResults.length > 0 || positionFileResults.length > 0;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-6xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                        Backtest Horizon
                    </h1>
                    <p className="mt-2 text-lg text-gray-400">
                        Upload Vault & Position CSV files to get key performance insights.
                    </p>
                </header>
                
                <main>
                    <div className="max-w-2xl mx-auto mb-6">
                        <FileUpload 
                            key={`upload-${resetKey}`}
                            title="Upload CSV Data"
                            onFileSelect={(files) => handleFileChange(files)} 
                            id="unified-upload"
                        />
                    </div>

                    {hasResults && !isLoading && (
                         <div className="flex justify-end mb-6">
                            <button
                                onClick={handleReset}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500"
                                aria-label="Reset all data and start over"
                            >
                                <ResetIcon />
                                <span className="ml-2 font-semibold">Reset</span>
                            </button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex justify-center items-center p-10">
                            <SpinnerIcon />
                            <span className="ml-3 text-lg">Processing data...</span>
                        </div>
                    )}

                    {error && (
                         <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded-lg relative my-4" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    
                    {hasResults && !isLoading && (
                       <ResultsDisplay vaultFileResults={vaultFileResults} positionFileResults={positionFileResults} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;