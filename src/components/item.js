import React from 'react';
import ReactDOM from 'react-dom';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

import ContextMenu from './contextMenu.js';

import EditIcon from '../../icons/edit.svg';

import NewStepIcon from '../../icons/new-step.svg';
import InsertStepIcon from '../../icons/insert-step.svg';

import RemoveStepIcon from '../../icons/remove-step.svg';
import RemoveBranchIcon from '../../icons/remove-branch.svg';

const colors = getTheme();

let clickTimestamp = 0;

/**
* @param { React.SyntheticEvent } e
* @param { {} } mindmap
* @param { 'mini' | 'full' } mode
* @param { import('./mindmap.js').FamilizedItem } item
*/
const rightClick = (e, mindmap, item) =>
{
  // prevent the native browser context menu and
  // and the normal mindmap menu from showing
  e.stopPropagation();
  e.preventDefault();

  const { occurrences } = item;

  // mount the context menu
  ReactDOM.render(<ContextMenu
    x={ e.nativeEvent.pageX }
    y={ e.nativeEvent.pageY }
    actions={ [
      { title: 'Edit', icon: EditIcon, callback: () => mindmap.editStep(occurrences) },
      { title: 'Add', actions: [
        {
          title: 'New',
          icon: NewStepIcon,
          callback: () => mindmap.addStepAfter(occurrences, 'new')
        },
        {
          title: 'Insert',
          icon: InsertStepIcon,
          callback: () => mindmap.addStepAfter(occurrences, 'insert')
        }
      ] },
      { title: 'Remove', actions: [
        {
          title: 'Step',
          icon: RemoveStepIcon,
          // highlights the step that
          // will be deleted
          enter: () =>
          {
            item.hover = 'remove-step';
            mindmap.forceUpdate();
          },
          leave: () =>
          {
            item.hover = undefined;
            mindmap.forceUpdate();
          },
          callback: () => mindmap.deleteStep(occurrences, 'this')
        },
        {
          title: 'Branch',
          icon: RemoveBranchIcon,
          // highlights the entire branch
          // that will be deleted
          enter: () =>
          {
            item.hover = 'remove-branch';
            mindmap.forceUpdate();
          },
          leave: () =>
          {
            item.hover = undefined;
            mindmap.forceUpdate();
          },
          callback: () => mindmap.deleteStep(occurrences, 'branch')
        }
      ] }
    ] }
  />, document.querySelector('#contextMenu'));
};

/**
* @param { {} } mindmap
* @param { import('./mindmap.js').FamilizedItem } item
*/
const leftClick = (mindmap, item) =>
{
  const now = Date.now();

  // this a global check
  // meaning it can be tricked if the user clicks 2 different items
  // in that small time window.
  // this can be fixed with some react hooks magic but it's not that big of an issue.

  // double click to open the edit dialogue (350ms window)
  if ((now - clickTimestamp) <= 350)
    mindmap.editStep(item.occurrences);

  // update timestamp
  clickTimestamp = now;
};

/**
* @param { {
*   mindmap: {},
*   mode: 'mini' | 'full',
*   title: string,
*   highlight: string,
*   item: import('./mindmap.js').FamilizedItem
*  } } param0
*/
const Item = ({ mindmap, mode, title, highlight, item }) =>
{
  if (mode === 'mini')
  
    return <div className={ styles.miniWrapper } highlight={ highlight }>
      <div className={ styles.miniContainer }>
        <div className={ styles.miniText }>{ title }</div>
      </div>
    </div>;

  return <div
    className={ styles.wrapper }
    onClick={ () => leftClick(mindmap, item) }
    onContextMenu={ (e) => rightClick(e, mindmap, item) }
  >
    <div className={ styles.container } highlight={ highlight } >
      <div title={ title } className={ styles.text }>{ title }</div>
    </div>
  </div>;
};

Item.propTypes = {
  mindmap: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  highlight: PropTypes.string,
  item: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired
};

const styles = createStyle({
  wrapper: {
    display: 'flex',
    alignItems: 'center',

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    minHeight: '26px',
    maxHeight: '50px',
    width: '110px',
    height: 'fit-content',

    userSelect: 'none',

    margin: 'auto',

    // acts as margin between rows
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
    borderBottom: `calc(6px / 10) solid ${colors.whiteBackground}`,

    '[highlight="remove"]': {
      backgroundColor: colors.red
    }
  },

  container: {
    width: '100%',
    height: '100%',

    overflow: 'hidden',

    borderRadius: '3px',
    border: `${colors.accent} 1px solid`,

    '[highlight="remove"]': {
      color: colors.whiteText,
      backgroundColor: colors.red,
      border: `${colors.red} 1px solid`
    }
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
