import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import MinimapIndicator from './minimapIndicator.js';

import getTheme from '../colors.js';

const colors = getTheme();

class Minimap extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      x: 0,
      y: 0
    };

    this.onClick = this.onClick.bind(this);
  }

  /**
  * @param { React.MouseEvent } e
  */
  onClick(e)
  {
    /**
    * @type { HTMLElement }
    */
    const mindMapRef = this.props?.mindMapRef?.current;

    if (!mindMapRef)
      return;

    const maxWidth = 260;
    const maxHeight = 157;

    const minWidth = 180;
    const minHeight = 104;

    const miniMapWidth = Math.min(maxWidth, Math.max(window.innerWidth * 0.25, minWidth));
    const miniMapHeight = Math.min(maxHeight, Math.max(window.innerWidth * 0.15, minHeight));

    const indicatorWidth = window.innerWidth / 10;
    const indicatorHeight = window.innerHeight / 10;

    // the '15' is the element's margin
    let x = e.clientX - 15;
    let y = miniMapHeight - (window.innerHeight - e.clientY - 15);

    // according to the indicator center
    x = x + (indicatorWidth / 2);
    y = y + (indicatorHeight / 2);
    
    // minimal coordinates is 0, 0
    // maximal coordinates is minimap width, height
    x = Math.min(Math.max(x, 0), miniMapWidth);
    y = Math.min(Math.max(y, 0), miniMapHeight);

    // transform minimap positions to mindmap positions
    x = x * 10;
    y = y * 10;

    // transform mindmap positions to scroll positions
    x = x - window.innerWidth;
    y = y - window.innerHeight;

    mindMapRef.parentElement.scrollTo({
      left: x,
      top: y,
      behavior: 'smooth'
    });
  }

  render()
  {
    return <div className={ styles.wrapper } onClick={ this.onClick }>
      <div className={ styles.container }>
        <MinimapIndicator x={ this.state.x } y={ this.state.y }/>

        { this.props.children }
      </div>
    </div>;
  }
}

Minimap.propTypes = {
  mindMapRef: PropTypes.object,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node)
  ])
};

const styles = createStyle({
  wrapper: {
    position: 'absolute',

    bottom: 0,

    maxWidth: '260px',
    maxHeight: '157px',

    minWidth: '180px',
    minHeight: '104px',

    width: '25vw',
    height: '15vw',

    padding: '15px'
  },

  container: {
    backgroundColor: colors.whiteBackground,

    width: '100%',
    height: '100%',

    boxShadow: `${colors.blackShadow} 0 0 15px 5px`
  }
});

export default Minimap;
