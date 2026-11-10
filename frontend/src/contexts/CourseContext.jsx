"use client";

import { createContext, useContext } from "react";

const CourseContext = createContext(null);

export function CourseProvider({ course, children }) {
  return (
    <CourseContext.Provider value={course}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourseContext() {
  const course = useContext(CourseContext);

  if (!course) {
    throw new Error(
      "useCourseContext must be used inside CourseProvider"
    );
  }

  return course;
}