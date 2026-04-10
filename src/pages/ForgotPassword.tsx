import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForgotPassword } from "@/hooks/useAuth";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const forgotPassword = useForgotPassword();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [requested, setRequested] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      await forgotPassword.mutateAsync({ email: email.trim() });
      setRequested(true);
    } catch {
      // Toast from hook
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#FFEFEF" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white border-0 shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-500 p-7 text-center">
            <div className="mx-auto w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-3">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
            <p className="text-red-100 mt-1 text-sm">
              Enter your email to receive a reset code
            </p>
          </div>

          <CardContent className="p-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-semibold text-sm">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-2 border-gray-200 focus:border-red-500 rounded-lg"
                />
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-600 text-red-700 px-4 py-3 rounded">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {requested && (
                <div className="bg-green-50 border-l-4 border-green-600 text-green-700 px-4 py-3 rounded text-sm">
                  Reset code requested. If your account exists, please check your email.
                </div>
              )}

              <Button
                type="submit"
                disabled={forgotPassword.isPending}
                className="w-full h-11 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
              >
                {forgotPassword.isPending ? "Sending..." : "Send Reset Code"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`)}
              >
                <KeyRound className="w-4 h-4 mr-2" />
                I Already Have A Code
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-200 text-center text-sm">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-semibold text-red-600 hover:text-red-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
