import React, { useState } from 'react';
import type { VaultFileResult, PositionFileResult } from '../types';

interface ResultsDisplayProps {
    vaultFileResults: VaultFileResult[];
    positionFileResults: PositionFileResult[];
}

const CopyableCell: React.FC<{ valueToCopy: string | number; children: React.ReactNode }> = ({ valueToCopy, children }) => {
    const [isCopied, setIsCopied] = useState(false);

    // Check if the value is not applicable (NaN or not a finite number)
    const isNA = isNaN(Number(valueToCopy)) || !isFinite(Number(valueToCopy));

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isNA) return; // Don't copy if it's N/A

        navigator.clipboard.writeText(String(valueToCopy)).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 1500);
        }).catch(err => console.error('Failed to copy text: ', err));
    };

    // Apply styles for feedback and interactivity
    const cellClasses = [
        'h-full',
        'w-full',
        'flex',
        'items-center',
        'transition-all',
        'duration-300',
        'rounded-md',
        '-m-2', // negative margin to expand clickable area
        'p-2', // padding to counteract negative margin
        isNA ? 'cursor-default' : 'cursor-pointer',
        isCopied ? 'bg-green-600/30' : (isNA ? '' : 'hover:bg-gray-700/50')
    ].join(' ');

    return (
        <div onClick={handleCopy} className={cellClasses} title={isNA ? undefined : `Click to copy: ${valueToCopy}`}>
            <span className="truncate">{children}</span>
        </div>
    );
};


const renderCellContent = (value: number, prefix = '', suffix = '') => {
    if (isNaN(value) || !isFinite(value)) {
        return <span className="text-gray-500">N/A</span>;
    }
    return <span className="font-mono">{`${prefix}${value}${suffix}`}</span>;
};


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ vaultFileResults, positionFileResults }) => {
    return (
        <div className="space-y-10">
            {vaultFileResults.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-4 border-b-2 border-indigo-500 pb-2">Vault Analytics</h2>
                    <div className="bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="w-full">
                            {/* Header */}
                            <div className="grid grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] gap-x-4 px-4 py-3 bg-gray-700/50 font-bold text-sm text-gray-300 text-left">
                                <div className="truncate">File Name</div>
                                <div className="truncate">Highest Profit</div>
                                <div className="truncate">Lowest Profit</div>
                                <div className="truncate">Total Fee Returned</div>
                                <div className="truncate">Total Gas Fee</div>
                            </div>
                            {/* Body */}
                            <div className="divide-y divide-gray-700">
                                {vaultFileResults.map(({ fileName, results }) => (
                                    <div key={fileName} className="grid grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] gap-x-4 px-4 py-3 text-sm items-center">
                                        <div className="truncate font-medium" title={fileName}>{fileName}</div>
                                        <td><CopyableCell valueToCopy={results.highestProfit}>{renderCellContent(results.highestProfit, '$')}</CopyableCell></td>
                                        <td><CopyableCell valueToCopy={results.lowestProfit}>{renderCellContent(results.lowestProfit, '$')}</CopyableCell></td>
                                        <td><CopyableCell valueToCopy={results.totalFeeReturned}>{renderCellContent(results.totalFeeReturned, '$')}</CopyableCell></td>
                                        <td><CopyableCell valueToCopy={results.totalGasFee}>{renderCellContent(results.totalGasFee, '$')}</CopyableCell></td>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {positionFileResults.length > 0 && (
                 <section>
                    <h2 className="text-2xl font-bold mb-4 border-b-2 border-purple-500 pb-2">Position Analytics</h2>
                     <div className="bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="w-full">
                            {/* Header */}
                            <div className="grid grid-cols-[minmax(0,3fr)_repeat(2,minmax(0,2fr))] gap-x-4 px-4 py-3 bg-gray-700/50 font-bold text-sm text-gray-300 text-left">
                                <div className="truncate">File Name</div>
                                <div className="truncate">Daily Out-of-Range Count</div>
                                <div className="truncate">Avg. Price Range</div>
                            </div>
                            {/* Body */}
                            <div className="divide-y divide-gray-700">
                                {positionFileResults.map(({ fileName, results }) => (
                                    <div key={fileName} className="grid grid-cols-[minmax(0,3fr)_repeat(2,minmax(0,2fr))] gap-x-4 px-4 py-3 text-sm items-center">
                                        <div className="truncate font-medium" title={fileName}>{fileName}</div>
                                        <td><CopyableCell valueToCopy={results.dailyOutOfRangeCount}>{renderCellContent(results.dailyOutOfRangeCount)}</CopyableCell></td>
                                        <td><CopyableCell valueToCopy={results.avgPriceRangeLast30Days}>{renderCellContent(results.avgPriceRangeLast30Days, '', '%')}</CopyableCell></td>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default ResultsDisplay;