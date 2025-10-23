import React, { memo } from 'react';
import type { InjuryReport } from '../types';

interface InjuryListProps {
    reports: InjuryReport[];
    onViewReport: (report: InjuryReport) => void;
    onDeleteReport: (reportId: string) => void;
    onReprogramReport: (report: InjuryReport) => void;
    onStartChat: (report: InjuryReport) => void;
}

const InjuryList: React.FC<InjuryListProps> = ({ reports, onViewReport, onDeleteReport, onReprogramReport, onStartChat }) => {

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    const handleDelete = (e: React.MouseEvent, reportId: string) => {
        e.stopPropagation(); // Prevent triggering onViewReport
        if (window.confirm("Are you sure you want to delete this report?")) {
            onDeleteReport(reportId);
        }
    };

    if (reports.length === 0) {
        return (
            <div className="text-center p-8 bg-white/5 backdrop-blur-md rounded-lg shadow-2xl border border-white/10">
                <h3 className="text-xl font-semibold text-white">No Reports Found</h3>
                <p className="mt-2 text-gray-400">Generate your first injury report to get started.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4 w-full">
            {reports.map((report, index) => (
                <div 
                    key={report.id}
                    onClick={() => onViewReport(report)}
                    className="group relative bg-brand-secondary-dark/40 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/10 transition-all duration-300 hover:border-brand-accent/80 hover:shadow-brand-accent/10 hover:shadow-2xl cursor-pointer flex justify-between items-center opacity-0 animate-fade-in-up overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <div className="absolute left-0 top-0 h-full w-1 bg-brand-accent/50 transition-all duration-300 group-hover:bg-brand-accent"></div>
                    <div className="pl-4">
                        <h3 className="font-bold text-lg text-gray-100 group-hover:text-white transition-colors">
                            {report.plan.injury}
                        </h3>
                        <p className="text-sm text-gray-400">
                            Generated on: {formatDate(report.createdAt)}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                         <button 
                            onClick={(e) => { e.stopPropagation(); onStartChat(report); }}
                            className="p-2 rounded-full text-gray-400 hover:bg-green-900/50 hover:text-green-300 transition-colors opacity-0 group-hover:opacity-100"
                            aria-label="Chat about this report"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1z" /></svg>
                        </button>
                         <button 
                            onClick={(e) => { e.stopPropagation(); onReprogramReport(report); }}
                            className="p-2 rounded-full text-gray-400 hover:bg-blue-900/50 hover:text-blue-300 transition-colors opacity-0 group-hover:opacity-100"
                            aria-label="Re-analyze report"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                        </button>
                         <button 
                            onClick={(e) => handleDelete(e, report.id)}
                            className="p-2 rounded-full text-gray-400 hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                            aria-label="Delete report"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default memo(InjuryList);