import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from "./pages/Header"
import Footer from "./pages/Footer"
import Food from "./pages/Food"

export default function App(){
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/food" element={<Food />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
} 
