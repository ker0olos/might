import React from 'react';
import ReactDOM from 'react-dom';

const app = document.querySelector('#app');

// show a loading screen until the promises resolve
ReactDOM.render(<p started="true"/>, app);