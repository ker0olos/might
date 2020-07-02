import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

const colors = getTheme();

const Vertical = ({ reverse, half, mode, highlight }) =>
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

  return <div className={ s.container } highlight={ highlight }/>;
};

Vertical.propTypes = {
  reverse: PropTypes.bool.isRequired,
  half: PropTypes.bool.isRequired,
  mode: PropTypes.string.isRequired,
  highlight: PropTypes.string
};

const styles = createStyle({
  container: {
    position: 'relative',
    backgroundColor: colors.accent,

    top: 0,
    width: '1px',
    height: '100%',

    '[highlight="remove"]': {
      backgroundColor: colors.red
    },

    '[highlight="add"]': {
      backgroundColor: colors.blue
    }
  },

  miniContainer: {
    extend: 'container',

    top: 0,
    height: '100%'
  },

  half: {
    extend: 'container',
    height: '50%'
  },

  miniHalf: {
    extend: 'container',

    height: '50%'
  },

  reverse: {
    extend: 'container',

    top: '50%',
    height: '50%'
  },

  miniReverse: {
    extend: 'container',

    top: '50%',
    height: '50%'
  }
});

export default Vertical;
