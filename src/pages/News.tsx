import { motion } from 'framer-motion'
import { useEffect } from "react";
import { Clock, TrendingUp, MessageCircle, Share2, Bookmark, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

interface NewsCardProps {
  title: string
  excerpt: string
  category: string
  time: string
  image: string
  trending?: boolean
  delay?: number
}

function NewsCard({ title, excerpt, category, time, image, trending, delay = 0 }: NewsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -8 }}
    >
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl group cursor-pointer">
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
          <motion.div
            className="absolute inset-0 bg-primary/20"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6 }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-4xl">
            {image}
          </div>
          {trending && (
            <motion.div
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              className="absolute top-3 left-3"
            >
              <Badge className="bg-red-500 text-white border-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            </motion.div>
          )}
        </div>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-primary border-primary">
              {category}
            </Badge>
            <span className="text-xs text-[#737692] flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {time}
            </span>
          </div>
          <CardTitle className="text-lg line-clamp-2 text-[#000000] group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-[#737692]">
            {excerpt}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-[#737692]">
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>24</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-1 text-sm hover:text-primary transition-colors ml-auto"
            >
              <Bookmark className="h-4 w-4" />
            </motion.button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function News() {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const newsData = [
    {
      title: "Islamic Finance Market Reaches New Heights in Q4 2025",
      excerpt:
        "The global Islamic finance market has shown unprecedented growth, with assets reaching $3.5 trillion...",
      category: "Market Update",
      time: "2 hours ago",
      image: "📈",
      trending: true,
    },
    {
      title: "Sukuk Issuance Surges Amid Economic Recovery",
      excerpt:
        "Corporate and sovereign sukuk issuances have increased significantly as economies recover...",
      category: "Sukuk",
      time: "4 hours ago",
      image: "💰",
    },
    {
      title: "New Shariah-Compliant Investment Opportunities in Tech",
      excerpt:
        "Leading Islamic financial institutions announce new investment vehicles in technology sector...",
      category: "Technology",
      time: "6 hours ago",
      image: "💻",
    },
    {
      title: "Regulatory Framework Updates for Islamic Banks",
      excerpt:
        "Central banks across the region introduce new guidelines for Islamic banking operations...",
      category: "Regulation",
      time: "8 hours ago",
      image: "⚖️",
    },
    {
      title: "ESG Principles Align with Islamic Finance Values",
      excerpt:
        "Environmental, Social, and Governance principles show strong alignment with Islamic finance...",
      category: "ESG",
      time: "10 hours ago",
      image: "🌱",
      trending: true,
    },
    {
      title: "Takaful Industry Shows Strong Growth Potential",
      excerpt:
        "The Islamic insurance sector demonstrates resilience and expansion opportunities...",
      category: "Takaful",
      time: "12 hours ago",
      image: "🛡️",
    },
  ];

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#000000]">
              Latest News
            </h1>
            <p className="mt-2 text-[#737692]">
              Stay updated with the latest in Islamic finance and economics
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={itemVariants}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#737692]" />
          <Input
            placeholder="Search news articles..."
            className="pl-10 h-12 text-base"
          />
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="flex w-full max-w-full gap-2 overflow-x-auto scrollbar-hide px-2 pr-4 snap-x snap-mandatory scroll-px-4 justify-start md:px-0 md:pr-0 md:grid md:max-w-md md:grid-cols-4 md:gap-0 md:overflow-visible md:snap-none">
            <TabsTrigger value="all" className="shrink-0 snap-start">
              All
            </TabsTrigger>
            <TabsTrigger value="trending" className="shrink-0 snap-start">
              Trending
            </TabsTrigger>
            <TabsTrigger value="market" className="shrink-0 snap-start">
              Market
            </TabsTrigger>
            <TabsTrigger value="regulation" className="shrink-0 snap-start">
              Regulation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {newsData.map((news, index) => (
                <NewsCard key={index} {...news} delay={0.2 + index * 0.1} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {newsData
                .filter((news) => news.trending)
                .map((news, index) => (
                  <NewsCard key={index} {...news} delay={0.2 + index * 0.1} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="market" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {newsData
                .filter(
                  (news) =>
                    news.category === "Market Update" ||
                    news.category === "Sukuk",
                )
                .map((news, index) => (
                  <NewsCard key={index} {...news} delay={0.2 + index * 0.1} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="regulation" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {newsData
                .filter((news) => news.category === "Regulation")
                .map((news, index) => (
                  <NewsCard key={index} {...news} delay={0.2 + index * 0.1} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Featured Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-[#000000]">Featured This Week</CardTitle>
            <CardDescription className="text-[#737692]">
              Most impactful stories of the week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Global Islamic Finance Summit 2026 Announced",
                  reads: "2.4k",
                },
                {
                  title: "Major Bank Launches Digital Islamic Banking Platform",
                  reads: "1.8k",
                },
                {
                  title: "Fintech Innovation in Islamic Banking",
                  reads: "1.5k",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ x: 8, scale: 1.02 }}
                  className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="font-medium text-[#000000]">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-sm text-[#737692]">
                    {item.reads} reads
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
