"use client";

import QuizTaker from "@/components/quiz/QuizTaker";
import { use } from "react";

export default function CourseQuizPage({ params }) {
  const { slug } = use(params);

  return (
    <div className="p-5">
      <div className="mx-auto max-w-3xl">
        <QuizTaker slug={slug} />
      </div>
    </div>
  );
}
