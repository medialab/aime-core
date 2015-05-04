/**
 * AIME-admin Home Component
 * ==========================
 *
 * Component displayed when opening the aplication and prompting to select a
 * language and a starting model.
 */
import React from 'react';
import PureComponent from '../lib/pure.js';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import {branch} from 'baobab-react/decorators';
import PropTypes from 'baobab-react/prop-types';
import {Box} from './misc.jsx';

const models = [
  {id: 'book', label: 'the book'},
  {id: 'voc', label: 'vocabulary'},
  {id: 'doc', label: 'documents'},
  {id: 'scenars', label: 'scenarii'},
  {id: 'res', label: 'resources'}
];

@branch({
  cursors: {
    lang: ['lang']
  }
})
export default class Home extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab
  };

  changeLang(lang) {
    this.context.tree.emit('lang:change', lang);
  }

  render() {
    return (
      <div>
        <h1>Aime Quinoa</h1>
        <Row>
          <Col md={6}>
            <Box selected={this.props.lang === 'en'}
                 onClick={this.changeLang.bind(this, 'en')}>
              en
            </Box>
          </Col>
          <Col md={6}>
            <Box selected={this.props.lang === 'fr'}
                 onClick={this.changeLang.bind(this, 'fr')}>
              fr
            </Box>
          </Col>
        </Row>
        {models.map(m => {
          return (
            <Row key={m.id}>
              <Col md={12} className="spaced">
                <Box>{m.label}</Box>
              </Col>
            </Row>
          );
        })}
      </div>
    );
  }
}
