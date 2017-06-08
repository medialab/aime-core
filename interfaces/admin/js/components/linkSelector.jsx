/**
 * AIME-admin Modal Components
 * ===========================
 *
 */
import React, {Component} from 'react';
import classes from 'classnames';
import tokenizer from '../lib/tokenizer';
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
        <h1>Link book</h1>
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
    selectedDoc: ['states', 'doc', 'selection', 0],
    voc: ['data', 'voc']
  },
  facets: {
    docIndex: 'docIndexById'
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
    const doc = this.props.docIndex[this.props.selectedDoc];
    const matcher = new RegExp(`doc_${doc.slug_id}`);

    return (
      <li className="box-no-hover" key={data.id}>
        {data.title}
        <ul className="list">
          {data.children.map(paragraph => {

            const sentences = tokenizer(paragraph.text),
                  markdownSentences = tokenizer(paragraph.markdown);
            return (
              <li key={paragraph.id} className="paragraph">
                <p>
                  {sentences.map((s, i) => {
                    const match = markdownSentences[i].match(matcher);

                    return <span key={i} className={classes('sentence', match && 'active')}>{s}</span>
                  })}
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
        <h1>Link voc</h1>
        <input
          value={this.state.search}
          onChange={e => (this.setState({search: e.target.value}), this.searchItems())}
          placeholder={lang === 'fr' ? 'quel vocabulaire recherchez-vous ?' : 'which vocabulary are you looking for?'}
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
