import { FiCheck, FiMapPin, FiCreditCard, FiTruck } from 'react-icons/fi';

const steps = [
  { id: 1, title: 'Thông tin giao hàng', icon: FiMapPin },
  { id: 2, title: 'Xác nhận đơn hàng', icon: FiTruck },
  { id: 3, title: 'Thanh toán', icon: FiCreditCard },
];

interface CheckoutStepperProps {
  currentStep: number;
}

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <div className="flex items-center justify-center mb-12">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center relative">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold z-10 transition-colors ${currentStep >= step.id ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
              {currentStep > step.id ? <FiCheck /> : <step.icon />}
            </div>
            <span className={`absolute top-14 w-32 text-center text-md font-medium ${currentStep >= step.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
              {step.title}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-16 md:w-32 h-1 mx-2 rounded-full transition-colors ${currentStep > step.id ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
          )}
        </div>
      ))}
    </div>
  );
}
