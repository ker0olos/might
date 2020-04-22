import React from 'react';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

const colors = getTheme();

class TopBar extends React.Component
{
  constructor()
  {
    super();
  }

  render()
  {
    return (
      <div className={ styles.container }>

      </div>
    );
  }
}

const styles = createStyle({
  container: {
    backgroundColor: colors.transparent,

    position: 'absolute',

    top: 0,

    width: '100vw',

    height: '35px',

    borderBottom: '2px solid',
    borderColor: colors.miniMapBorder
  }
});

export default TopBar;
