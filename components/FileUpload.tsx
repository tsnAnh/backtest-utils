import React, { useState } from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
    title: string;
    id: string;
    onFileSelect: (files: FileList) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ title, id, onFileSelect }) => {
    const [fileCount, setFileCount] = useState<number>(0);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            setFileCount(files.length);
            if (files.length > 0) {
              onFileSelect(files);
            }
        }
        // Reset the input so the same file(s) can be selected again
        event.target.value = '';
    };

    return (
        <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors duration-300">
            <label htmlFor={id} className="cursor-pointer flex flex-col items-center">
                <UploadIcon />
                <h3 className="mt-2 text-xl font-semibold text-gray-200">{title}</h3>
                <p className="mt-1 text-sm text-gray-400">
                    {fileCount > 0 ? `${fileCount} file(s) selected` : 'Click to browse or drag and drop files'}
                </p>
                <input
                    id={id}
                    name={id}
                    type="file"
                    className="sr-only"
                    accept=".csv"
                    multiple
                    onChange={handleFileChange}
                />
            </label>
        </div>
    );
};

export default FileUpload;