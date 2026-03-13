import { useEffect } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Mail, MessageCircle, BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

export default function Support() {
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
          Support
        </h1>
        <p className="mt-2 text-[#737692]">
          If something feels unclear or you&apos;d like to suggest a feature,
          this is where you&apos;ll be able to reach the IEFA team.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <motion.div variants={itemVariants}>
          <Card className="transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-[#D52B1E]" />
                </div>
                <div>
                  <CardTitle className="text-[#000000]">Contact IEFA</CardTitle>
                  <CardDescription className="text-[#737692]">
                    This is not a live form yet, but it shows the structure we
                    can wire into your actual support inbox or ticketing tool
                    later.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#000000]">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="you@organisation.com"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#000000]">
                    Topic
                  </label>
                  <Select
                    variant="student"
                    className="mt-2"
                  >
                    <option>Question about the platform</option>
                    <option>Bug or issue</option>
                    <option>Content / research request</option>
                    <option>Partnership / collaboration</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#000000]">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Share as much context as you can so we can help quickly."
                    className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#D52B1E] focus:ring-2 focus:ring-[#D52B1E]/10"
                  />
                </div>
                <Button className="w-full bg-[#D52B1E] hover:bg-[#B8241B] text-white">
                  <Mail className="h-4 w-4 mr-2" />
                  Submit (placeholder)
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <Card className="transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-[#D52B1E]" />
                </div>
                <div>
                  <CardTitle className="text-[#000000]">Help centre</CardTitle>
                  <CardDescription className="text-[#737692]">
                    You could link to quick-start guides, FAQs, and video
                    walkthroughs from here.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-[#D52B1E] text-[#D52B1E] hover:bg-[#D52B1E] hover:text-white"
              >
                Browse FAQs
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[#D52B1E]" />
                <CardTitle className="text-[#000000]">
                  Fast feedback loop
                </CardTitle>
              </div>
              <CardDescription className="text-[#737692]">
                The fastest way to make this portal better is to tell us
                what&apos;s missing or what feels confusing. This page is
                designed to encourage that.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
