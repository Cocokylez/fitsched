import { motion } from 'framer-motion'
import TiltCard from './TiltCard'

const fadeUp = (delay=0) => ({ initial:{opacity:0,y:24}, whileInView:{opacity:1,y:0}, viewport:{once:false,margin:'-30px'}, transition:{duration:0.65,delay,ease:[0.4,0,0.2,1]} })

export default function Projects() {
  return (
    <section id="projects" className="relative z-10 py-[100px]">
      <div className="max-w-[680px] mx-auto px-6">
        <motion.span {...fadeUp(0)} className="section-label block">Projects</motion.span>
        <motion.div {...fadeUp(0.1)}>
          <TiltCard className="glass-card flex flex-col items-center text-center py-12 px-9">
            <span className="text-[2.5rem] mb-3.5">🚧</span>
            <h3 className="font-serif font-normal text-2xl mb-2.5" style={{color:'#ccc'}}>Coming Soon</h3>
            <p className="text-[0.95rem] leading-[1.7] font-light max-w-[340px]" style={{color:'#555'}}>
              Currently working on personal projects to apply and improve my skills. Check back soon!
            </p>
          </TiltCard>
        </motion.div>
      </div>
    </section>
  )
}
