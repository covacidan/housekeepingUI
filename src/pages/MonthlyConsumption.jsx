import React, { useEffect, useState } from 'react'
import { Container, Table, Spinner, Alert } from 'react-bootstrap'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import api from '../services/api'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function round3(v) {
  return Math.round(v * 1000) / 1000
}

function buildRows(records) {
  const sorted = [...records].sort((a, b) =>
    a.an !== b.an ? a.an - b.an : a.luna - b.luna
  )
  const rows = []
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]
    const bucRece  = round3(curr.bucatarieRece  - prev.bucatarieRece)
    const bucCald  = round3(curr.bucatarieCald  - prev.bucatarieCald)
    const baieRece = round3(curr.baieRece       - prev.baieRece)
    const baieCald = round3(curr.baieCald       - prev.baieCald)
    const srvRece  = round3(curr.baieServiciuRece  - prev.baieServiciuRece)
    const srvCald  = round3(curr.baieServiciuCald  - prev.baieServiciuCald)
    rows.push({
      label: `${MONTH_NAMES[curr.luna - 1]} ${curr.an}`,
      prev, curr,
      bucRece, bucCald, baieRece, baieCald, srvRece, srvCald,
      totalRece: round3(bucRece + baieRece + srvRece),
      totalCald: round3(bucCald + baieCald + srvCald),
    })
  }
  return rows
}

export default function MonthlyConsumption() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/housekeeping/waterIndex')
      .then(({ data }) => setRows(buildRows(data)))
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center mt-5"><Spinner /></div>
  if (error) return <Container><Alert variant="danger">{error}</Alert></Container>

  const chartData = rows.map(r => ({ name: r.label, 'Cold (m³)': r.totalRece, 'Hot (m³)': r.totalCald }))

  return (
    <Container fluid className="px-4">
      <h4 className="mb-4">Monthly Water Consumption</h4>

      <div className="mb-5" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={2} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Cold (m³)" stroke="#0d6efd" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="Hot (m³)"  stroke="#dc3545" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="table-responsive">
        <Table striped bordered hover size="sm" style={{ fontSize: 13 }}>
          <thead className="table-dark">
            <tr>
              <th rowSpan={2}>Month</th>
              <th colSpan={3} className="text-center">Kitchen Cold</th>
              <th colSpan={3} className="text-center">Kitchen Hot</th>
              <th colSpan={3} className="text-center">Bathroom Cold</th>
              <th colSpan={3} className="text-center">Bathroom Hot</th>
              <th colSpan={3} className="text-center">Service Cold</th>
              <th colSpan={3} className="text-center">Service Hot</th>
              <th colSpan={2} className="text-center">Totals</th>
            </tr>
            <tr>
              {['Kitchen Cold','Kitchen Hot','Bathroom Cold','Bathroom Hot','Service Cold','Service Hot'].map(h => (
                <React.Fragment key={h}>
                  <th>Old</th><th>New</th><th>Δ</th>
                </React.Fragment>
              ))}
              <th>Cold Δ</th><th>Hot Δ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="fw-semibold">{r.label}</td>
                <td>{r.prev.bucatarieRece}</td><td>{r.curr.bucatarieRece}</td><td className="table-info">{r.bucRece}</td>
                <td>{r.prev.bucatarieCald}</td><td>{r.curr.bucatarieCald}</td><td className="table-warning">{r.bucCald}</td>
                <td>{r.prev.baieRece}</td><td>{r.curr.baieRece}</td><td className="table-info">{r.baieRece}</td>
                <td>{r.prev.baieCald}</td><td>{r.curr.baieCald}</td><td className="table-warning">{r.baieCald}</td>
                <td>{r.prev.baieServiciuRece}</td><td>{r.curr.baieServiciuRece}</td><td className="table-info">{r.srvRece}</td>
                <td>{r.prev.baieServiciuCald}</td><td>{r.curr.baieServiciuCald}</td><td className="table-warning">{r.srvCald}</td>
                <td className="fw-semibold table-primary">{r.totalRece}</td>
                <td className="fw-semibold table-danger">{r.totalCald}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  )
}
