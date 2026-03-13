import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Globe2, Lock, Mail, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChangePassword } from "@/hooks/useAuth";

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

export default function Settings() {
  const changePassword = useChangePassword()
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({})

  function validatePw() {
    const errs: Record<string, string> = {}
    if (!pwForm.currentPassword) errs.currentPassword = 'Current password is required'
    if (!pwForm.newPassword || pwForm.newPassword.length < 8) errs.newPassword = 'New password must be at least 8 characters'
    if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setPwErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleChangePassword() {
    if (!validatePw()) return
    changePassword.mutate(
      { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword },
      { onSuccess: () => setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }) },
    )
  }

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
          Settings
        </h1>
        <p className="mt-2 text-[#737692]">
          Configure how IEFA works for you. These controls are illustrative for
          now, and can be wired to real preferences later.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-[#D52B1E]" />
                </div>
                <div>
                  <CardTitle className="text-[#000000]">
                    Email preferences
                  </CardTitle>
                  <CardDescription className="text-[#737692]">
                    Control updates about research, data, and community
                    activity.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label className="flex items-center justify-between gap-4 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <span className="font-medium text-[#000000]">
                    Research highlights
                  </span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#D52B1E]"
                    defaultChecked
                  />
                </label>
                <label className="flex items-center justify-between gap-4 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <span className="font-medium text-[#000000]">
                    Platform updates
                  </span>
                  <input type="checkbox" className="h-4 w-4 accent-[#D52B1E]" />
                </label>
                <label className="flex items-center justify-between gap-4 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <span className="font-medium text-[#000000]">
                    Events and programs
                  </span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#D52B1E]"
                    defaultChecked
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-[#D52B1E]" />
                </div>
                <div>
                  <CardTitle className="text-[#000000]">
                    In-app notifications
                  </CardTitle>
                  <CardDescription className="text-[#737692]">
                    Decide what shows up in your notification tray (to be
                    built).
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label className="flex items-center justify-between gap-4 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <span className="font-medium text-[#000000]">
                    New reports and data views
                  </span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#D52B1E]"
                    defaultChecked
                  />
                </label>
                <label className="flex items-center justify-between gap-4 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <span className="font-medium text-[#000000]">
                    Community replies and mentions
                  </span>
                  <input type="checkbox" className="h-4 w-4 accent-[#D52B1E]" />
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center">
                  <Globe2 className="h-5 w-5 text-[#D52B1E]" />
                </div>
                <div>
                  <CardTitle className="text-[#000000]">
                    Region & language
                  </CardTitle>
                  <CardDescription className="text-[#737692]">
                    These defaults will influence content and data views.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-[#000000]">
                    Primary region
                  </span>
                  <select className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#D52B1E] focus:ring-2 focus:ring-[#D52B1E]/10">
                    <option>Nigeria</option>
                    <option>West Africa</option>
                    <option>Pan-African</option>
                    <option>Global</option>
                  </select>
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-[#D52B1E]" />
                </div>
                <div>
                  <CardTitle className="text-[#000000]">Security</CardTitle>
                  <CardDescription className="text-[#737692]">
                    Change your account password.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                  {pwErrors.currentPassword && (
                    <p className="text-xs text-red-500">{pwErrors.currentPassword}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                    placeholder="At least 8 characters"
                  />
                  {pwErrors.newPassword && (
                    <p className="text-xs text-red-500">{pwErrors.newPassword}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={pwForm.confirmPassword}
                    onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="Repeat new password"
                  />
                  {pwErrors.confirmPassword && (
                    <p className="text-xs text-red-500">{pwErrors.confirmPassword}</p>
                  )}
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={changePassword.isPending}
                  className="bg-[#D52B1E] hover:bg-[#B8241B] gap-2"
                >
                  {changePassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
