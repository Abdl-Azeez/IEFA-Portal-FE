import { motion } from 'framer-motion';
import { Lock, UserPlus, LogIn, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function GuestOverlay() {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed backdrop to enhance focus without fully obscuring the background */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm pointer-events-none" />

      {/* Floating Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-[#D52B1E]" />
        
        <div className="p-8 text-center sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-6 shadow-inner">
            <Lock className="h-8 w-8 text-[#D52B1E]" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mb-3 flex items-center justify-center gap-2">
            Login Required
            <Sparkles className="h-5 w-5 text-amber-400" />
          </h2>
          
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-8">
            This section is exclusively available for members. Please log in or create a free account to unlock directory access, learning tools, tools, and more.
          </p>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full h-12 bg-[#D52B1E] hover:bg-[#B8241B] text-white font-medium text-base shadow-lg shadow-red-200 transition-all rounded-xl gap-2"
            >
              <LogIn className="h-4 w-4" />
              Log In to Portal
            </Button>
            
            <Button 
              onClick={() => navigate('/signup')} 
              variant="outline"
              className="w-full h-12 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium text-base transition-all rounded-xl gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Create an Account
            </Button>
          </div>
        </div>

        <div className="bg-gray-50 py-4 px-8 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium">
            Join the Islamic Economy & Finance Association today.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
