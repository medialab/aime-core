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
import {branch} from 'baobab-react/decorators';
import autobind from 'autobind-decorator';
import _ from 'lodash';

@branch({
  cursors: {
    loading: ['states', 'login']
  }
})
export default class Login extends BranchedComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      email: null,
      password: null
    };
  }

  @autobind
  handleSubmit(e) {
    e.preventDefault();

    if (!this.state.email || !this.state.password)
      return;

    this.context.tree.emit('login:attempt', this.state);
  }

  render() {
    const loading = this.props.loading;

    return (
      <Row>
        <Col md={4} />
        <Col md={4}>
          <form onSubmit={this.handleSubmit}>
            <h1>Aime Quinoa - Login</h1>
            <Input type="text"
                   placeholder="Login"
                   ref="email"
                   value={this.state.email}
                   onChange={e => this.setState({email: e.target.value})} />
            <Input type="password"
                   placeholder="Password"
                   ref="password"
                   value={this.state.password}
                   onChange={e => this.setState({password: e.target.value})} />
            <ButtonInput type="submit"
                         value={!loading ? 'Log' : 'Verifying...'}
                         disabled={loading} />
          </form>
        </Col>
        <Col md={4} />
      </Row>
    );
  }
}
