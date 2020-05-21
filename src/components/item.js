import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

const colors = getTheme();

const Item = ({ mode, step }) =>
{
  const s = {
    wrapper: (mode === 'full') ? styles.wrapper : styles.miniWrapper,
    container: (mode === 'full') ? styles.container : styles.miniContainer,
    text: (mode === 'full') ? styles.text : styles.miniText
  };

  return <div className={ s.wrapper }>
    <div className={ s.container }>
      <div className={ s.text }>{ step }</div>
    </div>
  </div>;
};

Item.propTypes = {
  mode: PropTypes.string.isRequired,
  step: PropTypes.string
};

const styles = createStyle({
  wrapper: {
    display: 'flex',
    alignItems: 'center',

    minHeight: '26px',
    maxHeight: '50px',
    width: '110px',
    height: 'fit-content',

    userSelect: 'none',

    margin: 'auto',

    borderTop: `6px solid ${colors.whiteBackground}`,
    borderBottom: `6px solid ${colors.whiteBackground}`
  },

  miniWrapper: {
    extend: 'wrapper',

    backgroundColor: colors.accent,

    minHeight: 'calc(26px / 10)',
    maxHeight: 'calc(50px / 10)',
    width: 'calc(110px / 10)',

    borderTop: `calc(6px / 10) solid ${colors.whiteBackground}`,
    borderBottom: `calc(6px / 10) solid ${colors.whiteBackground}`
  },

  container: {
    width: '100%',
    height: '100%',

    overflow: 'hidden',

    borderRadius: '3px',
    border: `${colors.accent} 1px solid`
  },

  miniContainer: {
    extend: 'container',

    borderRadius: 0,
    border: 0
  },

  text: {
    maxHeight: '45px',
    
    overflow: 'hidden',
    textOverflow: 'ellipsis',

    fontSize: '10px',
    margin: '5px 10px'
  },

  miniText: {
    extend: 'text',

    color: colors.transparent,
    maxHeight: 'unset',
    
    fontSize: 'calc(10px / 10)',
    margin: '1px 2px'
  }
});

export default Item;
