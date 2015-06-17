/**
 * AIME-admin Application Component
 * =================================
 *
 * Root component.
 */
import React from 'react';
import PureComponent from '../lib/pure.js';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import {branch} from 'baobab-react/decorators';
import Home from './home.jsx';
import Login from './login.jsx';
import Book from './book.jsx';
import Documents from './documents.jsx';
import Resources from './resources.jsx';

const views = x => ({
  login: Login,
  home: Home,
  book: Book,
  doc: Documents,
  res: Resources
})[x];

@branch({
  cursors: {
    view: ['view']
  }
})
export default class Application extends PureComponent {
  render() {
    const Component = views(this.props.view);

    return (
      <div className="container-fluid full-height">
        <Component />
      </div>
    );
  }
}
