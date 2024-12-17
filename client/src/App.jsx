import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LogginPage from './pages/LogginPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import { useAuthStore } from './store/useAuthStore';
import { Loader } from 'lucide-react';
import { Toaster } from'react-hot-toast';
import { useThemeStore } from './store/useThemeStore';

const App = () => {
  const { theme } = useThemeStore();
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(()=>{
    checkAuth()
  },[checkAuth])

  if(isCheckingAuth && !authUser ){
    return (
      <div className='flex justify-center items-center h-screen ' >
        <Loader className='size-10 animate-spin ' />
      </div>
    )
  }

  return (
    <div data-theme={theme} >
      <Navbar/>
      <Routes>
        <Route exact path="/" element={authUser ?  <HomePage/> : <Navigate to='/login' /> } />
        <Route exact path="/signup" element={!authUser ? <SignUpPage/> : <Navigate to='/'/> } />
        <Route exact path="/login" element={!authUser ? <LogginPage/> : <Navigate to='/'/>} />
        <Route exact path="/settings" element={<SettingsPage/>} />
        <Route exact path="/profile" element={authUser ? <ProfilePage/> : <Navigate to='/login'/> } />
      </Routes>

      <Toaster/>
    </div>
  )
}

export default App
