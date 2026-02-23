import { motion } from 'framer-motion'
import { Briefcase, Users, MapPin, GraduationCap, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

const journeySteps = [
  {
    stage: 'Early career',
    title: 'Analyst & associate years',
    focus: 'Master the language of markets, build core models and gain breadth.',
  },
  {
    stage: 'Mid career',
    title: 'Portfolio & product leadership',
    focus: 'Translate ideas into portfolios, manage risk and lead teams.',
  },
  {
    stage: 'Senior',
    title: 'CIO & investment committee',
    focus: 'Set frameworks, steward governance and shape institutions.',
  },
]

const sampleProfiles = [
  {
    name: 'Investment Analyst',
    location: 'Lagos, Nigeria',
    focus: 'Equities, macro strategy',
    level: 'Early career',
  },
  {
    name: 'Portfolio Manager',
    location: 'Abuja, Nigeria',
    focus: 'Multi-asset, fixed income',
    level: 'Mid career',
  },
  {
    name: 'Chief Investment Officer',
    location: 'London, UK',
    focus: 'Global allocations, governance',
    level: 'Senior',
  },
]

export default function IFProfessionals() {
  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight text-[#000000]">IF Professionals</h1>
        <p className="mt-2 text-[#737692]">
          A dedicated workspace for investment and finance professionals – curated content,
          peer learning, and practical tools.
        </p>
      </motion.div>

      {/* Career Journey */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#D52B1E]" />
              <CardTitle className="text-[#000000]">Career Journey</CardTitle>
            </div>
            <CardDescription className="text-[#737692]">
              IEFA as a career-long companion for investment & finance professionals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {journeySteps.map((step, index) => (
                <motion.div
                  key={step.stage}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-white rounded-lg border hover:shadow-md transition-all"
                >
                  <div className="h-10 w-10 rounded-full bg-[#D52B1E]/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-[#D52B1E]">{index + 1}</span>
                  </div>
                  <div>
                    <Badge className="bg-[#D52B1E]/10 text-[#D52B1E] border-[#D52B1E]/20 mb-2">
                      {step.stage}
                    </Badge>
                    <h3 className="font-semibold text-[#000000]">{step.title}</h3>
                    <p className="text-sm text-[#737692] mt-1">{step.focus}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Representative Profiles */}
      <motion.div variants={itemVariants}>
        <Card className="transition-all duration-300 hover:shadow-xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-[#000000]">Representative Profiles</CardTitle>
            <CardDescription className="text-[#737692]">
              Example profiles – over time this will evolve into richer profiles, CPD tracking, and collaboration spaces.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sampleProfiles.map((profile, index) => (
                <motion.div
                  key={profile.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all h-full">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#D52B1E] to-[#6F1610] flex items-center justify-center text-white text-xl font-bold">
                          {profile.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#000000]">{profile.name}</h4>
                          <p className="text-sm text-[#737692] flex items-center justify-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {profile.location}
                          </p>
                          <p className="text-xs text-[#737692] mt-1">{profile.focus}</p>
                          <Badge className="mt-2 bg-[#D52B1E]/10 text-[#D52B1E] border-[#D52B1E]/20">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            {profile.level}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full border-[#D52B1E] text-[#D52B1E] hover:bg-[#D52B1E] hover:text-white"
                        >
                          View Profile
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
