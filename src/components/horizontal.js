import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

const colors = getTheme();

const Horizontal = ({ mode, highlight, group }) =>
{
  const s = {
    container: (mode === 'full') ? styles.container : styles.miniContainer,
    title: (mode === 'full') ? styles.title : styles.miniTitle
  };

  return <div className={ s.container } highlight={ highlight } group={ group.toString() }/>;
};

Horizontal.propTypes = {
  mode: PropTypes.string.isRequired,
  highlight: PropTypes.string,
  group: PropTypes.bool
};

const styles = createStyle({
  container: {
    display: 'flex',
    alignItems: 'flex-end',

    color: colors.accent,
    backgroundColor: colors.accent,

    width: '80px',
    height: '1px',

    padding: '0 30px',
    margin: 'auto',

    '[group="true"]': {
      width: '5px',
      padding: '0 5px'
    },

    '[highlight="remove"]': {
      color: colors.red,
      backgroundColor: colors.red
    },

    '[highlight="add"]': {
      color: colors.blue,
      backgroundColor: colors.blue
    }
  },

  miniContainer: {
    extend: 'container',

    width: 'calc(80px / 20)',
    height: '1px',

    padding: '0 calc(30px / 20)',

    '[group="true"]': {
      width: '1px',
      padding: '0'
    }
  }
});

export default Horizontal;
