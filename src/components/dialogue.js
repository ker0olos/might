import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme, { opacity } from '../colors.js';

const colors = getTheme();

// TODO create 2 different react classes
// - for a select element (following the UX wireframe)
// - for a input element (following the UX wireframe)

const Dialogue = () =>
{
  //

  return <div className={ styles.wrapper }>
    <div className={ styles.container }>
      <div className={ styles.title }>Action:</div>

      <div className={ styles.options }>

      </div>

      <div className={ styles.buttons }>
        <div className={ styles.button }>Apply</div>
        <div className={ styles.button }>Cancel</div>
      </div>
    </div>
  </div>;
};

Dialogue.propTypes = {
  //
};

const styles = createStyle({
  wrapper: {
    zIndex: 3,

    display: 'flex',
    position: 'absolute',

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: opacity(colors.blackBackground, 0.85),

    top: 0,
    left: 0,
    
    width: '100vw',
    height: '100vh'
  },

  container: {
    display: 'flex',
    flexDirection: 'column',

    fontSize: '14px',
    fontFamily: 'Noto Sans',
    fontWeight: 700,

    backgroundColor: colors.whiteBackground,

    width: '350px',
    height: '450px',
    
    overflow: 'hidden',
    borderRadius: '5px'
  },

  title: {
    userSelect: 'none',
    margin: '25px 15px'
  },

  options: {
    flexGrow: 1
  },

  buttons: {
    display: 'flex',
    userSelect: 'none'
  },

  button: {
    flexGrow: 1,
    cursor: 'pointer',
    
    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    textAlign: 'center',
    padding: '15px 0px',

    transition: 'transform 0.1s cubic-bezier(0.47, 0, 0.75, 0.72)',

    ':hover': {
      color: colors.whiteText,
      backgroundColor: colors.accent
    },

    ':active': {
      transform: 'scale(0.95)'
    }
  }
});

export default Dialogue;