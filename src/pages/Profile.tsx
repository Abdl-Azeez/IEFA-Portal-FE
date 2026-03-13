import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Camera, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ImageUpload } from '@/components/ui/image-upload'
import { useAuthStore } from '@/stores/auth'
import { useUpdateProfile } from '@/hooks/useAuth'

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Angola', 'Argentina', 'Australia', 'Austria',
  'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belgium', 'Brazil', 'Canada', 'China',
  'Egypt', 'Ethiopia', 'France', 'Germany', 'Ghana', 'India', 'Indonesia', 'Iran',
  'Iraq', 'Italy', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Lebanon',
  'Libya', 'Malaysia', 'Mali', 'Mauritania', 'Morocco', 'Niger', 'Nigeria',
  'Oman', 'Pakistan', 'Palestine', 'Qatar', 'Russia', 'Saudi Arabia', 'Senegal',
  'Somalia', 'South Africa', 'Spain', 'Sudan', 'Syria', 'Tanzania', 'Tunisia',
  'Turkey', 'Uganda', 'United Arab Emirates', 'United Kingdom', 'United States',
  'Uzbekistan', 'Yemen', 'Other',
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { y: 18, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
}

export default function Profile() {
  const { user } = useAuthStore()
  const updateProfile = useUpdateProfile()

  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone ?? '',
    country: user?.country ?? '',
    profilePhotoUrl: user?.profilePhotoUrl ?? '',
  })

  // Sync when user data loads from API
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        phone: user.phone ?? '',
        country: user.country ?? '',
        profilePhotoUrl: user.profilePhotoUrl ?? '',
      })
    }
  }, [user?.id])

  function handleSave() {
    if (!user?.id) return
    updateProfile.mutate({ id: user.id, data: form })
  }

  const initials = [form.firstName, form.lastName]
    .filter(Boolean)
    .map((n) => n.charAt(0).toUpperCase())
    .join('') || user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <motion.div
      className="space-y-6 max-w-2xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight text-[#000000]">My Profile</h1>
        <p className="mt-1 text-[#737692]">Update your personal information and profile photo.</p>
      </motion.div>

      {/* Avatar card */}
      <motion.div variants={itemVariants}>
        <Card className="transition-all duration-300 hover:shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center">
                <Camera className="h-5 w-5 text-[#D52B1E]" />
              </div>
              <div>
                <CardTitle className="text-[#000000]">Profile Photo</CardTitle>
                <CardDescription className="text-[#737692]">Upload a photo to personalise your account.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            {form.profilePhotoUrl ? (
              <img
                src={form.profilePhotoUrl}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-md shrink-0"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-[#D52B1E]/10 flex items-center justify-center border-4 border-white shadow-md shrink-0">
                <span className="text-2xl font-bold text-[#D52B1E]">{initials}</span>
              </div>
            )}
            <div className="flex-1">
              <ImageUpload
                id="profile-photo"
                value={form.profilePhotoUrl}
                onChange={(url) => setForm((f) => ({ ...f, profilePhotoUrl: url }))}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info card */}
      <motion.div variants={itemVariants}>
        <Card className="transition-all duration-300 hover:shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center">
                <User className="h-5 w-5 text-[#D52B1E]" />
              </div>
              <div>
                <CardTitle className="text-[#000000]">Personal Information</CardTitle>
                <CardDescription className="text-[#737692]">Your name, phone number, and location.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={user?.email ?? ''}
                disabled
                className="bg-gray-50 text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400">Email address cannot be changed here.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+234 800 000 0000"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Select
                id="country"
                variant="student"
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                className="h-10"
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="bg-[#D52B1E] hover:bg-[#B8241B] gap-2"
              >
                {updateProfile.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
