import { Routes, Route } from 'react-router-dom'
import MyMenu from './components/MyMenu.jsx'
import Home from './pages/Home.jsx'
import Certs from './pages/Certs.jsx'
import SearchResult from './pages/SearchResult.jsx'

export default function App() {
  return (
    <>
      <MyMenu />
      <main style={{ paddingTop: '60px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/certs/:id" element={<Certs />} />
          <Route path="/search/:searchedWord" element={<SearchResult />} />
        </Routes>
      </main>
    </>
  )
}
