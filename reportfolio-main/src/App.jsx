import LoadingScreen  from './components/LoadingScreen'
import CustomCursor   from './components/CustomCursor'
import Navbar         from './components/Navbar'
import Hero           from './components/Hero'
import About          from './components/About'
import Skills         from './components/Skills'
import Projects       from './components/Projects'
import Certificates   from './components/Certificates'
import Contact        from './components/Contact'
import Footer         from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen font-sans" style={{ background: '#0a0a0a', color: '#e0e0e0' }}>
      <LoadingScreen />
      <CustomCursor />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Certificates />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
