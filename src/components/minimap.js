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

    this.down = false;
    this.timestamp = 0;

    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);

    this.onMouseMove = this.onMouseMove.bind(this);
  }

  /**
  * @param { React.MouseEvent } e
  * @param { boolean } smooth
  */
  handleMovement(e, smooth)
  {
    /**
    * @type { HTMLElement }
    */
    const mindMapRef = this.props?.mindMapRef?.current;

    if (!mindMapRef)
      return;

    const miniMapWidth = 260;
    const miniMapHeight = 157;

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
      behavior: (smooth) ? 'smooth' : 'auto'
    });
  }

  /**
  * @param { React.MouseEvent } e
  */
  onMouseUp(e)
  {
    this.down = false;
    
    this.handleMovement(e, true);
  }

  /**
  * @param { React.MouseEvent } e
  */
  onMouseLeave(e)
  {
    if (this.down)
      this.onMouseUp(e);
  }

  onMouseDown()
  {
    this.down = true;
  }

  /**
  * @param { React.MouseEvent } e
  */
  onMouseMove(e)
  {
    if (!this.down)
      return;

    const delta = Date.now() - this.timestamp;

    // small cooldown between each call
    if (delta > 25)
    {
      this.handleMovement(e, false);

      this.timestamp = Date.now();
    }
  }

  render()
  {
    return <div
      className={ styles.wrapper }
      
      onMouseUp={ this.onMouseUp }
      onMouseLeave={ this.onMouseLeave }
      onMouseDown={ this.onMouseDown }

      onMouseMove={ this.onMouseMove }
      onContextMenu={ this.props?.onContextMenu }
    >
      <div className={ styles.container }>
        <MinimapIndicator x={ this.state.x } y={ this.state.y }/>

        { this.props.children }
      </div>
    </div>;
  }
}

Minimap.propTypes = {
  mindMapRef: PropTypes.object.isRequired,
  onContextMenu: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node)
  ])
};

const styles = createStyle({
  wrapper: {
    zIndex: 1,
    position: 'absolute',

    bottom: 0,

    width: '260px',
    height: '157px',

    padding: '15px'
  },

  container: {
    display: 'flex',
    
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: colors.whiteBackground,

    fontFamily: 'Noto Sans',
    fontWeight: 700,

    width: '100%',
    height: '100%',

    boxShadow: `${colors.blackShadow} 0 0 15px 5px`
  }
});

export default Minimap;
