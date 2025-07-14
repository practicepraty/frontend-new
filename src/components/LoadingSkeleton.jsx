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

const PreviewSkeleton = ({ className = "" }) => {
    return (
        <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse ${className}`}>
            {/* Header skeleton */}
            <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-gray-300 h-5 w-5 rounded"></div>
                        <div className="bg-gray-300 h-5 rounded w-32"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="bg-gray-300 h-8 w-8 rounded-lg"></div>
                        <div className="bg-gray-300 h-8 w-8 rounded-lg"></div>
                    </div>
                </div>
                
                {/* Controls skeleton */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="bg-gray-300 h-8 w-20 rounded-md"></div>
                        ))}
                    </div>
                    <div className="bg-gray-300 h-8 w-24 rounded-md"></div>
                </div>
            </div>
            
            {/* Preview content skeleton */}
            <div className="bg-gray-50 p-4">
                <div className="mx-auto bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ maxWidth: '1200px', height: '600px' }}>
                    {/* Website header skeleton */}
                    <div className="bg-gray-300 h-16 w-full"></div>
                    
                    {/* Hero section skeleton */}
                    <div className="bg-gray-200 h-40 w-full flex items-center justify-center">
                        <div className="text-center space-y-3">
                            <div className="bg-gray-300 h-8 w-80 rounded mx-auto"></div>
                            <div className="bg-gray-300 h-4 w-60 rounded mx-auto"></div>
                            <div className="bg-gray-300 h-10 w-32 rounded mx-auto"></div>
                        </div>
                    </div>
                    
                    {/* Content sections skeleton */}
                    <div className="p-8 space-y-8">
                        {/* About section */}
                        <div className="space-y-4">
                            <div className="bg-gray-300 h-6 w-48 rounded mx-auto"></div>
                            <div className="space-y-2">
                                <div className="bg-gray-300 h-4 w-full rounded"></div>
                                <div className="bg-gray-300 h-4 w-5/6 rounded"></div>
                                <div className="bg-gray-300 h-4 w-4/6 rounded"></div>
                            </div>
                        </div>
                        
                        {/* Services section */}
                        <div className="space-y-4">
                            <div className="bg-gray-300 h-6 w-40 rounded mx-auto"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="bg-gray-100 p-4 rounded-lg space-y-2">
                                        <div className="bg-gray-300 h-5 w-3/4 rounded"></div>
                                        <div className="bg-gray-300 h-4 w-full rounded"></div>
                                        <div className="bg-gray-300 h-4 w-5/6 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Contact section */}
                        <div className="space-y-4">
                            <div className="bg-gray-300 h-6 w-44 rounded mx-auto"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Array.from({ length: 2 }).map((_, index) => (
                                    <div key={index} className="bg-gray-100 p-4 rounded-lg space-y-2">
                                        <div className="bg-gray-300 h-4 w-1/2 rounded"></div>
                                        <div className="bg-gray-300 h-4 w-3/4 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Section controls skeleton */}
            <div className="border-t border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                    <div className="bg-gray-300 h-4 w-24 rounded"></div>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="bg-gray-300 h-6 w-16 rounded-full"></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export { LoadingSkeleton, CardSkeleton, ButtonSkeleton, ProgressSkeleton, PreviewSkeleton };
export default LoadingSkeleton;