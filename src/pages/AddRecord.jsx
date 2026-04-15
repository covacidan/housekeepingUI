import React, { useState } from 'react'
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap'
import api from '../services/api'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const now = new Date()

const FIELDS = [
  { key: 'bucatarieRece', label: 'Kitchen Cold' },
  { key: 'bucatarieCald', label: 'Kitchen Hot' },
  { key: 'baieRece',      label: 'Bathroom Cold' },
  { key: 'baieCald',      label: 'Bathroom Hot' },
  { key: 'baieServiciuRece', label: 'Service Bathroom Cold' },
  { key: 'baieServiciuCald', label: 'Service Bathroom Hot' },
]

export default function AddRecord() {
  const [form, setForm] = useState({
    an: now.getFullYear(),
    luna: now.getMonth() + 1,
    addedDate: now.toISOString().split('T')[0],
    bucatarieRece: '', bucatarieCald: '',
    baieRece: '', baieCald: '',
    baieServiciuRece: '', baieServiciuCald: '',
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await api.post('/housekeeping/waterIndex', {
        ...form,
        an: Number.parseInt(form.an),
        luna: Number.parseInt(form.luna),
        bucatarieRece: Number.parseFloat(form.bucatarieRece),
        bucatarieCald: Number.parseFloat(form.bucatarieCald),
        baieRece: Number.parseFloat(form.baieRece),
        baieCald: Number.parseFloat(form.baieCald),
        baieServiciuRece: Number.parseFloat(form.baieServiciuRece),
        baieServiciuCald: Number.parseFloat(form.baieServiciuCald),
      })
      setSuccess(`Record for ${MONTHS[form.luna - 1]} ${form.an} saved successfully.`)
    } catch (err) {
      setError(err.response?.status === 409
        ? 'A record for this month already exists.'
        : 'Failed to save record.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <h4 className="mb-4">Add Water Index Record</h4>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
          {error   && <Alert variant="danger"  dismissible onClose={() => setError('')}>{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Year</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.an}
                    onChange={e => set('an', e.target.value)}
                    min={2000} max={2100}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Month</Form.Label>
                  <Form.Select value={form.luna} onChange={e => set('luna', e.target.value)}>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label>Date Added</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.addedDate}
                    onChange={e => set('addedDate', e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr />
            <h6 className="mb-3 text-muted">Meter Readings</h6>
            <Row>
              {FIELDS.map(({ key, label }) => (
                <Col md={6} key={key} className="mb-3">
                  <Form.Group>
                    <Form.Label>{label}</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.001"
                      value={form[key]}
                      onChange={e => set(key, e.target.value)}
                      placeholder="e.g. 123.456"
                      required
                    />
                  </Form.Group>
                </Col>
              ))}
            </Row>

            <Button type="submit" className="mt-2" disabled={loading}>
              {loading ? <Spinner size="sm" className="me-2" /> : null}
              Save Record
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}
