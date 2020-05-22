import React from 'react';
import ReactDOM from 'react-dom';

import App from './screens/app.js';
import Dialogue from './components/dialogue.js';

const app = document.querySelector('#app');

ReactDOM.render(<App/>, app);

// REMOVE
ReactDOM.render(<Dialogue/>, document.querySelector('#dialogue'));