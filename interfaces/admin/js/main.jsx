/**
 * AIME-admin application entry
 * =============================
 *
 * Main entry to the application.
 */
import tree from './tree.js';
import React from 'react';
import {render} from 'react-dom';
import {root} from 'baobab-react/higher-order';
import Application from './components/application.jsx';
import client from './client.js';
import router from './router.js';
import lodash from 'lodash';

// Style
require('!style!css!less!react-select/less/default.less');
require('!style!css!less!../style/app.less');

// Composing tree
const RootComponent = root(Application, tree);

// Rendering application
const mount = document.getElementById('mount');
render(<RootComponent />, mount);

// Checking session
tree.client.session();

// Exposing application
export default tree;

// Exposing lodash for debugging purposes
global._ = lodash;
