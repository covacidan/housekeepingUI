import React from 'react'
import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import keycloak from '../keycloak'

export default function NavBar() {
  const location = useLocation()
  const role  = localStorage.getItem('role')
  const email = localStorage.getItem('email')

  const logout = () => {
    localStorage.clear()
    keycloak.logout({ redirectUri: globalThis.location.origin })
  }

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">Housekeeping</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            {role === 'ADMIN' && (
              <Nav.Link as={Link} to="/monthly" active={location.pathname === '/monthly'}>
                Monthly Consumption
              </Nav.Link>
            )}
            {role === 'RECORDER' && (
              <Nav.Link as={Link} to="/delta" active={location.pathname === '/delta'}>
                Last Month Delta
              </Nav.Link>
            )}
            <Nav.Link as={Link} to="/add" active={location.pathname === '/add'}>
              Add Record
            </Nav.Link>
            {role === 'ADMIN' && (
              <Nav.Link as={Link} to="/users" active={location.pathname === '/users'}>
                User Management
              </Nav.Link>
            )}
          </Nav>
          <Nav className="align-items-center">
            <Navbar.Text className="me-3 text-light">{email}</Navbar.Text>
            <Button variant="outline-light" size="sm" onClick={logout}>Logout</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
