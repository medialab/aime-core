/**
 * AIME-admin application entry
 * =============================
 *
 * Main entry to the application.
 */
import tree from './state.js';
import React from 'react';
import {root} from 'baobab-react/higher-order';
import Application from './components/application.jsx';
import router from './router.js';

// Style
require('../css/app.css');

// Composing tree
const RootComponent = root(Application, tree);

// Rendering application
const mount = document.getElementById('mount');
React.render(<RootComponent />, mount);

// Exposing application
export default tree;
