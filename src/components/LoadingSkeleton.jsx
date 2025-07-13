import React from 'react';

const LoadingSkeleton = ({ className = "", lines = 3, showAvatar = false }) => {
    return (
        <div className={`animate-pulse ${className}`}>
            {showAvatar && (
                <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-gray-300 rounded-full h-12 w-12"></div>
                    <div className="space-y-2 flex-1">
                        <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                        <div className="bg-gray-300 h-3 rounded w-1/2"></div>
                    </div>
                </div>
            )}
            
            <div className="space-y-3">
                {Array.from({ length: lines }).map((_, index) => (
                    <div key={index} className="space-y-2">
                        <div className="bg-gray-300 h-4 rounded w-full"></div>
                        {index === lines - 1 && (
                            <div className="bg-gray-300 h-4 rounded w-2/3"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const CardSkeleton = ({ className = "" }) => {
    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-6 animate-pulse ${className}`}>
            <div className="flex items-center space-x-4 mb-4">
                <div className="bg-gray-300 rounded-lg h-12 w-12"></div>
                <div className="space-y-2 flex-1">
                    <div className="bg-gray-300 h-5 rounded w-3/4"></div>
                    <div className="bg-gray-300 h-3 rounded w-1/2"></div>
                </div>
            </div>
            
            <div className="space-y-3">
                <div className="bg-gray-300 h-4 rounded w-full"></div>
                <div className="bg-gray-300 h-4 rounded w-5/6"></div>
                <div className="bg-gray-300 h-4 rounded w-4/6"></div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="bg-gray-300 h-8 rounded w-24"></div>
            </div>
        </div>
    );
};

const ButtonSkeleton = ({ className = "" }) => {
    return (
        <div className={`bg-gray-300 h-10 rounded-lg animate-pulse ${className}`}></div>
    );
};

const ProgressSkeleton = ({ className = "" }) => {
    return (
        <div className={`animate-pulse ${className}`}>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="bg-gray-300 h-4 rounded w-1/3"></div>
                    <div className="bg-gray-300 h-4 rounded w-16"></div>
                </div>
                <div className="bg-gray-200 h-2 rounded-full">
                    <div className="bg-gray-300 h-2 rounded-full w-1/3"></div>
                </div>
                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex items-center space-x-3">
                            <div className="bg-gray-300 h-5 w-5 rounded-full"></div>
                            <div className="bg-gray-300 h-4 rounded flex-1"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export { LoadingSkeleton, CardSkeleton, ButtonSkeleton, ProgressSkeleton };
export default LoadingSkeleton;