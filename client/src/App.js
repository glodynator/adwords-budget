import React from 'react';
import './app.scss';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import CostCheck from './components/costCheck/costCheck';

function App() {
  return (
    <Container className="app">
      <Row className="justify-content-center">
        <Col xs md={9} lg={10}>
          <CostCheck />
        </Col>
      </Row>
    </Container>
  );
}

export default App;
