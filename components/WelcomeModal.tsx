"use client";

import { useState } from "react";
import {
  X,
  Shield,
  Activity,
  Settings,
  ChevronRight,
} from "lucide-react";

interface WelcomeModalProps {
  userName?: string;
  onClose: () => void;
}

export function WelcomeModal({ userName, onClose }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Your Dashboard!",
      description: `Hi ${userName || "there"}! We're excited to have you here. Let's take a quick tour of what you can do.`,
      icon: <Shield className="w-12 h-12 text-blue-600 dark:text-blue-400" />,
      features: [
        "Secure Google OAuth authentication",
        "Real-time activity tracking",
        "Customizable preferences",
      ],
    },
    {
      title: "Track Your Activity",
      description:
        "Monitor all your account activities, from sign-ins to data exports, with detailed logs and visualizations.",
      icon: (
        <Activity className="w-12 h-12 text-green-600 dark:text-green-400" />
      ),
      features: [
        "7-day activity trend chart",
        "Search and filter activities",
        "Export to JSON or CSV",
      ],
    },
    {
      title: "Manage Your Sessions",
      description:
        "View and control all active sessions across your devices for enhanced security.",
      icon: (
        <Shield className="w-12 h-12 text-purple-600 dark:text-purple-400" />
      ),
      features: [
        "See all active sessions",
        "Revoke sessions remotely",
        "Session expiration tracking",
      ],
    },
    {
      title: "Customize Your Experience",
      description:
        "Personalize your dashboard with theme options, notification settings, and more.",
      icon: (
        <Settings className="w-12 h-12 text-orange-600 dark:text-orange-400" />
      ),
      features: [
        "Light/Dark/System theme",
        "Email notification controls",
        "Language and timezone settings",
      ],
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close welcome modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              {currentStepData.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentStepData.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {currentStepData.description}
          </p>

          <div className="space-y-3">
            {currentStepData.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="px-6 pb-4">
          <div className="flex gap-2 justify-center">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-8 bg-blue-600 dark:bg-blue-400"
                    : index < currentStep
                    ? "w-2 bg-blue-400 dark:bg-blue-600"
                    : "w-2 bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all hover:scale-105 active:scale-95"
          >
            {currentStep === steps.length - 1 ? "Get Started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
