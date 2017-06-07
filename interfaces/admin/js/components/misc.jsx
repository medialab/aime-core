/**
 * AIME-admin Misc Components
 * ===========================
 *
 */
import React from 'react';
import classes from 'classnames';
import PureComponent from '../lib/pure.js';
import {Col} from 'react-flexbox-grid';
import PropTypes from 'baobab-react/prop-types';
import {branch} from 'baobab-react/decorators';
import config from '../../config.json';

import Tooltip from 'react-tooltip';

/**
 * Box generic component
 */
export class Box extends PureComponent {
  render() {
    return (
      <div className={classes({box: true, selected: this.props.selected})}
           onClick={this.props.onClick}>
        {this.props.children}
      </div>
    );
  };
};

/**
 * Button generic component
 */
export class ActionButton extends PureComponent {
  render() {
    let {
      size,
      action = () => console.log(this.props.label, "pressed"),
      state = 'normal',
      label,
      loadingLabel,
      disabledLabel
    } = this.props;

    // const sizeClass =  'col-md-' + size;
    const classString = classes(
      'button',
      // sizeClass,
      {disabled: state === 'disabled'}
    );

    if (state === 'saving' && loadingLabel)
      label = loadingLabel;
    else if (state === 'disabled' && disabledLabel)
      label = disabledLabel;

    return (
      <button className={classString}
              onClick={e => {e.preventDefault(); action(e);}}
              disabled={state === 'disabled'}>
        {label}
      </button>
    );
  };
};

/**
 * Toolbar
 */
@branch({
  cursors: {
    lang: ['lang']
  }
})
export class Toolbar extends PureComponent {
  static contextTypes = {
    tree: PropTypes.baobab
  };

  render() {

    const lang = this.props.lang;

    const changeView = () => {
      this.context.tree.emit('view:change', 'home');
    };

    const goToDocuments = () => {
      this.context.tree.emit('view:change', 'doc');
    };

    const goToResources = () => {
      this.context.tree.emit('view:change', 'res');
    };

    const changeLang = () => {
      this.context.tree.emit('lang:change', lang === 'en' ? 'fr' : 'en');
    };

    const toogleHelp = () => {
      this.context.tree.emit('help:toogle');
    };

    const logout = () => {
      this.context.tree.emit('logout');
    };

    const openBlf = () => {
      window.open(config.blfURL,'_blank');
    };

    return (
        <div className="col-md-1" id="toolbar">
            <Tooltip place="right" />
          <button  data-tip={lang === 'fr' ? 'accueil' : 'home'} type="button" className="btn btn-default" aria-label="Left Align" onClick={changeView}>
            <span className="glyphicon glyphicon-home" aria-hidden="true" />
          </button>
          <button data-tip={lang === 'fr' ? 'documents' : 'documents'} type="button" className="btn btn-default" aria-label="Left Align" onClick={goToDocuments}>
            <span className="glyphicon glyphicon-file" aria-hidden="true" />
          </button>
          <button data-tip={lang === 'fr' ? 'ressources' : 'resources'} type="button" className="btn btn-default" aria-label="Left Align" onClick={goToResources}>
            <span className="glyphicon glyphicon-inbox" aria-hidden="true" />
          </button>
          <button data-tip={lang === 'fr' ? 'basculer vers l\'anglais' : 'switch to french'} type="button" className="btn btn-default" aria-label="Left Align" onClick={changeLang}>
            {lang.toUpperCase()}
          </button>

          <button data-tip={lang === 'fr' ? 'références' : 'references'} type="button" className="btn btn-default" aria-label="Left Align" onClick={openBlf}>
            <span className="glyphicon glyphicon-education" aria-hidden="true" />
          </button>
          <button data-tip={lang === 'fr' ? 'aide' : 'help'} type="button" className="btn btn-default" aria-label="Left Align" onClick={toogleHelp}>
            <span className="glyphicon glyphicon-question-sign" aria-hidden="true" />
          </button>
          <hr/>
                    <button  data-tip={lang === 'fr' ? 'se déconnecter' : 'log out'} type="button" className="btn btn-default" aria-label="Left Align" onClick={logout}>
            <span className="glyphicon glyphicon-off" aria-hidden="true" />
          </button>
      </div>
    );
  };
};

/**
 * Resource icon component
 */
export class ResourceIcon extends PureComponent {
  render() {
    return <span className={classes('glyphicon', this.props.kind)}
                 aria-hidden="true" />;
  }
}
