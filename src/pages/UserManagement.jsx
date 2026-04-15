import React, { useEffect, useState } from 'react'
import {
  Container, Table, Button, Modal, Form, Alert, Spinner, Badge
} from 'react-bootstrap'
import api from '../services/api'

export default function UserManagement() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]       = useState({ email: '', password: '', role: 'RECORDER' })
  const [saving, setSaving]   = useState(false)
  const [formError, setFormError] = useState('')

  const load = () => {
    setLoading(true)
    api.get('/auth/users')
      .then(({ data }) => setUsers(data))
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openModal = () => { setForm({ email: '', password: '', role: 'RECORDER' }); setFormError(''); setShowModal(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      await api.post('/auth/users', form)
      setShowModal(false)
      load()
    } catch (err) {
      setFormError(err.response?.status === 409 ? 'Email already in use.' : 'Failed to create user.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, email) => {
    if (!globalThis.confirm(`Delete user ${email}?`)) return
    try {
      await api.delete(`/auth/users/${id}`)
      setUsers(u => u.filter(x => x.id !== id))
    } catch {
      setError('Failed to delete user.')
    }
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">User Management</h4>
        <Button onClick={openModal}>+ Add User</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center mt-4"><Spinner /></div>
      ) : (
        <Table striped bordered hover>
          <thead className="table-dark">
            <tr><th>#</th><th>Email</th><th>Role</th><th style={{ width: 100 }}>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id}>
                <td>{i + 1}</td>
                <td>{u.email}</td>
                <td>
                  <Badge bg={u.role === 'ADMIN' ? 'danger' : 'secondary'}>{u.role}</Badge>
                </td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(u.id, u.email)}
                    disabled={u.email === localStorage.getItem('email')}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Role</Form.Label>
              <Form.Select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="ADMIN">Admin</option>
                <option value="RECORDER">Recorder</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Spinner size="sm" /> : 'Create User'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  )
}
