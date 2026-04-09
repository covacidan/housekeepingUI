import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Login from '../pages/Login'
import api from '../services/api'

vi.mock('../services/api', () => ({
  default: { post: vi.fn() },
}))

const renderLogin = () => {
  const result = render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
  return {
    ...result,
    emailInput: result.container.querySelector('input[type="email"]'),
    passwordInput: result.container.querySelector('input[type="password"]'),
  }
}

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders email and password fields and submit button', () => {
    const { emailInput, passwordInput } = renderLogin()
    expect(emailInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('stores token and role in localStorage on successful login', async () => {
    api.post.mockResolvedValue({
      data: { token: 'jwt123', role: 'ADMIN', email: 'admin@test.com' },
    })

    const { emailInput, passwordInput } = renderLogin()
    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('jwt123')
      expect(localStorage.getItem('role')).toBe('ADMIN')
      expect(localStorage.getItem('email')).toBe('admin@test.com')
    })
  })

  it('shows error message on failed login', async () => {
    api.post.mockRejectedValue({ response: { status: 401 } })

    const { emailInput, passwordInput } = renderLogin()
    fireEvent.change(emailInput, { target: { value: 'bad@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })
  })

  it('disables submit button while loading', async () => {
    let resolve
    api.post.mockReturnValue(new Promise(r => { resolve = r }))

    const { emailInput, passwordInput } = renderLogin()
    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByRole('button')).toBeDisabled()
    resolve({ data: { token: 't', role: 'ADMIN', email: 'admin@test.com' } })
  })
})
