// src/components/MultiStepForm/StepIndicator.jsx
const StepIndicator = ({ currentStep, totalSteps }) => {
    return (
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index < currentStep 
                ? 'bg-teal-500 text-white' 
                : index === currentStep 
                  ? 'bg-teal-500 text-white border-2 border-teal-200' 
                  : 'bg-gray-200 text-gray-700'
            }`}>
              {index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div className={`h-1 w-full flex-1 mx-2 ${
                index < currentStep ? 'bg-teal-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };
  
  export default StepIndicator;
  