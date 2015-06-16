/**
 * AIME-admin Book Component
 * ==========================
 *
 * Component dealing with the book model's view.
 */
import React from 'react';
import PureComponent from '../lib/pure.js';
import {Layout} from './list.jsx';

/**
 * Main component
 */
export default class Documents extends PureComponent {
  render() {
    return <Layout title="Documents" model="doc" />;
  }
}
