import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from "./pages/Header"
import Footer from "./pages/Footer"

const Food = lazy(() => import('./pages/Food'))


export default function App(){
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/food" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-slate-500 text-lg">Cargando...</div></div>}><Food /></Suspense>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
} 
