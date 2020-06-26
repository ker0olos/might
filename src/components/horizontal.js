import React from 'react';
import ReactDOM from 'react-dom';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

import ContextMenu from './contextMenu.js';

const colors = getTheme();

let clickTimestamp = 0;

/**
* @param { React.SyntheticEvent } e
* @param { () => void } callback
*/
const rightClick = (e, callback) =>
{
  // prevent the native browser context menu and
  // and the normal mindmap menu from showing
  e.stopPropagation();
  e.preventDefault();

  // mount the context menu
  ReactDOM.render(<ContextMenu
    x={ e.nativeEvent.pageX }
    y={ e.nativeEvent.pageY }
    actions={ [
      { title: 'Edit', callback }
    ] }
  />, document.querySelector('#contextMenu'));
};

/**
* @param { React.SyntheticEvent } e
* @param { () => void } callback
*/
const leftClick = (e, callback) =>
{
  const now = Date.now();

  // this a global check
  // meaning it can be tricked if the user clicks 2 different items
  // in that small time window.
  // this can be fixed with some react hooks magic but it's not that big of an issue.

  // double click to open the edit dialogue (350ms window)
  if ((now - clickTimestamp) <= 350)
    callback();

  // update timestamp
  clickTimestamp = now;
};

const Horizontal = ({ mode, title, onClick }) =>
{
  const s = {
    container: (mode === 'full') ? styles.container : styles.miniContainer,
    title: (mode === 'full') ? styles.title : styles.miniTitle
  };

  if (title)
  {
    return <div className={ s.container }>
      <div
        title={ title }
        className={ s.title }
        onClick={ (e) => leftClick(e, onClick) }
        onContextMenu={ (e) => rightClick(e, onClick) }
      >{ title }</div>
    </div>;
  }
  else
  {
    return <div className={ s.container }/>;
  }
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
