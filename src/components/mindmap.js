import React from 'react';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

const colors = getTheme();

class Mindmap extends React.Component
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
    backgroundColor: 'green',

    maxWidth: 'calc(260px * 10)',
    maxHeight: 'calc(157px * 10)',

    minWidth: 'calc(180px * 10)',
    minHeight: 'calc(104px * 10)',

    width: 'calc(25vw * 10)',
    height: 'calc(15vw * 10)'
  }
});

export default Mindmap;
