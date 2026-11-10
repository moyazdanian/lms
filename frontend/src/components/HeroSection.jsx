import { Sparkles } from "lucide-react";

export default function HeroSection({
  title,
  subTitle,
  firstNumber,
  firstText,
  secondNumber,
  secondText,
  thirdNumber,
  thirdText,
}) {
  return (
    <div className="max-w-7xl mx-auto text-center mb-12">
      <div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
        <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold dark:text-gray-200 text-stone-800 mb-4">
        {title}
        {/* <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-300 to-gray-600">
          Expert Instructors
        </span> */}
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
        {subTitle}
      </p>

      {/* Stats Bar */}
      <div className="flex flex-wrap justify-center gap-6 mt-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {firstNumber}+
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {firstText}
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {secondNumber}+
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {secondText}
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {thirdNumber}+
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {thirdText}
          </div>
        </div>
      </div>
    </div>
  );
}
