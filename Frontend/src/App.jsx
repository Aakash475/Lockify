import './App.css'
import { Toaster } from 'react-hot-toast'
import APIManagement from './Components/APIManagement'
import UserManagement from './Components/UserManagement'
import { Navigate, Route, Routes } from 'react-router-dom'
import { UserContext, UserProvider } from './UserContext'
import { useContext } from 'react'

function App() {
  const token = localStorage.getItem('token')
  const { currentUser } = useContext(UserContext)
  return (
    <>
      <Toaster position='top-right' reverseOrder={false} />
      <Routes>
        <Route path="/" element={<UserManagement />} />
        <Route path="/login" element={token && currentUser ? <Navigate to="/passwordmanager" /> : <UserManagement />} />
        <Route path='/passwordmanager' element={token && currentUser ? <APIManagement /> : <Navigate to="/login" />} />
      </Routes>
    </>
  )
}

export default App
