import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bell, Globe2, Lock, Mail, Loader2, Save } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { useChangePassword, useUpdateSettings } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth";

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

const REGIONS = [
  "Nigeria",
  "West Africa",
  "East Africa",
  "North Africa",
  "Pan-African",
  "Middle East",
  "South Asia",
  "Southeast Asia",
  "Global",
];

export default function Settings() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const changePassword = useChangePassword();
  const updateSettings = useUpdateSettings();

  // --- Password form ---
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  // --- Notification / email preferences ---
  const [emailPrefs, setEmailPrefs] = useState({
    researchHighlights: true,
    platformUpdates: false,
    eventsAndPrograms: true,
  });
  const [notifPrefs, setNotifPrefs] = useState({
    newReportsAndDataViews: true,
    communityRepliesAndMentions: false,
  });
  const [region, setRegion] = useState("Nigeria");

  // Initialise from persisted user settings when the user object loads
  useEffect(() => {
    if (user?.settings) {
      const s = user.settings;
      setEmailPrefs({
        researchHighlights: s.researchHighlights ?? true,
        platformUpdates: s.platformUpdates ?? false,
        eventsAndPrograms: s.eventsAndPrograms ?? true,
      });
      setNotifPrefs({
        newReportsAndDataViews: s.newReportsAndDataViews ?? true,
        communityRepliesAndMentions: s.communityRepliesAndMentions ?? false,
      });
      if (s.primaryRegion) setRegion(s.primaryRegion);
    }
  }, [user?.id]);

  function handleSavePreferences() {
    updateSettings.mutate({
      ...emailPrefs,
      ...notifPrefs,
      primaryRegion: region,
    });
  }

  function validatePw() {
    const errs: Record<string, string> = {};
    if (!pwForm.currentPassword)
      errs.currentPassword = "Current password is required";
    if (!pwForm.newPassword || pwForm.newPassword.length < 8)
      errs.newPassword = "New password must be at least 8 characters";
    if (pwForm.newPassword !== pwForm.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleChangePassword() {
    if (!validatePw()) return;
    changePassword.mutate(
      {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
        confirmNewPassword: pwForm.confirmPassword,
      },
      {
        onSuccess: () =>
          setPwForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }),
      },
    );
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
          Manage your notification preferences, region defaults, and account
          security.
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
                {(
                  [
                    { key: "researchHighlights", label: "Research highlights" },
                    { key: "platformUpdates", label: "Platform updates" },
                    { key: "eventsAndPrograms", label: "Events and programs" },
                  ] as { key: keyof typeof emailPrefs; label: string }[]
                ).map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="font-medium text-[#000000]">{label}</span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#D52B1E]"
                      checked={emailPrefs[key]}
                      onChange={(e) =>
                        setEmailPrefs((p) => ({
                          ...p,
                          [key]: e.target.checked,
                        }))
                      }
                    />
                  </label>
                ))}
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
                    Decide what shows up in your notification tray.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(
                  [
                    {
                      key: "newReportsAndDataViews",
                      label: "New reports and data views",
                    },
                    {
                      key: "communityRepliesAndMentions",
                      label: "Community replies and mentions",
                    },
                  ] as { key: keyof typeof notifPrefs; label: string }[]
                ).map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="font-medium text-[#000000]">{label}</span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#D52B1E]"
                      checked={notifPrefs[key]}
                      onChange={(e) =>
                        setNotifPrefs((p) => ({
                          ...p,
                          [key]: e.target.checked,
                        }))
                      }
                    />
                  </label>
                ))}
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
                    Region &amp; language
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
                  <Select
                    className="mt-2"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 flex justify-end"
        >
          <Button
            onClick={handleSavePreferences}
            disabled={updateSettings.isPending}
            className="bg-[#D52B1E] hover:bg-[#B8241B] gap-2"
          >
            {updateSettings.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Preferences
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
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
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={pwForm.currentPassword}
                    onChange={(e) =>
                      setPwForm((f) => ({
                        ...f,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter current password"
                  />
                  {pwErrors.currentPassword && (
                    <p className="text-xs text-red-500">
                      {pwErrors.currentPassword}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={pwForm.newPassword}
                    onChange={(e) =>
                      setPwForm((f) => ({ ...f, newPassword: e.target.value }))
                    }
                    placeholder="At least 8 characters"
                  />
                  {pwErrors.newPassword && (
                    <p className="text-xs text-red-500">
                      {pwErrors.newPassword}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={pwForm.confirmPassword}
                    onChange={(e) =>
                      setPwForm((f) => ({
                        ...f,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Repeat new password"
                  />
                  {pwErrors.confirmPassword && (
                    <p className="text-xs text-red-500">
                      {pwErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={handleChangePassword}
                    disabled={changePassword.isPending}
                    className="bg-[#D52B1E] hover:bg-[#B8241B] gap-2"
                  >
                    {changePassword.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Update Password
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[#D52B1E] text-[#D52B1E] hover:bg-[#D52B1E]/5"
                    onClick={() =>
                      navigate(
                        `/reset-password?email=${encodeURIComponent(user?.email ?? "")}`,
                      )
                    }
                  >
                    Reset via email code
                  </Button>
                </div>
                <p className="mt-2 text-xs text-[#737692]">
                  Use this if you forgot your current password and need a reset
                  code flow.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
