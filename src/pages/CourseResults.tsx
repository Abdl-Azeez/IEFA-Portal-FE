import { useState, useEffect } from "react";
import { ChevronDown, GraduationCap, Award, Filter, X } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  price: string;
  type: "Certification" | "Certificate";
  level: string;
  category: string;
  isHighlighted?: boolean;
}

const courses: Course[] = [
  {
    id: "1",
    title: "Compliance & Auditing",
    description:
      "Earn one of the most esteemed qualifications in the Islamic finance sector by achieving the Shariah Audit certification.",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=400&fit=crop",
    price: "NGN 200,000",
    type: "Certification",
    level: "Expert Level",
    category: "Shariah Audit Academy",
    isHighlighted: true,
  },
  {
    id: "2",
    title: "Islamic Finance, Risk Management, and Investment Certificate",
    description:
      "Earn the Islamic Finance, Risk Management, and Investment Certificate to understand how to evaluate risks and make informed, sustainable investment choices.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    price: "NGN 150,000",
    type: "Certificate",
    level: "Intermediate",
    category: "Ethical Banking",
    isHighlighted: false,
  },
  {
    id: "3",
    title: "IEFA Sustainable Investment Fundamentals Certificate",
    description:
      "Knowledge in ESG and responsible finance. Explore the practical certificate course provided by the International Ethical Finance Academy.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop",
    price: "NGN 50,000",
    type: "Certificate",
    level: "Foundational",
    category: "Service Excellence",
    isHighlighted: false,
  },
];

const categories = [
  "All",
  "Shariah Audit Academy",
  "Ethical Banking",
  "Service Excellence",
  "Credit and Risk Management",
  "Information and Security Academy",
  "Ethical Banking",
];

export default function CourseResults() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const [activeCategory, setActiveCategory] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    courseType: true,
    productType: true,
    difficulty: true,
    learningMode: true,
  });

  const toggleFilter = (section: keyof typeof expandedFilters) => {
    setExpandedFilters((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const highlightedCourses = courses.filter((c) => c.isHighlighted);
  const otherCourses = courses.filter((c) => !c.isHighlighted);

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#D52B1E] to-[#8B1E1E] text-white py-8 sm:py-10 md:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            IEFA Coures
          </h1>
          <p className="text-xs sm:text-sm leading-relaxed max-w-3xl mx-auto">
            From foundational knowledge to mastery, our learning programs are
            <br className="hidden sm:block" /> designed to give you a critical
            advantage at every stage in your career in the
            <br className="hidden sm:block" /> ethical finance industry
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category
                    ? "bg-[#D52B1E] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden flex items-center gap-2 mb-4 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={() => setIsSidebarOpen(false)}
              />

              {/* Sidebar Panel */}
              <div className="absolute inset-y-0 left-0 w-80 max-w-full bg-white shadow-xl overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">Filters</h2>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <FilterSidebarContent
                    expandedFilters={expandedFilters}
                    toggleFilter={toggleFilter}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg p-4 sm:p-6 sticky top-24">
              <FilterSidebarContent
                expandedFilters={expandedFilters}
                toggleFilter={toggleFilter}
              />
            </div>
          </div>

          {/* Courses List */}
          <div className="flex-1">
            {/* Highlighted Section */}
            {highlightedCourses.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#D52B1E"
                  >
                    <path d="M9 2L7 12h10l-2-10H9zM5 13v9h14v-9H5z" />
                  </svg>
                  <h2 className="text-base sm:text-lg font-bold text-[#D52B1E]">
                    Highlighted
                  </h2>
                </div>
                {highlightedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}

            {/* Other Courses */}
            <div className="space-y-4 sm:space-y-6">
              {otherCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FilterSidebarContentProps {
  expandedFilters: {
    courseType: boolean;
    productType: boolean;
    difficulty: boolean;
    learningMode: boolean;
  };
  toggleFilter: (
    section: "courseType" | "productType" | "difficulty" | "learningMode",
  ) => void;
}

function FilterSidebarContent({
  expandedFilters,
  toggleFilter,
}: FilterSidebarContentProps) {
  return (
    <>
      {/* Course Type */}
      <div className="mb-6">
        <button
          onClick={() => toggleFilter("courseType")}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-semibold text-xs sm:text-sm">Course Type</span>
          <ChevronDown
            className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${
              expandedFilters.courseType ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedFilters.courseType && (
          <div className="space-y-2">
            {["Islamic Finance", "Technology", "Governance & Risk"].map(
              (type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input type="checkbox" className="rounded" />
                  <span>{type}</span>
                </label>
              ),
            )}
          </div>
        )}
      </div>

      {/* Learning Product Type */}
      <div className="mb-6 pb-6 border-b">
        <button
          onClick={() => toggleFilter("productType")}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-semibold text-xs sm:text-sm">
            Learning product type
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedFilters.productType ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedFilters.productType && (
          <div className="space-y-2">
            {["Certificate", "Credential"].map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <input type="checkbox" className="rounded" />
                <span>{type}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Difficulty Level */}
      <div className="mb-6 pb-6 border-b">
        <button
          onClick={() => toggleFilter("difficulty")}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-semibold text-xs sm:text-sm">
            Difficulty level
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedFilters.difficulty ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedFilters.difficulty && (
          <div className="space-y-2">
            {["Foundational", "Advanced", "Intermediate"].map((level) => (
              <label
                key={level}
                className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <input type="checkbox" className="rounded" />
                <span>{level}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Learning Mode */}
      <div>
        <button
          onClick={() => toggleFilter("learningMode")}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-semibold text-xs sm:text-sm">
            Learning mode
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedFilters.learningMode ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedFilters.learningMode && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span>Self-paced</span>
            </label>
          </div>
        )}
      </div>
    </>
  );
}

interface CourseCardProps {
  course: Course;
}

function CourseCard({ course }: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
          {/* Course Image */}
          <div className="w-full sm:w-56 md:w-64 h-40 sm:h-48 flex-shrink-0 rounded-lg overflow-hidden">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Course Details */}
          <div className="flex-1">
            <Badge
              variant="outline"
              className="text-[#D52B1E] border-[#D52B1E] mb-2 sm:mb-3 text-xs sm:text-sm"
            >
              {course.type}
            </Badge>
            <h3 className="text-lg sm:text-xl font-bold text-black mb-2 sm:mb-3">
              {course.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 leading-relaxed line-clamp-3 sm:line-clamp-none">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                <span className="text-gray-700">{course.type}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                <span className="text-gray-700">{course.level}</span>
              </div>
            </div>

            <p className="text-base sm:text-lg font-bold text-black">
              Starting at <span className="text-[#D52B1E]">{course.price}</span>
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
