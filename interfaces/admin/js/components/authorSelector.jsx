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

  constructor(props) {
    super(props);
    this.isLoading = false;

    this.getOptions = this.getOptions.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
    this.prepareOptions = this.prepareOptions.bind(this);

    this.state = {
      value: this.prepareOption(this.fromIdToAuthor(this.props.author))
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.author) {
      const authorId = nextProps.author.id ? nextProps.author.id : nextProps.author;
      this.setState({value: this.prepareOption(this.fromIdToAuthor(authorId))});
    }
  }

  fromIdToAuthor(id) {
    return _.filter(this.props.users, (a) => a.id === id)[0];
  }

  prepareOption(user) {
    const fillLabel = (surname, name, username) => {
      const fullname = `${surname} ${name}`;
      return fullname.trim() === '' ? username : fullname;
    };
    return {
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

    const results = _.filter(options, (option) => {
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
      this.setState({value: this.prepareOption(this.fromIdToAuthor(authorId))});
      this.context.tree.set(['states', 'doc', 'author'], authorId);
      if (this.props.onChange) {
        this.props.onChange(this.fromIdToAuthor(authorId));
      }
    }
  }

  render() {
    return (
      <div className="form-group author">
        <Select.Async
          isLoading={this.isLoading}
          value={this.state.value}
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
