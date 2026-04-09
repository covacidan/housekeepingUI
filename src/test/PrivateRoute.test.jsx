import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute'

const Protected = () => <div>Protected Content</div>

const renderWithRoute = (token, role, requiredRole) => {
  if (token) {
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
  } else {
    localStorage.clear()
  }

  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Home Page</div>} />
        <Route
          path="/protected"
          element={
            <PrivateRoute requiredRole={requiredRole}>
              <Protected />
            </PrivateRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('PrivateRoute', () => {
  afterEach(() => localStorage.clear())

  it('renders children when authenticated and no role required', () => {
    renderWithRoute('valid-token', 'USER', null)
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /login when no token', () => {
    renderWithRoute(null, null, null)
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders children when role matches requiredRole', () => {
    renderWithRoute('valid-token', 'ADMIN', 'ADMIN')
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to / when role does not match requiredRole', () => {
    renderWithRoute('valid-token', 'USER', 'ADMIN')
    expect(screen.getByText('Home Page')).toBeInTheDocument()
  })
})
