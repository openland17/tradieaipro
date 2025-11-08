import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import QuoteEditor from './QuoteEditor'
import SharePage from './SharePage'
import { AuroraBackground } from './components/fx/AuroraBackground'
import { GridBackdrop } from './components/fx/GridBackdrop'
import { NoiseLayer } from './components/fx/NoiseLayer'

function App() {
  return (
    <BrowserRouter>
      <AuroraBackground />
      <GridBackdrop />
      <NoiseLayer />
      <div className="relative z-10 min-h-screen">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<QuoteEditor />} />
            <Route path="/share/:slug" element={<SharePage />} />
          </Routes>
        </AnimatePresence>
      </div>
    </BrowserRouter>
  )
}

export default App

