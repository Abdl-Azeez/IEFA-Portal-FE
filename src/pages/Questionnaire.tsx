import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { QuestionnaireData } from "@/types/questionnaire";
import { initialQuestionnaireData } from "@/types/questionnaire";
import EducationLevel from "./questionnaire/EducationLevel";
import CompletedCourses from "./questionnaire/CompletedCourses";
import Situation from "./questionnaire/Situation";
import YearsOfExperience from "./questionnaire/YearsOfExperience";
import CareerGoals from "./questionnaire/CareerGoals";
import InvestmentTopics from "./questionnaire/InvestmentTopics";
import LearningHours from "./questionnaire/LearningHours";
import Commitment from "./questionnaire/Commitment";

type QuestionnaireStep =
  | "education"
  | "courses"
  | "situation"
  | "experience"
  | "goals"
  | "topics"
  | "hours"
  | "commitment";

export default function Questionnaire() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] =
    useState<QuestionnaireStep>("education");
  const [data, setData] = useState<QuestionnaireData>(initialQuestionnaireData);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleEducationNext = (level: string) => {
    setData({ ...data, educationLevel: level });
    setCurrentStep("courses");
  };

  const handleCoursesNext = (courses: string[]) => {
    setData({ ...data, completedCourses: courses });
    setCurrentStep("situation");
  };

  const handleSituationNext = (situation: string) => {
    setData({ ...data, situation });
    setCurrentStep("experience");
  };

  const handleExperienceNext = (years: string) => {
    setData({ ...data, yearsOfExperience: years });
    setCurrentStep("goals");
  };

  const handleGoalsNext = (goals: string[]) => {
    setData({ ...data, careerGoals: goals });
    setCurrentStep("topics");
  };

  const handleTopicsNext = (topics: string[]) => {
    setData({ ...data, investmentTopics: topics });
    setCurrentStep("hours");
  };

  const handleHoursNext = (hours: number) => {
    setData({ ...data, learningHours: hours });
    setCurrentStep("commitment");
  };

  const handleCommitmentNext = (commitment: string) => {
    setData({ ...data, commitment });
    // Here you would typically submit the data to your backend
    console.log("Questionnaire completed:", { ...data, commitment });
    // Redirect to course results page
    navigate("/course-results");
  };

  const handleBack = () => {
    const steps: QuestionnaireStep[] = [
      "education",
      "courses",
      "situation",
      "experience",
      "goals",
      "topics",
      "hours",
      "commitment",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <>
      {currentStep === "education" && (
        <EducationLevel
          onNext={handleEducationNext}
          initialValue={data.educationLevel}
        />
      )}
      {currentStep === "courses" && (
        <CompletedCourses
          onNext={handleCoursesNext}
          onBack={handleBack}
          initialValue={data.completedCourses}
        />
      )}
      {currentStep === "situation" && (
        <Situation
          onNext={handleSituationNext}
          onBack={handleBack}
          initialValue={data.situation}
        />
      )}
      {currentStep === "experience" && (
        <YearsOfExperience
          onNext={handleExperienceNext}
          onBack={handleBack}
          initialValue={data.yearsOfExperience}
        />
      )}
      {currentStep === "goals" && (
        <CareerGoals
          onNext={handleGoalsNext}
          onBack={handleBack}
          initialValue={data.careerGoals}
        />
      )}
      {currentStep === "topics" && (
        <InvestmentTopics
          onNext={handleTopicsNext}
          onBack={handleBack}
          initialValue={data.investmentTopics}
        />
      )}
      {currentStep === "hours" && (
        <LearningHours
          onNext={handleHoursNext}
          onBack={handleBack}
          initialValue={data.learningHours}
        />
      )}
      {currentStep === "commitment" && (
        <Commitment
          onNext={handleCommitmentNext}
          onBack={handleBack}
          initialValue={data.commitment}
        />
      )}
    </>
  );
}
