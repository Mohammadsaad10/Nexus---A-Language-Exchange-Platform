import React from 'react'
import { Navigate, Route, Routes } from 'react-router'

import SignUpPage from './pages/SignUpPage'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import OnboardingPage from './pages/OnboardingPage.jsx'
import NotificationsPage from './pages/NotificationPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import CallPage from './pages/CallPage.jsx'
import FriendsPage from './pages/FriendsPage.jsx'
import { Toaster } from 'react-hot-toast'

import PageLoader from './components/PageLoader.jsx'
import useAuthUser from './hooks/useAuthUser.js'
import Layout from './components/Layout.jsx'
import { useThemeStore } from './store/useThemeStore.js'


const App = () => {

  const { theme } = useThemeStore();
  const { isLoading, authUser } = useAuthUser();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;


  if (isLoading) return <PageLoader />
  return (
    <div className='min-h-screen' data-theme={theme}>
      
      <Routes>
        <Route path="/" element={isAuthenticated && isOnboarded ?
          (
            <Layout showSideBar={true}>
              <HomePage />
            </Layout>)
          :
          (<Navigate to={!isAuthenticated ? ('/login')
            :
            ('/onboarding')} />)}>

        </Route>

        <Route path="/signup" element={!isAuthenticated ? <SignUpPage /> : <Navigate to={isOnboarded ? '/' : '/onboarding'} />}></Route>

        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={isOnboarded ? '/' : '/onboarding'} />}></Route>

        <Route path="/onboarding" element={isAuthenticated ? (!isOnboarded ? (<OnboardingPage />) : (<Navigate to='/' />)) : (<Navigate to='/login' />)}></Route>

        <Route path="/notifications" element={isAuthenticated && isOnboarded ? (
          <Layout showSideBar={true}>
            <NotificationsPage />
          </Layout>
        ) : (
          !isAuthenticated ? (<LoginPage />) : (<Navigate to="/onboarding" />)
        )}></Route>


        <Route path="/friends" element={isAuthenticated && isOnboarded ? (
          <Layout showSideBar={true}>
            <FriendsPage />
          </Layout>
        ) : (
          !isAuthenticated ? (<LoginPage />) : (<Navigate to="/onboarding" />)
        )}></Route>

        <Route path="/chat/:id" element={isAuthenticated && isOnboarded ? (
          <Layout >
            <ChatPage />
          </Layout>
        ) : (
          !isAuthenticated ? (<LoginPage />) : (<Navigate to="/onboarding" />)
        )}></Route>

        <Route path="/call/:id" element={isAuthenticated && isOnboarded ?
          <Layout showSideBar={false}>
            <CallPage />
          </Layout>
          : (!isAuthenticated ? <LoginPage /> : <Navigate to="/onboarding" />)}>
        </Route>
      </Routes>

      <Toaster />
      {/* self closing toaster tag for notifications. */}
    </div>
  )
}

export default App