import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Browse from './pages/Browse'
import ListingDetail from './pages/ListingDetail'
import PostMaterial from './pages/PostMaterial'
import ScanMaterial from './pages/ScanMaterial'
import MapView from './pages/MapView'
import Carbon from './pages/Carbon'
import Profile from './pages/Profile'
import RequestPage from './pages/RequestPage'
import './App.css'

function App() {
  const location = useLocation()
  const hideNav = ['/listing/', '/scan', '/request'].some(p => location.pathname.startsWith(p))

  return (
    <Layout hideNav={hideNav}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse/:category" element={<Browse />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/post" element={<PostMaterial />} />
        <Route path="/scan" element={<ScanMaterial />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/carbon" element={<Carbon />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/request" element={<RequestPage />} />
      </Routes>
    </Layout>
  )
}

export default App
