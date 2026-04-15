import React from 'react';
import { FiCheck } from 'react-icons/fi';
import { motion } from 'motion/react';
import type {StatusTimelineProps } from './types';

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  steps,
  currentStepIndex,
  variant = 'horizontal',
  size = 'md',
}) => {
  const isHorizontal = variant === 'horizontal';
  const sizeClasses = {
    sm: {
      dot: 'w-6 h-6',
      icon: 'text-10',
      line: 'h-0.5',
      vLine: 'w-0.5',
      label: 'text-sm',
      time: 'text-10',
      desc: 'text-10',
      gap: 'gap-2',
    },
    md: {
      dot: 'w-10 h-10',
      icon: 'text-md',
      line: 'h-1',
      vLine: 'w-1',
      label: 'text-md',
      time: 'text-sm',
      desc: 'text-sm',
      gap: 'gap-3',
    },
  }[size];

  return (
    <div className={`w-full overflow-x-auto hide-scrollbar ${isHorizontal ? 'py-4' : ''}`}>
      <div className={`flex ${isHorizontal ? 'flex-row min-w-max' : 'flex-col'} ${sizeClasses.gap}`}>
        {steps.map((step, index) => {
          const isPassed = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          const dotColor = isPassed
            ? 'bg-emerald-500 text-white'
            : isCurrent
            ? step.colorClass ? `bg-gradient-to-r ${step.colorClass} text-white shadow-lg shadow-purple-500/20 ring-4 ring-purple-100 dark:ring-purple-900/30` : 'bg-purple-600 text-white shadow-lg shadow-purple-500/20 ring-4 ring-purple-100 dark:ring-purple-900/30'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-400';

          const lineColor = isPassed ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700';

          return (
            <div
              key={step.key}
              className={`flex ${
                isHorizontal ? 'flex-col items-center flex-1 relative' : 'flex-row gap-4'
              }`}
            >
              {/* Connector line (Horizontal) */}
              {isHorizontal && index > 0 && (
                <div
                  className={`absolute top-[50%] -left-[50%] w-full -translate-y-1/2 -z-10 ${sizeClasses.line}`}
                  style={{ top: size === 'sm' ? '12px' : '20px' }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isPassed ? '100%' : '0%' }}
                    transition={{ duration: 0.5 }}
                    className={`h-full ${lineColor}`}
                  />
                  {!isPassed && <div className={`w-full h-full ${lineColor}`} />}
                </div>
              )}

              {/* Vertical Time/Desc (Left of line) */}
              {!isHorizontal && (
                <div className="w-24 text-right pt-2 flex-shrink-0">
                  {step.timestamp && (
                    <>
                      <div className="font-medium text-md text-slate-800 dark:text-slate-200">
                        {step.timestamp.split(' ')[1]}
                      </div>
                      <div className="text-sm text-slate-500">{step.timestamp.split(' ')[0]}</div>
                    </>
                  )}
                </div>
              )}

              {/* Vertical connector + Dot container */}
              {!isHorizontal && (
                <div className="flex flex-col items-center relative">
                  {index > 0 && (
                    <div className={`absolute top-0 -mt-6 h-6 -z-10 ${sizeClasses.vLine} ${lineColor}`} />
                  )}
                  <motion.div
                    initial={isCurrent ? { scale: 0.8 } : false}
                    animate={isCurrent ? { scale: 1 } : false}
                    className={`rounded-full flex items-center justify-center font-bold z-10 transition-colors duration-300 ${sizeClasses.dot} ${dotColor}`}
                  >
                    {isPassed ? <FiCheck className={sizeClasses.icon} /> : step.icon || (index + 1)}
                  </motion.div>
                  {index < steps.length - 1 && (
                    <div className={`w-full h-full mt-2 -z-10 ${sizeClasses.vLine} ${lineColor}`} />
                  )}
                </div>
              )}

              {/* Horizontal Dot */}
              {isHorizontal && (
                <motion.div
                  initial={isCurrent ? { scale: 0.8 } : false}
                  animate={isCurrent ? { scale: 1 } : false}
                  className={`rounded-full flex items-center justify-center font-bold z-10 transition-colors duration-300 ${sizeClasses.dot} ${dotColor}`}
                >
                  {isPassed ? <FiCheck className={sizeClasses.icon} /> : step.icon || (index + 1)}
                </motion.div>
              )}

              {/* Label & Description */}
              <div
                className={`${
                  isHorizontal ? 'mt-3 text-center px-2' : 'pt-2 pb-8 flex-1'
                }`}
              >
                <div
                  className={`font-semibold ${sizeClasses.label} ${
                    isCurrent ? 'text-purple-600 dark:text-purple-400' : isPending ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {step.label}
                </div>
                {step.timestamp && isHorizontal && (
                  <div className={`mt-1 font-medium text-slate-500 ${sizeClasses.time}`}>
                    {step.timestamp}
                  </div>
                )}
                {step.description && (
                  <div className={`mt-1 text-slate-500 ${sizeClasses.desc}`}>
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
