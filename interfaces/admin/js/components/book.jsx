/**
 * AIME-admin Book Component
 * ==========================
 *
 * Component dealing with the book model's view.
 */
import React from 'react';
import PureComponent from '../lib/pure.js';
import {ListLayout} from './list.jsx';


import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import {Editor, Preview} from './editor.jsx';
import {branch} from 'baobab-react/decorators';
import PropTypes from 'baobab-react/prop-types';
import classes from 'classnames';

/**
 * Main component
 */
export default class Book extends PureComponent {
  render() {
    return <ListLayout title="The Book" model="book" />;
  }
}
