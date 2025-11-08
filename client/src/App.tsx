import { BrowserRouter, Routes, Route } from 'react-router-dom'
import QuoteEditor from './QuoteEditor'
import SharePage from './SharePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuoteEditor />} />
        <Route path="/share/:slug" element={<SharePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

