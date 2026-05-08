import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, filter: 'blur(8px)', y: 12 }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 text-center py-7 text-[0.8rem]"
      style={{ color: '#333', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      © {new Date().getFullYear()} Adrian Kyle Condeza · Built with care
    </motion.footer>
  )
}
