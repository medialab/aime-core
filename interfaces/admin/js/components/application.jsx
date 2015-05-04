/**
 * AIME-admin Application Component
 * =================================
 *
 * Root component.
 */
import React from 'react';
import PureComponent from '../lib/pure.js';
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import {branch} from 'baobab-react/decorators';
import Home from './home.jsx';
import Login from './login.jsx';

const views = x => {

  return ({
    login: Login
  })[x] || Home
};

@branch({
  cursors: {
    view: ['view']
  }
})
export default class Application extends PureComponent {
  render() {
    const Component = views(this.props.view);

    return (
      <Grid>
        <Row>
          <div>
            <Col md={4} />
            <Col md={4} id="middle">
              <Component />
            </Col>
            <Col md={4} />
          </div>
        </Row>
      </Grid>
    );
  }
}
