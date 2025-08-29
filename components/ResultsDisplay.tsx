import React, { useState } from 'react';
import type { VaultFileResult, PositionFileResult } from '../types';
import { CopyIcon, CheckIcon } from './Icons';

interface ResultsDisplayProps {
    vaultFileResults: VaultFileResult[];
    positionFileResults: PositionFileResult[];
}

const CopyableCell: React.FC<{ valueToCopy: string | number; children: React.ReactNode }> = ({ valueToCopy, children }) => {
    const [isCopied, setIsCopied] = useState(false);

    const onCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(String(valueToCopy)).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => console.error('Failed to copy text: ', err));
    };

    return (
        <div className="group relative flex items-center justify-start h-full">
            <span className="truncate">{children}</span>
            <button
                onClick={onCopy}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-md bg-gray-900/50 text-gray-300 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-indigo-600 hover:text-white transition-all duration-200"
                aria-label={`Copy value ${valueToCopy}`}
            >
                {isCopied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
            </button>
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
                                    <div key={fileName} className="grid grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] gap-x-4 px-4 py-3 text-sm items-center hover:bg-gray-700/30">
                                        <div className="truncate font-medium" title={fileName}>{fileName}</div>
                                        <CopyableCell valueToCopy={results.highestProfit}><span className="font-mono">${results.highestProfit}</span></CopyableCell>
                                        <CopyableCell valueToCopy={results.lowestProfit}><span className="font-mono">${results.lowestProfit}</span></CopyableCell>
                                        <CopyableCell valueToCopy={!isNaN(results.totalFeeReturned) ? results.totalFeeReturned : ''}>{renderCellContent(results.totalFeeReturned, '$')}</CopyableCell>
                                        <CopyableCell valueToCopy={!isNaN(results.totalGasFee) ? results.totalGasFee : ''}>{renderCellContent(results.totalGasFee, '$')}</CopyableCell>
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
                                <div className="truncate">Avg. Price Range (30d)</div>
                            </div>
                            {/* Body */}
                            <div className="divide-y divide-gray-700">
                                {positionFileResults.map(({ fileName, results }) => (
                                    <div key={fileName} className="grid grid-cols-[minmax(0,3fr)_repeat(2,minmax(0,2fr))] gap-x-4 px-4 py-3 text-sm items-center hover:bg-gray-700/30">
                                        <div className="truncate font-medium" title={fileName}>{fileName}</div>
                                        <CopyableCell valueToCopy={results.dailyOutOfRangeCount}><span className="font-mono">{results.dailyOutOfRangeCount}</span></CopyableCell>
                                        <CopyableCell valueToCopy={!isNaN(results.avgPriceRangeLast30Days) ? results.avgPriceRangeLast30Days * 100 : ''}>{renderCellContent(results.avgPriceRangeLast30Days * 100, '', '%')}</CopyableCell>
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