import React from 'react';
import ReactDOM from 'react-dom';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

const colors = getTheme();

const click = (e) =>
{
  // by not preventing default, the user can reach
  // the native browser context menu by double clicking
  // the right mouse button
  e.preventDefault();

  // unmount the context menu
  ReactDOM.unmountComponentAtNode(document.querySelector('#contextMenu'));
};

/**
* @param { {
*    x: number,
*    y: number,
*    actions: { title: string, callback: () => void }[]
*  } } param0
*/
const ContextMenu = ({ x, y, actions }) =>
{
  // TODO before passing the x and y
  // they should be checked against
  // the width and height of context menu and
  // the width and height of the viewport

  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  const menu = {
    // margin so that the menu doesn't snap
    // flat to the viewport edges
    margin: 10,
    // a fixed size
    width: 185,
    // menu height is the sum of all actions height
    // added to the menu's padding
    height: 30 + (actions.length * (22 + 20))
  };

  // if the context menu is proven to overflow
  // then it should snap to the corners of the viewport

  if (x + menu.width + menu.margin >= viewport.width)
    x = viewport.width - (menu.width + menu.margin);
  else if (x - menu.margin <= 0)
    x = menu.margin;

  if (y + menu.height + menu.margin >= viewport.height)
    y = viewport.height - (menu.height + menu.margin);
  else if (y - menu.margin <= 0)
    y = menu.margin;

  return <div className={ styles.wrapper } onClick={ click } onContextMenu={ click }>
    <div style={ { left: x, top: y } } className={ styles.container }>
      {
        actions.map((action, i) =>
        {
          return <div key={ i } className={ styles.action } onClick={ action.callback }>
            { action.title }
          </div>;
        })
      }
    </div>
  </div>;
};

ContextMenu.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  actions: PropTypes.arrayOf(PropTypes.object).isRequired
};

const styles = createStyle({
  wrapper: {
    zIndex: 2,
    position: 'absolute',

    overflow: 'hidden',

    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh'
  },

  container: {
    position: 'relative',
    backgroundColor: colors.whiteBackground,

    fontFamily: 'Noto Sans',
    fontWeight: 700,

    width: '185px',
    
    boxShadow: `${colors.blackShadow} 0px 0px 9px 3px`,
    padding: '15px 0'
  },

  action: {
    display: 'flex',
    alignItems: 'center',

    cursor: 'pointer',

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    height: '22px',

    fontSize: '12px',
    padding: '10px',

    ':hover': {
      color: colors.whiteText,
      backgroundColor: colors.accent
    }
  }
});

export default ContextMenu;
