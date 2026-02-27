import { motion } from 'framer-motion'
import { useEffect } from "react";
import { Play, Pause, Clock, Headphones } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

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

const episodes = [
  {
    id: 1,
    title: 'Building a career in frontier investment markets',
    duration: '32:18',
    guest: 'Investment strategist, Lagos',
    tag: 'Career',
  },
  {
    id: 2,
    title: 'Macro volatility: How professionals stay anchored',
    duration: '27:05',
    guest: 'Portfolio manager, Abuja',
    tag: 'Macro',
  },
  {
    id: 3,
    title: 'Practical steps for better investment committees',
    duration: '24:11',
    guest: 'IF professional, London',
    tag: 'Governance',
  },
]

const archiveEpisodes = [
  { id: 101, title: 'Season 1 wrap: Lessons from frontier markets', duration: '29:04' },
  { id: 102, title: 'Investor stories from Lagos, Abuja and beyond', duration: '34:18' },
  { id: 103, title: 'From analyst to CIO: A 15‑year journey', duration: '41:52' },
  { id: 104, title: 'Sukuk market deep dive', duration: '38:22' },
  { id: 105, title: 'ESG and Islamic finance alignment', duration: '31:15' },
]

export default function Podcast() {
  const [activeId, setActiveId] = useState<number | null>(
    episodes[0]?.id ?? null,
  );
  const activeEpisode = episodes.find((e) => e.id === activeId) ?? episodes[0];

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
          Podcast
        </h1>
        <p className="mt-2 text-[#737692]">
          Conversations with investors, operators, and policymakers across the
          IEFA community. Listen to career journeys, market debriefs, and
          behind-the-scenes stories.
        </p>
      </motion.div>

      {/* Now Playing */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20 overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-[#D52B1E]" />
              <CardTitle className="text-[#000000]">Now Playing</CardTitle>
            </div>
            <CardDescription className="text-[#737692]">
              IEFA Studio · Conversations that move portfolios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button
                size="lg"
                className="h-14 w-14 rounded-full bg-[#D52B1E] hover:bg-[#B8241B] text-white shrink-0"
              >
                {activeId ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-0.5" />
                )}
              </Button>
              <div className="flex-1">
                <h3 className="font-semibold text-[#000000] text-lg">
                  {activeEpisode.title}
                </h3>
                <p className="text-sm text-[#737692]">
                  Guest: {activeEpisode.guest}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-[#D52B1E]/10 text-[#D52B1E] border-[#D52B1E]/20">
                    {activeEpisode.tag}
                  </Badge>
                  <span className="text-sm text-[#737692] flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {activeEpisode.duration}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Episode Line-up */}
      <motion.div variants={itemVariants}>
        <Card className="transition-all duration-300 hover:shadow-xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-[#000000]">Episode Line-up</CardTitle>
            <CardDescription className="text-[#737692]">
              Tap an episode to preview. Audio streaming coming soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {episodes.map((episode, index) => {
                const isActive = activeEpisode.id === episode.id;
                return (
                  <motion.div
                    key={episode.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    onClick={() => setActiveId(episode.id)}
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                      isActive
                        ? "bg-[#D52B1E] text-white border-[#D52B1E]"
                        : "hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        isActive ? "bg-white/20" : "bg-[#FFEFEF]"
                      }`}
                    >
                      {isActive ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 text-[#D52B1E] ml-0.5" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4
                        className={`font-semibold ${isActive ? "text-white" : "text-[#000000]"}`}
                      >
                        {episode.title}
                      </h4>
                      <p
                        className={`text-sm ${isActive ? "text-white/90" : "text-[#737692]"}`}
                      >
                        Guest: {episode.guest}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={isActive ? "border-white/50 text-white" : ""}
                      >
                        {episode.tag}
                      </Badge>
                      <span
                        className={`text-sm flex items-center gap-1 ${isActive ? "text-white/90" : "text-[#737692]"}`}
                      >
                        <Clock className="h-3 w-3" />
                        {episode.duration}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Previous Episodes */}
      <motion.div variants={itemVariants}>
        <Card className="transition-all duration-300 hover:shadow-xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-[#000000]">Previous Episodes</CardTitle>
            <CardDescription className="text-[#737692]">
              Archive of earlier IEFA Studio sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {archiveEpisodes.map((ep, index) => (
                <motion.div
                  key={ep.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#FFEFEF] flex items-center justify-center group-hover:bg-[#D52B1E]/10 transition-colors">
                      <Play className="h-4 w-4 text-[#D52B1E] ml-0.5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#000000]">{ep.title}</h4>
                      <p className="text-sm text-[#737692]">
                        Length: {ep.duration}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[#D52B1E]">
                    Listen
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
