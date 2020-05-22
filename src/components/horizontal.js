import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

const colors = getTheme();

const Horizontal = ({ mode, title }) =>
{
  const s = {
    container: (mode === 'full') ? styles.container : styles.miniContainer,
    title: (mode === 'full') ? styles.title : styles.miniTitle
  };

  return <div className={ s.container }>
    {
      (title) ?
        <div title={ title } className={ s.title }>{ title }</div>
        : <div/>
    }
  </div>;
};

Horizontal.propTypes = {
  mode: PropTypes.string.isRequired,
  title: PropTypes.string
};

const styles = createStyle({
  container: {
    display: 'flex',
    alignItems: 'flex-end',

    backgroundColor: colors.accent,

    height: '1px',

    padding: '0 30px',
    margin: 'auto'
  },

  miniContainer: {
    extend: 'container',

    height: '1px',
    padding: '0 calc(30px / 10)'
  },

  title: {
    color: colors.accent,
    fontSize: '11px',

    userSelect: 'none',
    overflow: 'hidden',

    textAlign: 'center',
    textOverflow: 'ellipsis',

    minWidth: '60px',
    maxWidth: '160px',
    width: 'auto',

    whiteSpace: 'nowrap',
    margin: '0 0 5px 0'
  },

  miniTitle: {
    extend: 'title',

    color: colors.transparent,
    fontSize: 'calc(11px / 10)',

    minWidth: 'calc(60px / 10)',
    maxWidth: 'calc(160px / 10)',

    margin: 0
  }
});

export default Horizontal;
