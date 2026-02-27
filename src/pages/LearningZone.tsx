import { motion } from 'framer-motion'
import { useEffect } from "react";
import { BookOpen, Video, FileText, Award, Clock, Users, CheckCircle, Star, TrendingUp, Calendar, AlertCircle, Megaphone, GraduationCap, BarChart3, Download, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
}

export function LearningZone() {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight text-[#000000]">
          My Learning
        </h1>
      </motion.div>

      {/* Main Tabs */}
      <Tabs defaultValue="my-learning" className="w-full">
        <TabsList className="bg-transparent h-auto p-0 mb-6 gap-2 border-b w-full justify-start overflow-x-auto scrollbar-hide -mx-2 px-2 flex-nowrap md:gap-0 md:overflow-visible md:px-0 md:flex-wrap">
          <TabsTrigger
            value="my-learning"
            className="bg-transparent px-4 pb-3 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-[#D52B1E] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#D52B1E] rounded-none text-[#737692] hover:bg-transparent shrink-0"
          >
            My Learning
          </TabsTrigger>
          <TabsTrigger
            value="programs"
            className="bg-transparent px-4 pb-3 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-[#D52B1E] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#D52B1E] rounded-none text-[#737692] hover:bg-transparent shrink-0"
          >
            Programs and Certifications
          </TabsTrigger>
          <TabsTrigger
            value="paths"
            className="bg-transparent px-4 pb-3 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-[#D52B1E] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#D52B1E] rounded-none text-[#737692] hover:bg-transparent shrink-0"
          >
            Learning Paths
          </TabsTrigger>
          <TabsTrigger
            value="assessments"
            className="bg-transparent px-4 pb-3 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-[#D52B1E] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#D52B1E] rounded-none text-[#737692] hover:bg-transparent shrink-0"
          >
            Assessments
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="bg-transparent px-4 pb-3 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-[#D52B1E] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#D52B1E] rounded-none text-[#737692] hover:bg-transparent shrink-0"
          >
            Payments
          </TabsTrigger>
          <TabsTrigger
            value="results"
            className="bg-transparent px-4 pb-3 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-[#D52B1E] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#D52B1E] rounded-none text-[#737692] hover:bg-transparent shrink-0"
          >
            Results
          </TabsTrigger>
        </TabsList>

        {/* My Learning Tab */}
        <TabsContent value="my-learning" className="mt-0">
          <div className="space-y-6">
            {/* Welcome Message */}
            <motion.div
              key="welcome-msg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-[#FFF5F5] to-[#FFF0F0] p-6 rounded-xl"
            >
              <p className="text-[#737692] text-sm">
                Welcome back{" "}
                <span className="font-semibold text-[#D52B1E]">
                  Ibrahim Shehu!
                </span>{" "}
                You've completed 15% more this week!
              </p>
            </motion.div>

            {/* Continue Learning */}
            <motion.div
              key="continue-learning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl font-bold text-[#000000] mb-4">
                Continue Learning
              </h2>
              <Card className="overflow-hidden bg-gradient-to-r from-black to-gray-800 text-white border-0">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="flex-1 p-6">
                      <h3 className="text-lg font-bold mb-2">
                        Certified Islamic Finance Professional (CIFP)
                      </h3>
                      <p className="text-sm text-gray-300 mb-4">
                        Module 4: Islamic Financial Contracts - Murabaha &
                        Ijarah
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-[#D52B1E] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "62%" }}
                            transition={{ duration: 1, delay: 0.3 }}
                          />
                        </div>
                        <p className="text-xs text-gray-400">
                          62% completed | Next up: Lesson 5 - Principles of
                          Ijara (2mins)
                        </p>
                      </div>
                      <Button className="bg-[#D52B1E] hover:bg-[#B8241B] text-white">
                        Resume
                      </Button>
                    </div>
                    <div className="w-64 h-full hidden md:block">
                      <img
                        src="https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=300&h=200&fit=crop"
                        alt="Islamic Architecture"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Active Enrollments */}
            <motion.div
              key="active-enrollments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-[#000000] mb-4">
                Active Enrollments
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-[#000000]">
                            CIFP Program
                          </h4>
                          <Badge className="bg-[#D52B1E]/10 text-[#D52B1E] border-[#D52B1E]/20">
                            Active
                          </Badge>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                          <motion.div
                            className="h-full bg-[#D52B1E] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "62%" }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#737692]">Progress</span>
                          <span className="font-semibold text-[#000000]">
                            62%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Award className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-[#000000]">
                            Ethical and ESG Finance Certificate
                          </h4>
                          <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">
                            Active
                          </Badge>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                          <motion.div
                            className="h-full bg-purple-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "45%" }}
                            transition={{ duration: 1, delay: 0.6 }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#737692]">Progress</span>
                          <span className="font-semibold text-[#000000]">
                            45%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Upcoming Activities */}
            <motion.div
              key="upcoming-activities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-xl font-bold text-[#000000] mb-4">
                Upcoming Activities
              </h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Video className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#000000]">
                            Live Session: Sukuk Structures
                          </h4>
                          <p className="text-sm text-[#737692]">
                            Tomorrow • 10:00 AM (WAT)
                          </p>
                        </div>
                      </div>
                      <Button className="bg-[#D52B1E] hover:bg-[#B8241B] text-white">
                        Join
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#000000]">
                            Assessment Deadline: Module 4 Quiz
                          </h4>
                          <p className="text-sm text-[#737692]">
                            Due in 3 days
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                        Due Soon
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Announcements */}
            <motion.div
              key="announcements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-xl font-bold text-[#000000] mb-4">
                Announcements
              </h2>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Megaphone className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#000000] mb-1">
                        Instructor Update
                      </h4>
                      <p className="text-sm text-[#737692]">
                        Please review the updated reading materials for Module 4
                        before the live session.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Programs and Certifications Tab */}
        <TabsContent value="programs" className="mt-0">
          <div className="space-y-6">
            <p className="text-[#737692] mb-6">
              Explore our comprehensive programs and professional certifications
            </p>

            {/* Professional Programs */}
            <div>
              <h3 className="text-xl font-bold text-[#000000] mb-4">
                Professional Programs
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-l-4 border-l-[#D52B1E] hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex flex-col gap-3 mb-2 sm:flex-row sm:items-center">
                      <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-[#D52B1E] to-[#6F1610] flex items-center justify-center">
                        <GraduationCap className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-[#000000]">
                          Certified Islamic Finance Professional (CIFP)
                        </CardTitle>
                        <CardDescription>
                          Comprehensive professional certification program
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Enrolled
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-[#737692]">
                      A comprehensive certification program covering Islamic
                      banking, finance principles, investment strategies, and
                      professional practice.
                    </p>
                    <div className="grid gap-3 text-sm sm:grid-cols-3">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-[#000000]">
                          8 Modules
                        </p>
                        <p className="text-xs text-[#737692]">Comprehensive</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-[#000000]">40 Hours</p>
                        <p className="text-xs text-[#737692]">Learning Time</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-[#000000]">Advanced</p>
                        <p className="text-xs text-[#737692]">Level</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#737692]">Your Progress</span>
                        <span className="font-semibold">62%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#D52B1E] rounded-full"
                          style={{ width: "62%" }}
                        />
                      </div>
                    </div>
                    <Button className="w-full bg-[#D52B1E] hover:bg-[#B8241B] text-white">
                      Continue Learning
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex flex-col gap-3 mb-2 sm:flex-row sm:items-center">
                      <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                        <BarChart3 className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-[#000000]">
                          ESG & Ethical Finance Program
                        </CardTitle>
                        <CardDescription>
                          Environmental, Social, and Governance expertise
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-[#737692]">
                      Master sustainable and ethical finance principles aligned
                      with Islamic values and modern ESG frameworks.
                    </p>
                    <div className="grid gap-3 text-sm sm:grid-cols-3">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-[#000000]">
                          6 Modules
                        </p>
                        <p className="text-xs text-[#737692]">Focused Track</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-[#000000]">24 Hours</p>
                        <p className="text-xs text-[#737692]">Learning Time</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-[#000000]">
                          Intermediate
                        </p>
                        <p className="text-xs text-[#737692]">Level</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-[#D52B1E] text-[#D52B1E] hover:bg-[#D52B1E] hover:text-white"
                    >
                      Enroll Now - $299
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex flex-col gap-3 mb-2 sm:flex-row sm:items-center">
                      <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                        <Award className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-[#000000]">
                          Islamic Banking Operations Certificate
                        </CardTitle>
                        <CardDescription>
                          Practical banking skills and operations
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-[#737692]">
                      Develop hands-on expertise in Islamic banking operations,
                      compliance, and customer service excellence.
                    </p>
                    <div className="grid gap-3 text-sm sm:grid-cols-3">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-[#000000]">
                          5 Modules
                        </p>
                        <p className="text-xs text-[#737692]">Practical</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-[#000000]">20 Hours</p>
                        <p className="text-xs text-[#737692]">Learning Time</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-[#000000]">Beginner</p>
                        <p className="text-xs text-[#737692]">Level</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-[#D52B1E] text-[#D52B1E] hover:bg-[#D52B1E] hover:text-white"
                    >
                      Enroll Now - $199
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center">
                        <TrendingUp className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-[#000000]">
                          Sukuk & Islamic Capital Markets
                        </CardTitle>
                        <CardDescription>
                          Specialized certification in Islamic securities
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-[#737692]">
                      Become an expert in sukuk structuring, issuance, trading,
                      and Islamic capital market instruments.
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-[#000000]">
                          4 Modules
                        </p>
                        <p className="text-xs text-[#737692]">Specialized</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-[#000000]">16 Hours</p>
                        <p className="text-xs text-[#737692]">Learning Time</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-[#000000]">Advanced</p>
                        <p className="text-xs text-[#737692]">Level</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-[#D52B1E] text-[#D52B1E] hover:bg-[#D52B1E] hover:text-white"
                    >
                      Enroll Now - $249
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Specialized Certifications */}
            <div>
              <h3 className="text-xl font-bold text-[#000000] mb-4">
                Specialized Certifications
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-[#000000] mb-2">
                      Shariah Compliance Officer
                    </h4>
                    <p className="text-sm text-[#737692] mb-4">
                      12 hours • Intermediate
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-[#D52B1E] text-[#D52B1E] hover:bg-[#D52B1E] hover:text-white"
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-[#000000] mb-2">
                      Islamic Wealth Management
                    </h4>
                    <p className="text-sm text-[#737692] mb-4">
                      10 hours • Advanced
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-[#D52B1E] text-[#D52B1E] hover:bg-[#D52B1E] hover:text-white"
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                      <Star className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-[#000000] mb-2">
                      Takaful Specialist
                    </h4>
                    <p className="text-sm text-[#737692] mb-4">
                      8 hours • Intermediate
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-[#D52B1E] text-[#D52B1E] hover:bg-[#D52B1E] hover:text-white"
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Why Choose Our Programs */}
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
              <CardHeader>
                <CardTitle className="text-[#000000]">
                  Why Choose Our Programs?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center flex-shrink-0">
                      <Award className="h-5 w-5 text-[#D52B1E]" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-[#000000] mb-1">
                        Industry-Recognized Credentials
                      </h5>
                      <p className="text-sm text-[#737692]">
                        Earn certificates valued by leading Islamic financial
                        institutions worldwide
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-[#D52B1E]" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-[#000000] mb-1">
                        Expert Instructors
                      </h5>
                      <p className="text-sm text-[#737692]">
                        Learn from experienced practitioners and renowned
                        scholars
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-[#D52B1E]" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-[#000000] mb-1">
                        Flexible Learning
                      </h5>
                      <p className="text-sm text-[#737692]">
                        Study at your own pace with lifetime access to course
                        materials
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-[#D52B1E]" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-[#000000] mb-1">
                        Practical Application
                      </h5>
                      <p className="text-sm text-[#737692]">
                        Real-world case studies and hands-on projects
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Program Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#000000]">
                  Compare Programs
                </CardTitle>
                <CardDescription className="text-[#737692]">
                  Find the right certification for your career goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-[#000000]">
                          Program
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-[#000000]">
                          Duration
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-[#000000]">
                          Level
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-[#000000]">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-[#000000]">
                          CIFP
                        </td>
                        <td className="py-3 px-4 text-[#737692]">40 hours</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-red-100 text-red-800">
                            Advanced
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-[#000000]">$299</td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-[#000000]">
                          ESG & Ethical Finance
                        </td>
                        <td className="py-3 px-4 text-[#737692]">24 hours</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Intermediate
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-[#000000]">$299</td>
                      </tr>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-[#000000]">
                          Islamic Banking Operations
                        </td>
                        <td className="py-3 px-4 text-[#737692]">20 hours</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-green-100 text-green-800">
                            Beginner
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-[#000000]">$199</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-[#000000]">
                          Sukuk & Capital Markets
                        </td>
                        <td className="py-3 px-4 text-[#737692]">16 hours</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-red-100 text-red-800">
                            Advanced
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-[#000000]">$249</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Learning Paths Tab */}
        <TabsContent value="paths" className="mt-0">
          <div className="space-y-6">
            <p className="text-[#737692] mb-6">
              Structured learning paths to guide your education journey
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-[#000000]">
                        Islamic Banking Fundamentals
                      </CardTitle>
                      <CardDescription>5 courses • 20 hours</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#737692]">Progress</span>
                        <span className="font-semibold">0%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#D52B1E] rounded-full w-0" />
                      </div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <h5 className="text-sm font-semibold text-[#000000]">
                        Path Overview:
                      </h5>
                      <ul className="space-y-1.5">
                        <li className="flex items-center gap-2 text-sm text-[#737692]">
                          <CheckCircle className="h-4 w-4 text-gray-300" />
                          Introduction to Islamic Finance
                        </li>
                        <li className="flex items-center gap-2 text-sm text-[#737692]">
                          <CheckCircle className="h-4 w-4 text-gray-300" />
                          Islamic Banking Principles
                        </li>
                        <li className="flex items-center gap-2 text-sm text-[#737692]">
                          <CheckCircle className="h-4 w-4 text-gray-300" />
                          Shariah Compliance
                        </li>
                      </ul>
                    </div>
                    <Button className="w-full bg-[#D52B1E] hover:bg-[#B8241B] text-white">
                      Start Learning Path
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-[#000000]">
                        Investment & Portfolio Management
                      </CardTitle>
                      <CardDescription>4 courses • 16 hours</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#737692]">Progress</span>
                        <span className="font-semibold">25%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#D52B1E] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "25%" }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <h5 className="text-sm font-semibold text-[#000000]">
                        Path Overview:
                      </h5>
                      <ul className="space-y-1.5">
                        <li className="flex items-center gap-2 text-sm text-[#737692]">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Halal Investment Strategies
                        </li>
                        <li className="flex items-center gap-2 text-sm text-[#737692]">
                          <CheckCircle className="h-4 w-4 text-gray-300" />
                          Sukuk Investment
                        </li>
                        <li className="flex items-center gap-2 text-sm text-[#737692]">
                          <CheckCircle className="h-4 w-4 text-gray-300" />
                          Portfolio Diversification
                        </li>
                      </ul>
                    </div>
                    <Button className="w-full bg-[#D52B1E] hover:bg-[#B8241B] text-white">
                      Continue Path
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-[#000000]">
                        Professional Certification Track
                      </CardTitle>
                      <CardDescription>8 courses • 40 hours</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#737692]">Progress</span>
                        <span className="font-semibold">62%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#D52B1E] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "62%" }}
                          transition={{ duration: 1, delay: 0.4 }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <h5 className="text-sm font-semibold text-[#000000]">
                        Path Overview:
                      </h5>
                      <ul className="space-y-1.5">
                        <li className="flex items-center gap-2 text-sm text-[#737692]">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          CIFP Module 1-4
                        </li>
                        <li className="flex items-center gap-2 text-sm text-[#737692]">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Risk Management
                        </li>
                        <li className="flex items-center gap-2 text-sm text-[#737692]">
                          <CheckCircle className="h-4 w-4 text-gray-300" />
                          Final Assessment
                        </li>
                      </ul>
                    </div>
                    <Button className="w-full bg-[#D52B1E] hover:bg-[#B8241B] text-white">
                      Continue Path
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-[#000000]">
                        ESG & Ethical Finance
                      </CardTitle>
                      <CardDescription>6 courses • 24 hours</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#737692]">Progress</span>
                        <span className="font-semibold">45%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#D52B1E] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "45%" }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <h5 className="text-sm font-semibold text-[#000000]">
                        Path Overview:
                      </h5>
                      <ul className="space-y-1.5">
                        <li className="flex items-center gap-2 text-sm text-[#737692]">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          ESG Fundamentals
                        </li>
                        <li className="flex items-center gap-2 text-sm text-[#737692]">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Sustainable Finance
                        </li>
                        <li className="flex items-center gap-2 text-sm text-[#737692]">
                          <CheckCircle className="h-4 w-4 text-gray-300" />
                          Impact Measurement
                        </li>
                      </ul>
                    </div>
                    <Button className="w-full bg-[#D52B1E] hover:bg-[#B8241B] text-white">
                      Continue Path
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="mt-0">
          <div className="space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#000000] mb-4">
                  Upcoming Assessments
                </h3>
                <div className="grid gap-4">
                  <Card className="hover:shadow-lg transition-all border-l-4 border-l-orange-500">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#000000]">
                                CIFP Module 4 Final Exam
                              </h4>
                              <p className="text-sm text-[#737692]">
                                Investment Planning & Portfolio Management
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-[#737692] sm:ml-12">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />2 hours
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Due: Dec 30, 2024
                            </span>
                          </div>
                        </div>
                        <Button className="w-full bg-[#D52B1E] hover:bg-[#B8241B] text-white sm:w-auto">
                          Start Exam
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-all border-l-4 border-l-yellow-500">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-yellow-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#000000]">
                                Sukuk Investment Quiz
                              </h4>
                              <p className="text-sm text-[#737692]">
                                Module Assessment
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-[#737692] sm:ml-12">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              45 minutes
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Due: Jan 5, 2025
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full border-[#D52B1E] text-[#D52B1E] hover:bg-[#D52B1E] hover:text-white sm:w-auto"
                        >
                          Start Quiz
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#000000] mb-4">
                  Completed Assessments
                </h3>
                <div className="grid gap-4">
                  <Card className="hover:shadow-lg transition-all border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#000000]">
                                Islamic Banking Principles - Final Exam
                              </h4>
                              <p className="text-sm text-[#737692]">
                                Completed on Dec 15, 2024
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm ml-13">
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              Passed
                            </Badge>
                            <span className="font-semibold text-green-600">
                              Score: 92%
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" className="text-[#D52B1E]">
                          <Download className="h-4 w-4 mr-2" />
                          Certificate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-all border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#000000]">
                                Shariah Compliance Fundamentals
                              </h4>
                              <p className="text-sm text-[#737692]">
                                Completed on Nov 28, 2024
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm ml-13">
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              Passed
                            </Badge>
                            <span className="font-semibold text-green-600">
                              Score: 88%
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" className="text-[#D52B1E]">
                          <Download className="h-4 w-4 mr-2" />
                          Certificate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <RefreshCw className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-[#000000]">
                                Halal Investment Strategies
                              </h4>
                              <p className="text-sm text-[#737692]">
                                Completed on Nov 20, 2024
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm ml-13">
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              Retake Available
                            </Badge>
                            <span className="font-semibold text-[#737692]">
                              Score: 72%
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="border-[#D52B1E] text-[#D52B1E] hover:bg-[#D52B1E] hover:text-white"
                        >
                          Retake
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="mt-0">
          <div className="space-y-6">
            {/* Active Subscription */}
            <Card className="border-l-4 border-l-[#D52B1E]">
              <CardHeader>
                <CardTitle className="text-[#000000]">
                  Active Subscription
                </CardTitle>
                <CardDescription className="text-[#737692]">
                  Your current plan and renewal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#D52B1E] to-[#6F1610] flex items-center justify-center">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#000000]">
                          CIFP Professional Package
                        </h4>
                        <p className="text-sm text-[#737692]">
                          Full access to all courses and certifications
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Active
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-[#737692]">
                        Next Billing Date
                      </p>
                      <p className="font-semibold text-[#000000]">
                        June 15, 2025
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#737692]">Amount</p>
                      <p className="font-semibold text-[#000000]">$299.00</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-[#D52B1E] text-[#D52B1E] hover:bg-[#D52B1E] hover:text-white"
                  >
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#000000]">
                  Payment History
                </CardTitle>
                <CardDescription className="text-[#737692]">
                  View all your past transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#000000]">
                          CIFP Program - Renewal
                        </h4>
                        <p className="text-sm text-[#737692]">
                          Dec 15, 2024 • Visa ending in 4242
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#000000]">$299.00</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#D52B1E] h-auto p-0 mt-1"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Receipt
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#000000]">
                          ESG Finance Course
                        </h4>
                        <p className="text-sm text-[#737692]">
                          Nov 8, 2024 • Visa ending in 4242
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#000000]">$129.00</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#D52B1E] h-auto p-0 mt-1"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Receipt
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#000000]">
                          Sukuk Investment Strategies
                        </h4>
                        <p className="text-sm text-[#737692]">
                          Oct 22, 2024 • Visa ending in 4242
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#000000]">$89.00</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#D52B1E] h-auto p-0 mt-1"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Receipt
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#000000]">
                          CIFP Program - Initial
                        </h4>
                        <p className="text-sm text-[#737692]">
                          Jun 15, 2024 • Visa ending in 4242
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#000000]">$299.00</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#D52B1E] h-auto p-0 mt-1"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Receipt
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="mt-0">
          <div className="space-y-6">
            {/* Certificates */}
            <Card className="bg-gradient-to-br from-[#D52B1E] to-[#6F1610] text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Earned Certificates
                </CardTitle>
                <CardDescription className="text-gray-100">
                  Download and share your achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-white">
                          Islamic Banking Principles
                        </h4>
                        <p className="text-sm text-gray-100">
                          Certificate of Completion
                        </p>
                      </div>
                      <Badge className="bg-white text-[#D52B1E] hover:bg-white">
                        Verified
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-100 mb-3">
                      Issued: Dec 15, 2024
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-white text-[#D52B1E] hover:bg-gray-100"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white text-white hover:bg-white/10"
                      >
                        Share
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-white">
                          Shariah Compliance
                        </h4>
                        <p className="text-sm text-gray-100">
                          Certificate of Completion
                        </p>
                      </div>
                      <Badge className="bg-white text-[#D52B1E] hover:bg-white">
                        Verified
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-100 mb-3">
                      Issued: Nov 28, 2024
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-white text-[#D52B1E] hover:bg-gray-100"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white text-white hover:bg-white/10"
                      >
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assessment Results */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#000000]">
                  Assessment Results
                </CardTitle>
                <CardDescription className="text-[#737692]">
                  Track your performance across all assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#000000]">
                          Islamic Banking Principles - Final Exam
                        </h4>
                        <p className="text-sm text-[#737692]">
                          Completed Dec 15, 2024
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">92%</p>
                      <p className="text-xs text-[#737692]">Passed</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#000000]">
                          Shariah Compliance Fundamentals
                        </h4>
                        <p className="text-sm text-[#737692]">
                          Completed Nov 28, 2024
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">88%</p>
                      <p className="text-xs text-[#737692]">Passed</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#000000]">
                          Halal Investment Strategies
                        </h4>
                        <p className="text-sm text-[#737692]">
                          Completed Nov 20, 2024
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-600">72%</p>
                      <p className="text-xs text-[#737692]">Retake Available</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#000000]">
                          Introduction to Islamic Finance
                        </h4>
                        <p className="text-sm text-[#737692]">
                          Completed Oct 15, 2024
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">95%</p>
                      <p className="text-xs text-[#737692]">Passed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#000000]">
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">89%</p>
                    <p className="text-sm text-[#737692] mt-1">Average Score</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">4/4</p>
                    <p className="text-sm text-[#737692] mt-1">
                      Assessments Completed
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600">2</p>
                    <p className="text-sm text-[#737692] mt-1">
                      Certificates Earned
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
