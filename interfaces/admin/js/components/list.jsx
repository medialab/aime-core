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
import {ActionButton} from './misc.jsx';
import {Row} from 'react-flexbox-grid';

/**
 * List component
 */
export default class List extends PureComponent {

  static contextTypes = {
    tree: PropTypes.baobab
  };

  constructor (props,context) {
    super(props,context);

    this.state = {
      filteredItems: [],
      search: ''
    };
  }

  renderItem(item) {
    return <Item key={item.id}
                 item={item}
                 selection={this.props.selection || []} />;
  };

  search({target: {value=''}}) {

    const search = value,
          data = this.props.items;

    let filteredItems;

    if (search.length > 2) {
      filteredItems = _.filter(data, function(n) {
        return ~resourceName(n).toLowerCase().indexOf(search.toLowerCase());
      });
    }
    else {
      filteredItems = [];
    }
    this.setState({filteredItems: filteredItems, search: search});
  }

  render() {
    const model = this.props.model,
         isThereAnyData = true,
         items = this.state.filteredItems,
         lang = this.context.tree.get('lang');

    // Actions
    const modalOpen = () => {
      this.context.tree.emit('modal:open', {
        model: model,
        type: 'creation',
        title: 'create'
      });
    };

    let result;

    if (!this.state.search && !items.length)
      result = <ul className="list">{this.props.items.map(this.renderItem, this)}</ul>;
    else if (this.state.search.length < 3 && !items.length)
      result = <div className="centered">type more characters</div>;
    else if (this.state.search.length > 2 && !items.length)
      result = <div className="centered">no results</div>;
    else
      result = <ul className="list">{this.state.filteredItems.map(this.renderItem, this)}</ul>;

    return (
      <Row className="full-height searching stretched-column">
          <input placeholder={lang === 'fr' ? 'que recherchez-vous ?' : 'what are you looking for?'}
           onChange={(e) => this.search(e)}
                 className="form-control" size="40"/>

        <div className="scrollable" style={{flex: 1}}>
          <ul className="list">{result}</ul>
        </div>

        <div className="buttons-row">
          {((model === 'doc' || model === 'res') && isThereAnyData) &&
            <ActionButton
                          label={lang === 'fr' ? 'créer' : 'create'}
                          action={modalOpen} />}
        </div>
      </Row>
    );
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

    const {
      status,
      author
    } = item;

    return (
      <li>
        <div className={classes('box', 'chapter', status, {selected: this.props.selection[0] === item.id})}
             onClick={this.handleClick}
             title={text}
          >
          {model === 'res' && <ResourceIcon kind={item.kind} />}
          {text}
          {status === 'private' ? ' (unpublished)': null}

          {author &&
            <div className="item-author">
              <span className="glyphicon glyphicon-user" />
              {author.name} {author.surname}
            </div>
          }
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
