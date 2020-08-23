import React from 'react';
import ReactDOM from 'react-dom';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

import ContextMenu from './contextMenu.js';

import EditIcon from '../../icons/edit.svg';

import TestIcon from '../../icons/test.svg';
import RemoveTestIcon from '../../icons/remove-test.svg';

import NewStepIcon from '../../icons/new-step.svg';
import InsertStepIcon from '../../icons/insert-step.svg';

import RemoveStepIcon from '../../icons/remove-step.svg';
import RemoveBranchIcon from '../../icons/remove-branch.svg';

const colors = getTheme();

let clickTimestamp = 0;

/**
* @param { React.SyntheticEvent } e
* @param { {} } mindmap
* @param { import('./mindmap.js').FamilizedItem | number } item
* @param { 'test' | 'item' } mode
*/
const leftClick = (e, mindmap, item, mode) =>
{
  if (mode === 'test' && typeof item !== 'number')
    return;

  // stops a click going though test title to the item itself
  e.stopPropagation();

  const now = Date.now();

  // this a global check
  // meaning it can be tricked if the user clicks 2 different items
  // in that small time window.
  // this can be fixed with some react hooks magic but it's not that big of an issue.
  
  // double click to open the edit dialogue (350ms window)
  if ((now - clickTimestamp) <= 250)
  {
    if (mode === 'test')
      mindmap.editTest(item);
    else
      mindmap.editStep(item.occurrences);
  }

  // update timestamp
  clickTimestamp = now;
};

/**
* @param { React.SyntheticEvent } e
* @param { {} } mindmap
* @param { import('./mindmap.js').FamilizedItem } item
*/
const itemRightClick = (e, mindmap, item) =>
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
      {
        title: 'Step',
        actions: [
          {
            title: 'Edit',
            icon: EditIcon,
            callback: () => mindmap.editStep(occurrences)
          }
        ]
      },
      {
        title: 'Mark As Test',
        icon: TestIcon,
        // if it has children but not a test title
        hidden: (Object.keys(item.children ?? {}).length && item.title === undefined) ? false : true,
        enter: () =>
        {
          item.hover = 'new-test';
          mindmap.forceUpdate();
        },
        leave: () =>
        {
          item.hover = undefined;
          mindmap.forceUpdate();
        },
        callback: () => mindmap.markTest(occurrences)
      },
      { title: 'Add', actions: [
        {
          title: 'New',
          icon: NewStepIcon,
          // highlights where the step will be added
          enter: () =>
          {
            // create a fake item and add it
            // where the acutal new item would go

            const newItem = {
              hover: 'new-step'
            };

            item.hover = 'parent-new-step';

            item.children = {
              ...item.children,
              '!': newItem
            };

            mindmap.forceUpdate();
          },
          leave: () =>
          {
            delete item.children['!'];
            
            mindmap.forceUpdate();
          },
          callback: () => mindmap.addStepAfter(occurrences, Object.keys(item.children).length, 'new')
        },
        {
          title: 'Insert',
          icon: InsertStepIcon,
          hidden: (Object.keys(item.children ?? {}).length) ? false : true,
          // highlights where the step will be added
          enter: () =>
          {
            // create a fake item and insert it
            // where the acutal new item would go

            const insertedItem = {
              hover: 'insert-step',
              children: item.children
            };

            item.children = {
              '!': insertedItem
            };
            
            mindmap.forceUpdate();
          },
          leave: () =>
          {
            item.children = item.children['!'].children;
            
            mindmap.forceUpdate();
          },
          callback: () => mindmap.addStepAfter(occurrences, undefined, 'insert')
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
          hidden: (Object.keys(item.children ?? {}).length) ? false : true,
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
* @param { React.SyntheticEvent } e
* @param { {} } mindmap
* @param { import('./mindmap.js').FamilizedItem } item
* @param { number } testIndex
*/
const testRightClick = (e, mindmap, item, testIndex) =>
{
  if (item.title === undefined)
    return;

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
      {
        title: 'Test',
        actions: [
          {
            title: 'Edit',
            icon: EditIcon,
            callback: () => mindmap.editTest(testIndex)
          },
          {
            title: 'Remove',
            icon: RemoveTestIcon,
            // if it has children and has a test title
            hidden: (Object.keys(item.children ?? {}).length && item.title !== undefined) ? false : true,
            enter: () =>
            {
              item.hover = 'remove-test';
              mindmap.forceUpdate();
            },
            leave: () =>
            {
              item.hover = undefined;
              mindmap.forceUpdate();
            },
            callback: () => mindmap.unmarkTest(occurrences)
          }
        ]
      }
    ] }
  />, document.querySelector('#contextMenu'));
};

/**
* @param { {
*   mindmap: {},
*   mode: 'mini' | 'full',
*   content: string,
*   highlight: string,
*   item: import('./mindmap.js').FamilizedItem
*  } } param0
*/
const Item = ({ mindmap, mode, content, highlight, item }) =>
{
  if (mode === 'mini')
  
    return <div className={ styles.miniItemWrapper } highlight={ highlight }>
      <div className={ styles.miniContainer }>
        <div className={ styles.miniContent }>{ content }</div>
      </div>
    </div>;


  let untitled;

  const { titleTestIndex } = item;

  let { title } = item;

  if (
    item.title === '' ||
    (!item.title && typeof item.titleTestIndex === 'number')
  )
  {
    untitled = 'true';
    title = 'Untitled Test';
  }
 
  return <div className={ styles.itemWrapper }>
    <div
      title={ title }
      untitled={ untitled }
      highlight={ highlight }
      className={ styles.title }
      onClick={ (e) => leftClick(e, mindmap, titleTestIndex, 'test') }
      onContextMenu={ (e) => testRightClick(e, mindmap, item, titleTestIndex) }
    >
      { title }
    </div>

    <div
      title={ content }
      highlight={ highlight }
      className={ styles.container }
      onClick={ (e) => leftClick(e, mindmap, item, 'item') }
      onContextMenu={ (e) => itemRightClick(e, mindmap, item) }
    >
      <div className={ styles.content }>{ content }</div>
    </div>
  </div>;
};

Item.propTypes = {
  mindmap: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  highlight: PropTypes.string,
  item: PropTypes.object.isRequired,
  content: PropTypes.string.isRequired
};

const styles = createStyle({
  itemWrapper: {
    display: 'flex',
    position: 'relative',

    alignItems: 'center',

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    minHeight: '26px',
    maxHeight: '50px',
    width: '110px',
    height: 'fit-content',

    margin: 'auto',

    // acts as margin between rows
    borderTop: `10px solid ${colors.whiteBackground}`,
    borderBottom: `10px solid ${colors.whiteBackground}`
  },

  miniItemWrapper: {
    extend: 'itemWrapper',

    backgroundColor: colors.accent,

    minHeight: 'calc(26px / 20)',
    maxHeight: 'calc(50px / 20)',
    width: 'calc(110px / 20)',

    borderTop: `calc(10px / 20) solid ${colors.whiteBackground}`,
    borderBottom: `calc(10px / 20) solid ${colors.whiteBackground}`,

    '[highlight="remove"]': {
      backgroundColor: colors.red
    },

    '[highlight="add"]': {
      backgroundColor: colors.blue
    }
  },

  container: {
    width: '100%',
    height: '100%',

    borderRadius: '3px',
    border: `${colors.accent} 1px solid`,

    '[highlight="remove"]': {
      color: colors.whiteText,
      backgroundColor: colors.red,
      border: `${colors.red} 1px solid`
    },

    '[highlight="add"]': {
      color: colors.blue,
      backgroundColor: colors.blue,
      border: `${colors.blue} 1px solid`
    }
  },

  miniContainer: {
    extend: 'container',

    borderRadius: 0,
    border: 0
  },

  content: {
    maxHeight: '45px',
    
    overflow: 'hidden',

    fontSize: '10px',
    margin: '5px 10px'
  },

  miniContent: {
    extend: 'content',

    color: colors.transparent,
    maxHeight: 'unset',
    
    fontSize: '1px',
    margin: '1px'
  },

  title: {
    position: 'absolute',
    
    color: colors.accent,
    
    top: '-10px',
    left: 'calc(50% - 73px)',

    width: '140px',

    fontSize: '10px',
    
    overflow: 'hidden',

    textAlign: 'center',
    textOverflow: 'ellipsis',

    borderRadius: '5px',

    whiteSpace: 'nowrap',

    padding: '0 3px',
    margin: '-4px 0',

    '[untitled="true"]': {
      fontStyle: 'italic'
    },

    '[highlight="remove"]': {
      color: colors.transparent
    },

    '[highlight="new-test"]': {
      color: colors.whiteText,
      backgroundColor: colors.blue,

      ':before': {
        content: '"+"'
      }
    },

    '[highlight="remove-test"]': {
      color: colors.whiteText,
      backgroundColor: colors.red
    }
  }
});

export default Item;
