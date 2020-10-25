import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

const colors = getTheme();

const Vertical = ({ reverse, half, invisible, highlight }) =>
{
  let s = styles.container;

  if (half && reverse)
    s = styles.reverse;
  else if (half)
    s = styles.half;

  return <div className={ s } invisible={ invisible?.toString() ?? 'false' } highlight={ highlight }/>;
};

Vertical.propTypes = {
  reverse: PropTypes.bool.isRequired,
  half: PropTypes.bool.isRequired,
  invisible: PropTypes.bool,
  highlight: PropTypes.string
};

const styles = createStyle({
  container: {
    position: 'relative',
    backgroundColor: colors.accent,

    width: '1px',

    '[invisible="true"]': {
      opacity: 0.15
    },

    '[highlight="remove"]': {
      backgroundColor: colors.red
    },

    '[highlight="add"]': {
      backgroundColor: colors.blue
    }
  },

  half: {
    extend: 'container',
    height: '50%'
  },
  
  reverse: {
    extend: 'container',

    top: '50%',
    height: '50%'
  }
});

export default Vertical;
