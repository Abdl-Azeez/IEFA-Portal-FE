import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!email || !password) {
      setError('Email and password are required')
      setIsLoading(false)
      return
    }

    try {
      const success = await login(email, password)
      if (success) {
        navigate('/')
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ backgroundColor: '#FFEFEF' }}>
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-60 -right-60 w-96 h-96 rounded-full bg-red-100/30"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-60 -left-60 w-80 h-80 rounded-full bg-red-50/40"
          animate={{
            scale: [1.05, 1, 1.05],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-white border-0 shadow-xl rounded-2xl overflow-hidden">
          {/* Header with red gradient */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 p-8 text-center relative">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-lg"
            >
              <LogIn className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl font-bold text-white mb-2 tracking-tight"
            >
              Welcome Back
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-red-100"
            >
              Sign in to your IEFA account
            </motion.p>
          </div>

          <CardContent className="p-8">
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                  <Mail className="w-4 h-4 text-red-600" />
                  Email Address
                </Label>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 border-2 border-gray-200 focus:border-red-500 rounded-lg transition-all duration-200 focus:ring-4 focus:ring-red-100 bg-white"
                  />
                </motion.div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                  <Lock className="w-4 h-4 text-red-600" />
                  Password
                </Label>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative"
                >
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 border-2 border-gray-200 focus:border-red-500 rounded-lg transition-all duration-200 focus:ring-4 focus:ring-red-100 bg-white pr-10"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                </motion.div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-l-4 border-red-600 text-red-700 px-4 py-3 rounded"
                >
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    'Sign In'
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
                Don't have an account?{' '}
                <motion.button
                  onClick={() => navigate('/signup')}
                  className="text-red-600 hover:text-red-700 font-semibold transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign up
                </motion.button>
              </motion.p>
              <motion.p
                className="text-center text-gray-500 text-xs mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                By signing in, you agree to our Terms of Service and Privacy Policy
              </motion.p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default Login