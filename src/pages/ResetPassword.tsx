import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useResetPassword } from "@/hooks/useAuth";

const CODE_SLOT_KEYS = ["d1", "d2", "d3", "d4", "d5", "d6"] as const;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetPassword = useResetPassword();

  const initialEmail = useMemo(() => searchParams.get("email") ?? "", [searchParams]);
  const initialCode = useMemo(() => searchParams.get("code") ?? "", [searchParams]);

  const [email, setEmail] = useState(initialEmail);
  const [codeDigits, setCodeDigits] = useState<string[]>(() => {
    const digits = initialCode.replaceAll(/\D/g, "").slice(0, 6).split("");
    return Array.from({ length: 6 }, (_, i) => digits[i] ?? "");
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const codeRefs = useRef<Array<HTMLInputElement | null>>([]);

  const code = codeDigits.join("");

  const handleCodeChange = (index: number, value: string) => {
    const digit = value.replaceAll(/\D/g, "").slice(-1);
    setCodeDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (codeDigits[index]) {
        setCodeDigits((prev) => {
          const next = [...prev];
          next[index] = "";
          return next;
        });
      } else if (index > 0) {
        codeRefs.current[index - 1]?.focus();
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replaceAll(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;

    setCodeDigits(Array.from({ length: 6 }, (_, i) => pasted[i] ?? ""));
    const focusIndex = Math.min(pasted.length, 5);
    codeRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || code.length !== 6 || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await resetPassword.mutateAsync({
        email: email.trim(),
        code: code.trim(),
        newPassword,
      });
      navigate("/login");
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
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
            <p className="text-red-100 mt-1 text-sm">
              Enter your reset code and set a new password
            </p>
          </div>

          <CardContent className="p-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-700 font-semibold text-sm">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="h-11 border-2 border-gray-200 focus:border-red-500 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-gray-700 font-semibold text-sm">
                  Reset Code
                </Label>
                <div className="flex items-center justify-between gap-2">
                  {CODE_SLOT_KEYS.map((slotKey, index) => (
                    <Input
                      key={slotKey}
                      id={index === 0 ? "code" : undefined}
                      ref={(el) => {
                        codeRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      autoComplete="one-time-code"
                      autoFocus={index === 0}
                      value={codeDigits[index]}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      onPaste={handleCodePaste}
                      className="h-12 text-center text-lg font-semibold border-2 border-gray-200 focus:border-red-500 rounded-lg"
                      aria-label={`Reset code digit ${index + 1}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500">Enter the 6-digit code sent to your email.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-gray-700 font-semibold text-sm">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="h-11 border-2 border-gray-200 focus:border-red-500 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold text-sm">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="h-11 border-2 border-gray-200 focus:border-red-500 rounded-lg"
                />
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-600 text-red-700 px-4 py-3 rounded">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={resetPassword.isPending}
                className="w-full h-11 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
              >
                {resetPassword.isPending ? (
                  "Resetting..."
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Reset Password
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-200 text-center text-sm space-y-2">
              <Link to="/forgot-password" className="block font-semibold text-red-600 hover:text-red-700">
                Request a new reset code
              </Link>
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
