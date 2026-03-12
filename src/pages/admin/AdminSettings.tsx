import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Globe,
  Mail,
  Bell,
  Shield,
  Palette,
  Save,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } }

type SettingsTab = 'general' | 'email' | 'notifications' | 'security' | 'appearance'

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
]

function Toggle({ enabled, onToggle }: Readonly<{ enabled: boolean; onToggle: () => void }>) {
  return (
    <button onClick={onToggle} className="shrink-0">
      {enabled ? (
        <ToggleRight className="h-6 w-6 text-[#D52B1E]" />
      ) : (
        <ToggleLeft className="h-6 w-6 text-slate-300" />
      )}
    </button>
  )
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [showApiKey, setShowApiKey] = useState(false)
  const [notifications, setNotifications] = useState({
    newUser: true,
    newPayment: true,
    flaggedContent: true,
    systemAlerts: true,
    weeklyReport: false,
  })

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-800">Admin Settings</h1>
        <p className="text-slate-500 text-sm">Configure the portal and system preferences</p>
      </motion.div>

      <motion.div variants={item} className="flex gap-5">
        {/* Side tabs */}
        <div className="w-48 shrink-0 space-y-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-[#D52B1E] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {activeTab === 'general' && (
            <div className="space-y-5">
              <h3 className="font-bold text-slate-700 border-b border-gray-100 pb-3">Site Configuration</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-600">Platform Name</Label>
                  <Input defaultValue="IEFA Portal" className="rounded-lg h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-600">Support Email</Label>
                  <Input defaultValue="support@iefa.org" className="rounded-lg h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-600">Default Language</Label>
                  <Input defaultValue="English (en)" className="rounded-lg h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-600">Timezone</Label>
                  <Input defaultValue="UTC +04:00 (Gulf Standard Time)" className="rounded-lg h-10" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-600">Platform Description</Label>
                <textarea
                  defaultValue="The International Islamic Finance Education & Analytics Platform — connecting professionals, learners and institutions worldwide."
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D52B1E]/20 resize-none"
                />
              </div>
              <div className="flex justify-end">
                <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5">
                  <Save className="h-3.5 w-3.5" /> Save Changes
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-5">
              <h3 className="font-bold text-slate-700 border-b border-gray-100 pb-3">Email Configuration</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-600">SMTP Host</Label>
                  <Input defaultValue="smtp.sendgrid.net" className="rounded-lg h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-600">SMTP Port</Label>
                  <Input defaultValue="587" className="rounded-lg h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-600">Sender Name</Label>
                  <Input defaultValue="IEFA Platform" className="rounded-lg h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-600">Sender Email</Label>
                  <Input defaultValue="noreply@iefa.org" className="rounded-lg h-10" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-600">API Key</Label>
                <div className="relative">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    defaultValue="SG.aBcDeFgHiJkLmNoPqRsTuVwXyZ"
                    className="rounded-lg h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" size="sm" className="rounded-lg">Test Connection</Button>
                <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5">
                  <Save className="h-3.5 w-3.5" /> Save
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <h3 className="font-bold text-slate-700 border-b border-gray-100 pb-3">Admin Notifications</h3>
              <div className="space-y-4">
                {(
                  [
                    { key: 'newUser', label: 'New User Registration', desc: 'Notify when a new user registers' },
                    { key: 'newPayment', label: 'New Payment Received', desc: 'Notify on successful transactions' },
                    { key: 'flaggedContent', label: 'Flagged Content', desc: 'Alert on reported posts or discussions' },
                    { key: 'systemAlerts', label: 'System Alerts', desc: 'Critical system and API alerts' },
                    { key: 'weeklyReport', label: 'Weekly Summary Report', desc: 'Receive a weekly analytics digest' },
                  ] as const
                ).map((n) => (
                  <div key={n.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{n.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.desc}</p>
                    </div>
                    <Toggle enabled={notifications[n.key]} onToggle={() => toggleNotif(n.key)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-5">
              <h3 className="font-bold text-slate-700 border-b border-gray-100 pb-3">Security Settings</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-600">Current Password</Label>
                  <Input type="password" placeholder="••••••••" className="rounded-lg h-10 max-w-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-600">New Password</Label>
                  <Input type="password" placeholder="••••••••" className="rounded-lg h-10 max-w-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-600">Confirm New Password</Label>
                  <Input type="password" placeholder="••••••••" className="rounded-lg h-10 max-w-sm" />
                </div>
                <hr className="border-gray-100" />
                <div className="flex items-center justify-between max-w-sm">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Two-Factor Authentication</p>
                    <p className="text-xs text-slate-400 mt-0.5">Add an extra layer of security</p>
                  </div>
                  <Toggle enabled={false} onToggle={() => {}} />
                </div>
                <div className="flex justify-end pt-2">
                  <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5">
                    <Save className="h-3.5 w-3.5" /> Update Password
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <h3 className="font-bold text-slate-700 border-b border-gray-100 pb-3">Portal Appearance</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-slate-600 mb-2 block">Brand Colour</Label>
                  <div className="flex items-center gap-3">
                    {['#D52B1E', '#1d4ed8', '#059669', '#7c3aed', '#0f172a'].map((c) => (
                      <button
                        key={c}
                        className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${c === '#D52B1E' ? 'border-slate-400 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <Input defaultValue="#D52B1E" className="h-9 w-28 rounded-lg text-xs font-mono" />
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-slate-600 mb-2 block">Admin Sidebar Theme</Label>
                  <div className="flex gap-3">
                    {[
                      { label: 'Dark (current)', bg: '#0f172a', active: true },
                      { label: 'Slate', bg: '#1e293b', active: false },
                      { label: 'Light', bg: '#ffffff', active: false },
                    ].map((t) => (
                      <button
                        key={t.label}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-colors ${t.active ? 'border-[#D52B1E]' : 'border-gray-200 hover:border-slate-300'}`}
                      >
                        <div className="h-10 w-16 rounded-lg" style={{ backgroundColor: t.bg, border: '1px solid #e5e7eb' }} />
                        <span className="text-xs text-slate-600">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5">
                    <Save className="h-3.5 w-3.5" /> Apply Theme
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
