/**
 * AIME-admin Home Component
 * ==========================
 *
 * Component displayed when opening the aplication and prompting to select a
 * language and a starting model.
 */
import React from 'react';
import PureComponent, {BranchedComponent} from '../lib/pure.js';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import {branch} from 'baobab-react/decorators';
import PropTypes from 'baobab-react/prop-types';
import {Box} from './misc.jsx';

const models = [
  {id: 'book', label: 'the book'},
  {id: 'doc', label: 'documents'},
  {id: 'res', label: 'resources'}
];

@branch({
  cursors: {
    lang: ['lang']
  }
})
export default class Home extends BranchedComponent {
  changeLang(lang) {
    this.context.tree.emit('lang:change', lang);
  }

  changeView(view) {
    this.context.tree.emit('view:change', view);
  }

  render() {
    return (
      <Row className="centered">
        <Col md={4} />
        <Col md={4} >
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
            {models.map(m => (
                <Row key={m.id}>
                  <Col md={12}>
                    <Box onClick={this.changeView.bind(this, m.id)}>
                      {m.label}
                    </Box>
                  </Col>
                </Row>
              )
            )}
          </div>
        </Col>
        <Col md={4} />
      </Row>
    );
  }
}
