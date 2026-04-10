import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Eye,
  EyeOff,
  UserPlus,
  Mail,
  Lock,
  User,
  AtSign,
  Phone,
  Globe,
  Check,
  X,
  Loader2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRegister, useCheckUsername } from '@/hooks/useAuth'

/* -- Validation helpers ---------------------------------------------------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/
const PHONE_RE = /^\+?[0-9\s\-().]{7,20}$/
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[\W_]/.test(pw)) score++
  const map = [
    { label: '', color: 'bg-gray-200' },
    { label: 'Very weak', color: 'bg-red-500' },
    { label: 'Weak', color: 'bg-orange-400' },
    { label: 'Fair', color: 'bg-yellow-400' },
    { label: 'Good', color: 'bg-blue-500' },
    { label: 'Strong', color: 'bg-green-500' },
  ]
  return { score, ...map[score] }
}

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error'

function generateUsername(first: string, last: string): string {
  const clean = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  const base = (clean(first) + clean(last)).slice(0, 16);
  const suffix = Math.floor(100 + Math.random() * 900); // 3-digit number
  return base ? `${base}${suffix}` : "";
}

const Signup = () => {
  const [firstName, setFirstName]             = useState('')
  const [lastName, setLastName]               = useState('')
  const [username, setUsername]               = useState('')
  const [usernameManuallyEdited, setUsernameManuallyEdited] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useNavigate();
  const registerMutation = useRegister();
  const checkUsernameMutation = useCheckUsername();

  const strength = passwordStrength(password);

  /* -- Auto-generate username from first+last name (unless user edited it) - */
  useEffect(() => {
    if (usernameManuallyEdited) return;
    if (!firstName && !lastName) return;
    const generated = generateUsername(firstName, lastName);
    if (generated) {
      setUsername(generated);
      setUsernameStatus("idle");
    }
  }, [firstName, lastName, usernameManuallyEdited]);

  /* -- Username debounce availability check -------------------------------- */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!username || !USERNAME_RE.test(username)) {
      setUsernameStatus('idle')
      return
    }

    setUsernameStatus('checking')
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await checkUsernameMutation.mutateAsync(username)
        setUsernameStatus(result.available ? 'available' : 'taken')
      } catch {
        setUsernameStatus('error')
      }
    }, 600)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  /* -- Validation ---------------------------------------------------------- */
  function validate(): Record<string, string> {
    const e: Record<string, string> = {}

    if (!firstName.trim()) e.firstName = 'First name is required'
    else if (!/^[a-zA-Z\s'-]{2,50}$/.test(firstName.trim()))
      e.firstName = 'First name must contain only letters'

    if (!lastName.trim()) e.lastName = 'Last name is required'
    else if (!/^[a-zA-Z\s'-]{2,50}$/.test(lastName.trim()))
      e.lastName = 'Last name must contain only letters'

    if (!username) e.username = 'Username is required'
    else if (!USERNAME_RE.test(username))
      e.username = 'Username: 3\u201320 chars, letters, numbers or underscores only'
    else if (usernameStatus === 'taken')    e.username = 'Username is already taken'
    else if (usernameStatus === 'checking') e.username = 'Still checking username availability'
    else if (usernameStatus === 'error')    e.username = 'Could not verify username availability'

    if (!email) e.email = 'Email is required'
    else if (!EMAIL_RE.test(email)) e.email = 'Please enter a valid email address'

    if (!phone) e.phone = 'Phone number is required'
    else if (!PHONE_RE.test(phone)) e.phone = 'Please enter a valid phone number'

    if (!country.trim()) e.country = 'Country is required'

    if (!password) e.password = 'Password is required'
    else if (!PASSWORD_RE.test(password))
      e.password = 'Must be 8+ chars with uppercase, lowercase, number & special character'

    if (!confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword)  e.confirmPassword = 'Passwords do not match'

    return e
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    try {
      await registerMutation.mutateAsync({
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        username,
        email,
        phone,
        country: country.trim(),
        password,
        role: 'student',
      })
      navigate('/')
    } catch {
      // errors handled by toast in hook
    }
  }

  /* -- Sub-components ------------------------------------------------------ */
  function UsernameStatusIcon() {
    if (usernameStatus === 'checking')
      return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
    if (usernameStatus === 'available')
      return <Check className="h-4 w-4 text-green-500" />
    if (usernameStatus === 'taken')
      return <X className="h-4 w-4 text-red-500" />
    return null
  }

  function FieldError({ name }: Readonly<{ name: string }>) {
    return (
      <AnimatePresence>
        {errors[name] && (
          <motion.p
            key={name}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-red-600 text-xs mt-1 flex items-center gap-1"
          >
            <X className="h-3 w-3 flex-shrink-0" />
            {errors[name]}
          </motion.p>
        )}
      </AnimatePresence>
    )
  }

  const inputClass = (name: string) =>
    `h-11 border-2 rounded-lg transition-all duration-200 bg-white ${
      errors[name]
        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
        : 'border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100'
    }`

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ backgroundColor: '#FFEFEF' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-60 -right-60 w-96 h-96 rounded-full bg-red-100/30"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-60 -left-60 w-80 h-80 rounded-full bg-red-50/40"
          animate={{ scale: [1.05, 1, 1.05] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-xl relative z-10 my-8"
      >
        <Card className="bg-white border-0 shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 p-8 text-center relative">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.8, type: 'spring', stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-lg"
            >
              <UserPlus className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl font-bold text-white mb-2 tracking-tight"
            >
              Create Account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-red-100"
            >
              Join the IEFA community
            </motion.p>
          </div>

          <CardContent className="p-8">
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              noValidate
            >
              {/* First + Last name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="firstName" className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                    <User className="w-3.5 h-3.5 text-red-600" />
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); setErrors((p) => ({ ...p, firstName: '' })) }}
                    className={inputClass('firstName')}
                  />
                  <FieldError name="firstName" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="lastName" className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                    <User className="w-3.5 h-3.5 text-red-600" />
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => { setLastName(e.target.value); setErrors((p) => ({ ...p, lastName: '' })) }}
                    className={inputClass('lastName')}
                  />
                  <FieldError name="lastName" />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1">
                <Label htmlFor="username" className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                  <AtSign className="w-3.5 h-3.5 text-red-600" />
                  Username
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder="janedoe123"
                    value={username}
                    onChange={(e) => {
                      setUsernameManuallyEdited(true);
                      setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))
                      setErrors((p) => ({ ...p, username: '' }))
                    }}
                    className={`${inputClass('username')} pr-10 ${
                      usernameStatus === 'available' ? 'border-green-400 focus:border-green-500 focus:ring-green-100' :
                      usernameStatus === 'taken'     ? 'border-red-400'  : ''
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    <UsernameStatusIcon />
                  </span>
                </div>
                {usernameStatus === 'available' && !errors.username && (
                  <p className="text-green-600 text-xs flex items-center gap-1">
                    <Check className="h-3 w-3" /> Username is available
                  </p>
                )}
                {usernameStatus === 'taken' && !errors.username && (
                  <p className="text-red-600 text-xs flex items-center gap-1">
                    <X className="h-3 w-3" /> Username is already taken
                  </p>
                )}
                <FieldError name="username" />
                <p className="text-gray-400 text-[11px]">3\u201320 characters \u00b7 letters, numbers and underscores only</p>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email" className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                  <Mail className="w-3.5 h-3.5 text-red-600" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })) }}
                  className={inputClass('email')}
                />
                <FieldError name="email" />
              </div>

              {/* Phone + Country */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                    <Phone className="w-3.5 h-3.5 text-red-600" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+2348012345678"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: '' })) }}
                    className={inputClass('phone')}
                  />
                  <FieldError name="phone" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="country" className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                    <Globe className="w-3.5 h-3.5 text-red-600" />
                    Country
                  </Label>
                  <Input
                    id="country"
                    type="text"
                    placeholder="Nigeria"
                    value={country}
                    onChange={(e) => { setCountry(e.target.value); setErrors((p) => ({ ...p, country: '' })) }}
                    className={inputClass('country')}
                  />
                  <FieldError name="country" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password" className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                  <Lock className="w-3.5 h-3.5 text-red-600" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })) }}
                    className={`${inputClass('password')} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="pt-1 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= strength.score ? strength.color : 'bg-gray-100'
                          }`}
                        />
                      ))}
                    </div>
                    {strength.label && (
                      <p className="text-[11px] text-gray-500">{strength.label}</p>
                    )}
                  </div>
                )}
                <FieldError name="password" />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                  <Lock className="w-3.5 h-3.5 text-red-600" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })) }}
                    className={`${inputClass('confirmPassword')} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <FieldError name="confirmPassword" />
              </div>

              <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                <Button
                  type="submit"
                  disabled={
                    registerMutation.isPending ||
                    usernameStatus === 'checking' ||
                    usernameStatus === 'taken'
                  }
                  className="w-full h-11 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {registerMutation.isPending ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account\u2026
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </motion.div>
            </motion.form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <motion.p
                className="text-center text-gray-600 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                Already have an account?{' '}
                <motion.button
                  onClick={() => navigate('/login')}
                  className="text-red-600 hover:text-red-700 font-semibold transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign in
                </motion.button>
              </motion.p>
              <motion.p
                className="text-center text-gray-400 text-xs mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </motion.p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default Signup
