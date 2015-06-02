/**
 * AIME-admin Book Component
 * ==========================
 *
 * Component dealing with the book model's view.
 */
import React from 'react';
import PureComponent from '../lib/pure.js';
import {ListLayout} from './list.jsx';

/**
 * Main component
 */
export default class Book extends PureComponent {
  render() {
    return <ListLayout title="The Book" model="book" />;
  }
}
