/**
 * AIME-admin Application Component
 * =================================
 *
 * Root component.
 */
import React, {Component} from 'react';
import PureComponent from '../lib/pure.js';
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Home from './home.jsx';

export default class Application extends PureComponent {
  render() {
    return (
      <Grid>
        <Row>
          <div>
            <Col md={4} />
            <Col md={4} id="middle">
              <h1>Aime Quinoa</h1>
              <Home />
            </Col>
            <Col md={4} />
          </div>
        </Row>
      </Grid>
    );
  }
}
