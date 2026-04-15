import React from 'react'
import PropTypes from 'prop-types'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import PrivateRoute from './components/PrivateRoute'
import MonthlyConsumption from './pages/MonthlyConsumption'
import LastMonthDelta from './pages/LastMonthDelta'
import AddRecord from './pages/AddRecord'
import UserManagement from './pages/UserManagement'

function Layout({ children }) {
  return (
    <>
      <NavBar />
      {children}
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

function Home() {
  const role = localStorage.getItem('role')
  return <Navigate to={role === 'ADMIN' ? '/monthly' : '/delta'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/monthly" element={
          <PrivateRoute requiredRole="ADMIN">
            <Layout><MonthlyConsumption /></Layout>
          </PrivateRoute>
        } />
        <Route path="/delta" element={
          <PrivateRoute>
            <Layout><LastMonthDelta /></Layout>
          </PrivateRoute>
        } />
        <Route path="/add" element={
          <PrivateRoute>
            <Layout><AddRecord /></Layout>
          </PrivateRoute>
        } />
        <Route path="/users" element={
          <PrivateRoute requiredRole="ADMIN">
            <Layout><UserManagement /></Layout>
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
