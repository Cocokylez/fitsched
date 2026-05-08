import { motion } from 'framer-motion'
import TiltCard from './TiltCard'

const fadeUp = (delay=0) => ({ initial:{opacity:0,y:24}, whileInView:{opacity:1,y:0}, viewport:{once:false,margin:'-30px'}, transition:{duration:0.65,delay,ease:[0.4,0,0.2,1]} })

export default function About() {
  return (
    <section id="about" className="relative z-10 py-[100px]">
      <div className="max-w-[680px] mx-auto px-6">
        <motion.div {...fadeUp(0)}>
          <TiltCard className="glass-card">
            <span className="section-label">About Me</span>
            <p className="text-[1.02rem] leading-[1.78] font-light" style={{color:'#666'}}>
              I am a first-year Information Technology student currently building my foundation in
              programming and web development. I have learned the basics of Java, HTML, CSS, and
              JavaScript, and I am continuously improving my skills through practice and projects.
            </p>
            <p className="mt-3.5 text-[1.02rem] leading-[1.78] font-light" style={{color:'#666'}}>
              I am passionate about technology and aim to become a computer engineer and future
              entrepreneur. I focus on learning, consistency, and developing real-world skills.
            </p>
          </TiltCard>
        </motion.div>
      </div>
    </section>
  )
}
