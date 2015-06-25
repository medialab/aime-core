/**
 * AIME-admin List Components
 * ===========================
 *
 * Miscellaneous list and list items components designed to display the
 * different models of the inquiry.
 */
import React from 'react';
import PureComponent from '../lib/pure.js';
import PropTypes from 'baobab-react/prop-types';
import classes from 'classnames';
import autobind from 'autobind-decorator';
import {ResourceIcon} from './misc.jsx';
import {resourceName} from '../lib/helpers.js';

/**
 * List component
 */
export default class List extends PureComponent {
  render() {
    const renderItem = (item) => {
      return <Item key={item.id}
                   item={item}
                   selection={this.props.selection || []} />;
    };

    return <ul className="list">{this.props.items.map(renderItem)}</ul>;
  }
}

/**
 * A generic list item
 */
class Item extends PureComponent {
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
    const item = this.props.item,
          model = this.context.model;

    let text = item.title;

    if (model === 'res')
      text = ' ' + resourceName(item);

    return (
      <li>
        <div className={classes('box', 'chapter', {selected: this.props.selection[0] === item.id})}
             onClick={this.handleClick}>
          {model === 'res' && <ResourceIcon kind={item.kind} />}
          {text}
        </div>
        {model === 'book' &&
          <SubList items={item.children}
                   selection={this.props.selection.slice(1)}
                   visible={this.props.active} />}
      </li>
    );
  }
}

/**
 * Sublist generic component
 */
class SubList extends PureComponent {

  @autobind
  renderItem(item) {
    return <SubItem key={item.id}
                    item={item}
                    selection={this.props.selection.slice(1)}
                    active={this.props.selection[0] === item.id} />;
  }

  render() {
    const {items, visible} = this.props;

    return (
      <ul className={classes({hidden: !visible, 'sub-list': true})}>
        {items.map(this.renderItem)}
      </ul>
    );
  }
}

/**
 * A generic sublist item
 */
class SubItem extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  @autobind
  handleClick() {
    this.context.tree.emit('selection:change', {
      model: this.context.model,
      level: 1,
      target: this.props.item.id
    });
  }

  render() {
    const item = this.props.item,
          title = this.context.model === 'doc' ?
            'slide' :
            item.title;

    return (
      <li>
        <div className={classes('box', 'subheading', {selected: this.props.active})}
             onClick={this.handleClick}>
          {title}
        </div>
        {this.props.active ?
          <ThumbnailList items={item.children}
                         selection={this.props.selection} /> :
          null}
      </li>
    );
  }
}

/**
 * Thumbnail list component
 */
class ThumbnailList extends PureComponent {

  @autobind
  renderThumbnail(item, index) {
    return <Thumbnail key={index}
                      index={index}
                      item={item}
                      active={this.props.selection[0] === index} />;
  }

  render() {
    return (
      <ul className="sub-list">
        {this.props.items.map(this.renderThumbnail)}
      </ul>
    );
  }
}

/**
 * Thumbnail generic component
 */
class Thumbnail extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab,
    model: React.PropTypes.string
  };

  @autobind
  handleClick() {
    this.context.tree.emit('selection:change', {
      model: this.context.model,
      level: 2,
      target: this.props.index
    });
  }

  render() {
    const {active, index, item: {text}} = this.props;

    return (
      <li>
        <div className="thumbnail-box">
          <table>
            <tr>
              <td className="thumbnail-index">{index}</td>
              <td className={classes('thumbnail-text box', {selected: active})}
                  onClick={this.handleClick}>
                {text}
              </td>
            </tr>
          </table>
        </div>
      </li>
    );
  }
}
