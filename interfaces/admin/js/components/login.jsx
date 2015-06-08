/**
 * AIME-admin Login Component
 * ===========================
 *
 * Login form.
 */
import React from 'react';
import Input from 'react-bootstrap/lib/Input';
import ButtonInput from 'react-bootstrap/lib/ButtonInput';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import PureComponent, {BranchedComponent} from '../lib/pure.js';
import PropTypes from 'baobab-react/prop-types';
import _ from 'lodash';

export default class Login extends BranchedComponent {
  handleSubmit(e) {
    const data = _.mapValues(this.refs, ref => ref.getValue());

    this.context.tree.emit('login:attempt', data);
    e.preventDefault();
  }

  render() {
    return (
      <Row>
        <Col md={4} />
        <Col md={4}>
          <form onSubmit={this.handleSubmit.bind(this)}>
            <h1>Aime Quinoa - Login</h1>
            <Input type="text"
                   placeholder="Login"
                   ref="email" />
            <Input type="password"
                   placeholder="Password"
                   ref="password" />
            <ButtonInput type="submit" value="Log" />
          </form>
        </Col>
        <Col md={4} />
      </Row>
    );
  }
}
