/**
 * AIME-admin Modal Components
 * ===========================
 *
 */
import React, {Component} from 'react';
import classes from 'classnames';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import {ActionButton} from './misc.jsx';
import PropTypes from 'baobab-react/prop-types';
import {branch} from 'baobab-react/decorators';
import PureComponent from '../lib/pure.js';
import autobind from 'autobind-decorator';


/**
 * Box generic component
 */

@branch({
  cursors:{data:['data', 'res']}
})

export default class ResourceSelector extends Component {

  render() {
    return (
      <Row className="full-height">
        <h1>{this.props.title}</h1>

        <div className="form-group">
          <input placeholder="what are you looking for?"  className="form-control" size="40"/>
        </div>

        <div className="overflowing">
          <SelectorListPanel items={this.props.data} model='res' />
        </div>

      </Row>
    );
  }
}

/**
 * List generic component
 */
@branch({
  cursors(props, context) {
    return {
      selection: ['states', props.model, 'selection']
    };
  }
})
class SelectorListPanel extends PureComponent {

  @autobind
  renderItem(item) {
    const selection = this.props.selection || [];

    return <SelectorItem key={item.id}
                 item={item}
                 selection={selection}
                 active={selection[0] === item.id} />;
  }

  render() {
    const items = this.props.items;

    if (!items)
      return <div className="centered">...</div>;
    else
      return <ul className="list">{items.map(this.renderItem)}</ul>;
  }
}


/**
 * A generic list item
 */
class SelectorItem extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  @autobind
  handleClick() {
    this.context.tree.emit('selection:change', {
      model: this.context.model,
      level: 0,
      target: this.props.item.id
    });
  }

  render() {
    const item = this.props.item;
    let text;

    if(item.reference !== null && this.context.model === 'res')
      text = item.reference.text;


    switch (item.kind) {
      case "link": var icon = 'glyphicon-new-window';break;
      case "image":var icon = 'glyphicon-picture';break;
      case "pdf":  var icon = 'glyphicon-book';break;
      case "quote":var icon = 'glyphicon-comment';break;
      case "rich":  var icon = 'glyphicon-cloud';break;
      case "video": var icon = 'glyphicon-film';break;
    }

    return (
      <li>
        <div className={classes('box', 'chapter', {selected: this.props.active})}
             onClick={this.handleClick}>
            <span className={classes('glyphicon',icon )} aria-hidden="true">
            </span> {item.title || text || item.url || item.original || item.text}
        </div>
      </li>
    );
  }
}
