import React from 'react';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

import Minimap from '../components/minimap.js';

const colors = getTheme();

const mindMapRef = React.createRef();

class Mindmap extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      items: []
    };
  }

  componentDidMount()
  {
    const maxWidth = 260;
    const maxHeight = 157;

    const minWidth = 180;
    const minHeight = 104;

    const miniMapWidth = Math.min(maxWidth, Math.max(window.innerWidth * 0.25, minWidth));
    const miniMapHeight = Math.min(maxHeight, Math.max(window.innerWidth * 0.15, minHeight));

    const mapWidth = miniMapWidth * 10 -  window.innerWidth;
    const mapHeight = miniMapHeight * 10 -  window.innerHeight;

    // scroll to center of the map on start
    mindMapRef.current.parentElement.scrollTo({
      left: mapWidth / 2,
      top: mapHeight / 2,
      behavior: 'auto'
    });
  }

  render()
  {
    return (
      <div ref={ mindMapRef } className={ styles.wrapper }>

        <Minimap mindMapRef={ mindMapRef }>
        </Minimap>

        <div className={ styles.container }>
          <div className={ styles.item }>
            <div className={ styles.text }>Wait 5s</div>
          </div>
        </div>

      </div>
    );
  }
}

const styles = createStyle({
  wrapper: {
    backgroundColor: colors.whiteBackground,

    maxWidth: 'calc(260px * 10)',
    maxHeight: 'calc(157px * 10)',

    minWidth: 'calc(180px * 10)',
    minHeight: 'calc(104px * 10)',

    width: 'calc(25vw * 10)',
    height: 'calc(15vw * 10)'
  },

  container: {
    display: 'flex',
    
    justifyContent: 'center',
    alignItems: 'center',

    fontFamily: 'Noto Sans',
    fontWeight: 700,

    width: '100%',
    height: '100%'
  },

  item: {
    display: 'flex',
    alignItems: 'center',

    width: '110px',
    minHeight: '26px',

    overflow: 'hidden',
    userSelect: 'none',

    borderRadius: '3px',
    border: `${colors.mindmapItemAccent} 1px solid`
  },

  text: {
    maxHeight: '45px',
    
    overflow: 'hidden',
    textOverflow: 'ellipsis',

    fontSize: '10px',
    margin: '5px 10px'
  }
});

export default Mindmap;
