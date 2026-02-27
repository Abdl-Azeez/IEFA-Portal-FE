import { useEffect } from "react";
import { motion } from "framer-motion";
import { Construction } from "lucide-react";

export function NotAvailable() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center"
        >
          <Construction className="w-12 h-12 text-primary" />
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Coming Soon</h1>
          <p className="text-lg text-[#737692] max-w-md">
            This page is not available at the moment. We're working hard to
            bring you this feature soon.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-4"
        >
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Back to Dashboard
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
