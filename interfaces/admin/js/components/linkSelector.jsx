/**
 * AIME-admin Modal Components
 * ===========================
 *
 */
import React, {Component} from 'react';
import classes from 'classnames';
import tokenizer from 'talisman/tokenizers/sentences';
import {escapeRegexp} from 'talisman/regexp';
import {
  Row,
  Col
} from 'react-flexbox-grid';

import {ActionButton} from './misc.jsx';
import PropTypes from 'baobab-react/prop-types';
import {branch} from 'baobab-react/decorators';
import PureComponent from '../lib/pure.js';
import autobind from 'autobind-decorator';
import {ResourceIcon} from './misc.jsx';
import {resourceName} from '../lib/helpers.js';
import _ from 'lodash';

/**
 * Book Link Selector
 */
@branch({
  facets: {
    paragraphs: 'flatParagraphs'
  }
})
export class BookLinkSelector extends Component {

  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  constructor(props, context) {
    super(props, context);

    this.state = {};
  }

  render() {
    const dismiss = () => {
      this.context.tree.emit('linkSelector:dismiss');
    };

    const lang = this.context.tree.get('lang');

    return (
      <Row className="full-height stretched-column">
        <h1>Link the book</h1>
        <div style={{flex: 1}} className="scrollable">
          List
        </div>
        <div className="buttons-row">
          <ActionButton size={6} action={dismiss} label="close"/>
        </div>
      </Row>
    );
  }
}

/**
 * Voc Link Selector
 */
@branch({
  cursors: {
    voc: ['data', 'voc']
  }
})
export class VocLinkSelector extends Component {

  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      filteredItems: [],
      search: ''
    };

    this.searchItems = _.debounce(this.searchItems.bind(this), 300);
  }

  @autobind
  renderItem(data) {
    return (
      <li className="box-no-hover" key={data.id}>
        {data.title}
        <ul className="list">
          {data.children.map(paragraph => {

            const sentences = tokenizer(paragraph.text);

            return (
              <li key={paragraph.id} className="paragraph">
                <p>
                  {sentences.map((s, i) => <span key={i} className="sentence">{s}</span>)}
                </p>
              </li>
            );
          })}
        </ul>
      </li>
    );
  }

  searchItems() {
    const query = this.state.search;

    if (!query || query.length < 3)
      return this.setState({filteredItems: []});

    const regex = new RegExp(escapeRegexp(query), 'i');

    const filteredItems = (this.props.voc || [])
      .filter(voc => {
        if (regex.test(voc.title))
          return true;

        return voc.children.some(paragraph => {
          return regex.test(paragraph.text);
        });
      });

    return this.setState({filteredItems: filteredItems});
  }

  render() {
    const dismiss = () => {
      this.context.tree.emit('linkSelector:dismiss');
    };

    const lang = this.context.tree.get('lang');

    return (
      <Row className="full-height stretched-column">
        <h1>Link the voc</h1>
        <input
          value={this.state.search}
          onChange={e => (this.setState({search: e.target.value}), this.searchItems())}
          placeholder={lang === 'fr' ? 'que recherchez-vous ?' : 'what are you looking for?'}
          className="form-control" size="40" />
        <div style={{flex: 1}} className="scrollable">
          <ul className="list">
            {this.state.filteredItems.map(this.renderItem)}
          </ul>
        </div>
        <div className="buttons-row">
          <ActionButton size={6} action={dismiss} label="close"/>
        </div>
      </Row>
    );
  }
}
