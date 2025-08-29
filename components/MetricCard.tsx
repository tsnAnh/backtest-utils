
import React from 'react';

interface MetricCardProps {
    title: string;
    value: string | number;
    description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, description }) => {
    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-1">
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</h4>
            <p className="mt-2 text-3xl font-bold text-white">{value}</p>
            {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
        </div>
    );
};

export default MetricCard;
