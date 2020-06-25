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
* @param { {} } mindmap
* @param { 'mini' | 'full' } mode
* @param { [] } occurrences
*/
const rightClick = (e, mindmap, mode, occurrences) =>
{
  if (mode !== 'full')
    return;

  // prevent the native browser context menu and
  // and the normal mindmap menu from showing
  e.stopPropagation();
  e.preventDefault();

  // mount the context menu
  ReactDOM.render(<ContextMenu
    x={ e.nativeEvent.pageX }
    y={ e.nativeEvent.pageY }
    actions={ [
      { title: 'Edit', callback: () => mindmap.editStep(occurrences) },
      { title: 'Add', actions: [
        { title: 'New', callback: () => mindmap.addStepAfter(occurrences, 'new') },
        { title: 'Insert', callback: () => mindmap.addStepAfter(occurrences, 'insert') }
      ] },
      { title: 'Remove', actions: [
        { title: 'This Step', callback: () => mindmap.deleteStep(occurrences, 'this') },
        { title: 'Entire Branch', callback: () => mindmap.deleteStep(occurrences, 'branch') }
      ] }
    ] }
  />, document.querySelector('#contextMenu'));
};

/**
* @param { React.SyntheticEvent } e
* @param { {} } mindmap
* @param { 'mini' | 'full' } mode
* @param { [] } occurrences
*/
const leftClick = (e, mindmap, mode, occurrences) =>
{
  if (mode !== 'full')
    return;
  
  const now = Date.now();

  // this a global check
  // meaning it can be tricked if the user clicks 2 different items
  // in that small time window.
  // this can be fixed with some react hooks magic but it's not that big of an issue.

  // double click to open the edit dialogue (350ms window)
  if ((now - clickTimestamp) <= 350)
    mindmap.editStep(occurrences);

  // update timestamp
  clickTimestamp = now;
};

/**
* @param { {
*   mode: 'mini' | 'full',
*   title: string,
*   occurrences: [],
*   testIndex: number,
*   stepIndex: number
*  } } param0
*/
const Item = ({ mindmap, mode, title, occurrences }) =>
{
  const s = {
    wrapper: (mode === 'full') ? styles.wrapper : styles.miniWrapper,
    container: (mode === 'full') ? styles.container : styles.miniContainer,
    text: (mode === 'full') ? styles.text : styles.miniText
  };

  return <div
    className={ s.wrapper }
    onClick={ (e) => leftClick(e, mindmap, mode, occurrences) }
    onContextMenu={ (e) => rightClick(e, mindmap, mode, occurrences) }
  >
    <div className={ s.container }>
      <div title={ title } className={ s.text }>{ title }</div>
    </div>
  </div>;
};

Item.propTypes = {
  mindmap: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  occurrences: PropTypes.array.isRequired
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
    
    fontSize: '1px',
    margin: '1px'
  }
});

export default Item;
