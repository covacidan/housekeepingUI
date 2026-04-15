import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Container, Card, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap'
import api from '../services/api'

function DeltaCard({ label, rece, cald }) {
  return (
    <Col md={4} className="mb-3">
      <Card className="h-100 shadow-sm">
        <Card.Header className="fw-semibold">{label}</Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-between">
            <span className="text-primary">Cold</span>
            <Badge bg="primary">{rece} m³</Badge>
          </div>
          <div className="d-flex justify-content-between mt-2">
            <span className="text-danger">Hot</span>
            <Badge bg="danger">{cald} m³</Badge>
          </div>
        </Card.Body>
      </Card>
    </Col>
  )
}

DeltaCard.propTypes = {
  label: PropTypes.string.isRequired,
  rece: PropTypes.number.isRequired,
  cald: PropTypes.number.isRequired,
}

export default function LastMonthDelta() {
  const [delta, setDelta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/housekeeping/waterIndex/total')
      .then(({ data }) => setDelta(data))
      .catch(() => setError('Failed to load delta data.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center mt-5"><Spinner /></div>
  if (error) return <Container><Alert variant="danger">{error}</Alert></Container>

  return (
    <Container>
      <h4 className="mb-4">Last Month Delta</h4>
      <Row>
        <DeltaCard label="Kitchen"          rece={delta.bucatarieRece}    cald={delta.bucatarieCald} />
        <DeltaCard label="Bathroom"         rece={delta.baieRece}          cald={delta.baieCald} />
        <DeltaCard label="Service Bathroom" rece={delta.baieServiciuRece}  cald={delta.baieServiciuCald} />
      </Row>
      <Row className="mt-2">
        <Col md={6}>
          <Card className="border-primary shadow-sm">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-primary">Total Cold</h5>
              <h4 className="mb-0"><Badge bg="primary">{delta.totalRece} m³</Badge></h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-danger shadow-sm">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-danger">Total Hot</h5>
              <h4 className="mb-0"><Badge bg="danger">{delta.totalCald} m³</Badge></h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
