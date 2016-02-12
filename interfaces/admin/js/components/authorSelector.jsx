/**
 * AIME-admin Selector Components
 * ==============================
 */
import React from 'react';
import ReactDOM from 'react-dom';
import PureComponent from '../lib/pure.js';
import PropTypes from 'baobab-react/prop-types';
import Select from 'react-select';

export class AuthorSelector extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab
  };

  constructor(props, context) {
    super(props, context);

    this.getOptions = this.getOptions.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
    this.prepareOptions = this.prepareOptions.bind(this);
    this.fromIdToAuthor = this.fromIdToAuthor.bind(this);

  }

  fromIdToAuthor(id) {
    const usersIndex = this.context.tree.facets.usersIndex.get();
    return usersIndex[id];
  }

  prepareOption(user) {
    const fillLabel = (surname, name, username) => {
      const fullname = `${surname} ${name}`;
      return fullname.trim() === '' ? username : fullname;
    };

    if(user) return {
      value: user.id, label: fillLabel(user.surname, user.name, user.username)
    };
  }

  prepareOptions(users) {
    return _.map(users, u => this.prepareOption(u));
  }

  getOptions(input, callback) {
    input = input || '';
    const options = this.prepareOptions(this.props.users);

    if (!input || (input && input.length < 2)) {
      return callback(null, { options: [] });
    }

    const results = _.filter(options, option => {
      if (option.label.toLowerCase().includes(input)) {
        return option;
      }
    });

    return callback(null, {
      options: results
    });
  }

  changeHandler(newValue) {
    if (newValue) {
      const authorId = newValue.value;
      const author = this.fromIdToAuthor(authorId);

      if (this.props.onChange) this.props.onChange(author);
    }
  }

  render() {

    return (
      <div className="form-group author">
        <Select.Async
          isLoading={false}
          value={this.prepareOption(this.fromIdToAuthor(this.props.author))}
          ignoreAccents={false}
          clearable={false}
          name="select-author"
          placeholder="Author..."
          noResultsText="None found"
          loadOptions={this.getOptions}
          onChange={this.changeHandler}
        />
      </div>
    );
  }
}
