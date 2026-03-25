import { motion } from 'framer-motion'
import { Mail, Phone, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer
      className="w-full bg-[#111111] py-12 px-6 z-50 relative mt-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <img src="/Logo.svg" alt="IEFA Logo" className="h-10 w-auto brightness-0 invert" />
            <p className="text-sm text-gray-400">
              International Ethical Finance Academy - Empowering investors with ethical finance education and market insights.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Instagram, href: '#' },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="w-9 h-9 rounded-full bg-[#1F1F1F] flex items-center justify-center text-gray-400 hover:text-primary hover:bg-[#2A2A2A] transition-colors shadow-sm"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['About IEFA', 'IEFA Fellowship', 'Innovation Hub', 'IEFA Training', 'Customized Training'].map((link) => (
                <li key={link}>
                  <motion.a
                    href="#"
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                    whileHover={{ x: 3 }}
                  >
                    {link}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              {['News & Press Releases', 'Privacy Policy', 'Quality Policy'].map((link) => (
                <li key={link}>
                  <motion.a
                    href="#"
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                    whileHover={{ x: 3 }}
                  >
                    {link}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:hq@IEFAcademy.org" className="hover:text-primary transition-colors">
                  hq@IEFAcademy.org
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+2348091000117" className="hover:text-primary transition-colors">
                  +234 809 100 0117
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-[#1F1F1F]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} International Ethical Finance Academy. All rights reserved.
            </p>
            <div className="flex gap-6">
              <motion.a
                href="#"
                className="text-sm text-gray-400 hover:text-primary transition-colors"
                whileHover={{ y: -1 }}
              >
                Privacy
              </motion.a>
              <motion.a
                href="#"
                className="text-sm text-gray-400 hover:text-primary transition-colors"
                whileHover={{ y: -1 }}
              >
                Terms
              </motion.a>
              <motion.a
                href="#"
                className="text-sm text-gray-400 hover:text-primary transition-colors"
                whileHover={{ y: -1 }}
              >
                Cookies
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
