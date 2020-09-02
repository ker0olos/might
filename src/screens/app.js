import React from 'react';

import { createStyle } from 'flcss';

import Mindmap from '../components/mindmap.js';

import getTheme from '../colors.js';

const colors = getTheme();

class App extends React.Component
{
  constructor()
  {
    super();
  }

  render()
  {
    return (
      <div id='main' className={ styles.container }>
        <Mindmap/>
      </div>
    );
  }
}

const styles = createStyle({
  container: {
    overflow: 'scroll',
    backgroundColor: colors.whiteBackground,
    
    width: '100vw',
    height: '100vh',

    '::-webkit-scrollbar': {
      display: 'none'
    }
  }
});

export default App;
