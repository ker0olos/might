import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

const colors = getTheme();

const Vertical = ({ reverse, half, mode }) =>
{
  const normal = {
    container: (mode === 'full') ? styles.container : styles.miniContainer
  };

  const sHalf = {
    container: (mode === 'full') ? styles.half : styles.miniHalf
  };

  const sHalfReverse = {
    container: (mode === 'full') ? styles.reverse : styles.miniReverse
  };

  let s = normal;

  if (half && reverse)
    s = sHalfReverse;
  else if (half)
    s = sHalf;

  return <div className={ s.container }/>;
};

Vertical.propTypes = {
  reverse: PropTypes.bool.isRequired,
  half: PropTypes.bool.isRequired,
  mode: PropTypes.string.isRequired
};

const styles = createStyle({
  container: {
    position: 'relative',
    backgroundColor: colors.accent,

    top: 0,
    width: '2px',
    height: '100%'
  },

  miniContainer: {
    extend: 'container',

    top: 0,
    width: '1px',
    height: '100%'
  },

  half: {
    extend: 'container',
    height: 'calc(50% + 1px)'
  },

  miniHalf: {
    extend: 'container',

    width: '1px',
    height: 'calc(50% + 1px)'
  },

  reverse: {
    extend: 'container',

    top: 'calc(50% - 1px)',
    height: 'calc(50% + 1px)'
  },

  miniReverse: {
    extend: 'container',

    width: '1px',
    top: '50%',
    height: '50%'
  }
});

export default Vertical;
