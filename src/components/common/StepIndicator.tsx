import React from 'react';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-center w-full mb-12">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => (
                <React.Fragment key={step}>
                    {/* Line connecting steps */}
                    {index > 0 && (
                        <div className={`h-1 w-16 mx-2 rounded-full ${step <= currentStep ? 'bg-primary/20' : 'bg-slate-200 dark:bg-slate-800'}`} />
                    )}

                    {/* Step Circle */}
                    <div
                        className={`
                            flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold transition-all duration-300
                            ${step === currentStep
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110'
                                : step < currentStep
                                    ? 'bg-primary/20 text-primary'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                            }
                        `}
                    >
                        {step}
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
}
