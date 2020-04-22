import React from 'react';

import { createStyle } from 'flcss';

import MinimapIndicator from './minimapIndicator.js';

import getTheme from '../colors.js';

const colors = getTheme();

class Minimap extends React.Component
{
  constructor()
  {
    super();
  }

  render()
  {
    return (
      <div className={ styles.container }>
        <MinimapIndicator/>
      </div>
    );
  }
}

const styles = createStyle({
  container: {
    backgroundColor: colors.whiteBackground,

    position: 'absolute',

    bottom: 0,

    maxWidth: '260px',
    maxHeight: '157px',

    minWidth: '180px',
    minHeight: '104px',

    width: '25vw',
    height: '15vw',

    margin: '20px',

    // border: '2px solid',
    // borderColor: colors.miniMapBorder
  }
});

export default Minimap;
