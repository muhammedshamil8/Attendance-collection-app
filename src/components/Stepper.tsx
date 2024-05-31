import React from 'react';

interface StepProps {
  stepNumber: number;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}

const Step: React.FC<StepProps> = ({ stepNumber, label, isActive, isCompleted }) => {
  return (
    <div className="flex items-center">
      <div className={`flex items-center justify-center h-10 w-10 rounded-full ${isCompleted ? 'bg-green-500' : isActive ? 'bg-emerald-500' : 'bg-gray-300'} text-white`}>
        {isCompleted ? '✓' : stepNumber}
      </div>
      <div className={`ml-2 text-sm font-medium ${isActive ? 'text-emerald-600' : 'text-gray-600'}`}>
        {label}
      </div>
    </div>
  );
};

interface StepperProps {
  steps: string[];
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <Step
            stepNumber={index + 1}
            label={step}
            isActive={currentStep === index}
            isCompleted={currentStep > index}
          />
          {index < steps.length - 1 && (
            <div className="flex-auto border-t-2 transition duration-500 ease-in-out border-gray-300"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Stepper;
