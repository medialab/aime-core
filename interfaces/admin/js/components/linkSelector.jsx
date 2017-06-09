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
 * Book Link Paragraph
 */
class BookLinkSelectorParagraph extends Component {

  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      collapsed: true
    };
  }

  @autobind
  addLink(idVoc, idFrom, idTo, indexSentence) {
    return;
    this.context.tree.emit('link:add', {
      idVoc,
      idFrom,
      idTo,
      indexSentence,
      model: 'book'
    });
  }

  @autobind
  deleteLink(idVoc, idFrom, idTo, indexSentence) {
    return;
    this.context.tree.emit('link:delete', {
      idVoc,
      idFrom,
      idTo,
      indexSentence,
      model: 'book'
    });
  }

  render() {
    const {
      data,
      doc,
      matcher
    } = this.props;

    return (
      <li className="box-no-hover">
        <div>{data.chapter.title.toUpperCase()} / {data.subchapter.title.toUpperCase()}</div>
        <ul className="list">
          {[data.paragraph].map(paragraph => {
            const sentences = tokenizer(paragraph.text),
                  markdownSentences = tokenizer(paragraph.markdown);

            let paragraphHasMatch = false;

            return (
              <li key={paragraph.id} className="paragraph">
                {sentences.map((s, i) => {
                  const match = markdownSentences[i].match(matcher);

                  if (match)
                    paragraphHasMatch = true;

                  return (
                    <p
                      key={i}
                      className={classes('sentence', match && 'active')}
                      onClick={() => {
                        if (!match) {
                          if (!paragraphHasMatch)
                            this.addLink(data.id, paragraph.id, doc.id, i);
                        }
                        else {
                          this.deleteLink(data.id, paragraph.id, doc.id, i);
                        }
                      }}>
                      {s}
                    </p>
                  );
                })}
              </li>
            );
          })}
        </ul>
      </li>
    );
  }
}

/**
 * Book Link Selector
 */
@branch({
  facets: {
    docIndex: 'docIndexById',
    paragraphs: 'flatParagraphs'
  },
  cursors: {
    selectedDoc: ['states', 'doc', 'selection', 0]
  }
})
export class BookLinkSelector extends Component {

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
      <BookLinkSelectorParagraph
        key={data.paragraph.id}
        data={data}
        doc={doc}
        matcher={matcher} />
    );
  }

  searchItems() {
    const query = this.state.search;

    if (!query || query.length < 3)
      return this.setState({filteredItems: []});

    const regex = new RegExp(escapeRegexp(query).replace(/\s/g, '\\s'), 'i');

    const filteredItems = (this.props.paragraphs || [])
      .filter(data => {
        return regex.test(data.paragraph.text);
      });

    return this.setState({filteredItems: filteredItems});
  }

  componentWillReceiveProps(newProps) {
    if (newProps.paragraphs !== this.props.paragraphs)
      this.searchItems();
  }

  render() {
    const dismiss = () => {
      this.context.tree.emit('linkSelector:dismiss');
    };

    const lang = this.context.tree.get('lang');

    let result;

    const items = this.state.filteredItems;

    if (!this.state.search && !items.length)
      result = null;
    else if (this.state.search.length < 3 && !items.length)
      result = <div className="centered">type more characters</div>;
    else if (this.state.search.length > 2 && !items.length)
      result = <div className="centered">no results</div>;
    else
      result = <ul className="list">{items.map(this.renderItem)}</ul>;

    return (
      <Row className="full-height stretched-column">
        <h1>Link book</h1>
        <input
          value={this.state.search}
          onChange={e => (this.setState({search: e.target.value}), this.searchItems())}
          placeholder={lang === 'fr' ? 'quel paragraphe recherchez-vous ?' : 'which paragraph are you looking for?'}
          className="form-control" size="40" />
        <div style={{flex: 1}} className="scrollable">
          {result}
        </div>
        <div className="buttons-row">
          <ActionButton size={6} action={dismiss} label="close"/>
        </div>
      </Row>
    );
  }
}

/**
 * Voc Link Paragraph
 */
class VocLinkSelectorParagraph extends Component {

  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      collapsed: true
    };
  }

  @autobind
  addLink(idVoc, idFrom, idTo, indexSentence) {
    this.context.tree.emit('link:add', {
      idVoc,
      idFrom,
      idTo,
      indexSentence,
      model: 'voc'
    });
  }

  @autobind
  deleteLink(idVoc, idFrom, idTo, indexSentence) {
    this.context.tree.emit('link:delete', {
      idVoc,
      idFrom,
      idTo,
      indexSentence,
      model: 'voc'
    });
  }

  render() {
    const {
      data,
      doc,
      matcher
    } = this.props;

    return (
      <li className={this.state.collapsed ? 'box' : 'box-no-hover'}>
        <div onClick={() => this.setState({collapsed: !this.state.collapsed})}>{data.title}</div>
        <ul className={classes('list', this.state.collapsed && 'hidden')}>
          {data.children.map(paragraph => {

            const sentences = tokenizer(paragraph.text),
                  markdownSentences = tokenizer(paragraph.markdown);

            let paragraphHasMatch = false;

            return (
              <li key={paragraph.id} className="paragraph">
                {sentences.map((s, i) => {
                  const match = markdownSentences[i].match(matcher);

                  if (match)
                    paragraphHasMatch = true;

                  return (
                    <p
                      key={i}
                      className={classes('sentence', match && 'active')}
                      onClick={() => {
                        if (!match) {
                          if (!paragraphHasMatch)
                            this.addLink(data.id, paragraph.id, doc.id, i);
                        }
                        else {
                          this.deleteLink(data.id, paragraph.id, doc.id, i);
                        }
                      }}>
                      {s}
                    </p>
                  );
                })}
              </li>
            );
          })}
        </ul>
      </li>
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
      <VocLinkSelectorParagraph
        key={data.id}
        data={data}
        doc={doc}
        matcher={matcher} />
    );
  }

  searchItems() {
    const query = this.state.search;

    if (!query || query.length < 3)
      return this.setState({filteredItems: []});

    const regex = new RegExp(escapeRegexp(query).replace(/\s/g, '\\s'), 'i');

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

  componentWillReceiveProps(newProps) {
    if (newProps.voc !== this.props.voc)
      this.searchItems();
  }

  render() {
    const dismiss = () => {
      this.context.tree.emit('linkSelector:dismiss');
    };

    const lang = this.context.tree.get('lang');

    let result;

    const items = this.state.filteredItems;

    if (!this.state.search && !items.length)
      result = null;
    else if (this.state.search.length < 3 && !items.length)
      result = <div className="centered">type more characters</div>;
    else if (this.state.search.length > 2 && !items.length)
      result = <div className="centered">no results</div>;
    else
      result = <ul className="list">{items.map(this.renderItem)}</ul>;

    return (
      <Row className="full-height stretched-column">
        <h1>Link voc</h1>
        <input
          value={this.state.search}
          onChange={e => (this.setState({search: e.target.value}), this.searchItems())}
          placeholder={lang === 'fr' ? 'quel vocabulaire recherchez-vous ?' : 'which vocabulary are you looking for?'}
          className="form-control" size="40" />
        <div style={{flex: 1}} className="scrollable">
          {result}
        </div>
        <div className="buttons-row">
          <ActionButton size={6} action={dismiss} label="close"/>
        </div>
      </Row>
    );
  }
}
