/* eslint-disable security/detect-object-injection */

import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme, { opacity } from '../colors.js';

import SaveIcon from '../../icons/save.svg';
import LoadIcon from '../../icons/load.svg';
import UndoIcon from '../../icons/undo.svg';
import RedoIcon from '../../icons/redo.svg';

const inputRef = React.createRef();

const colors = getTheme();

class TopBar extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      visible: false
    };

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onPress = this.onPress.bind(this);

    this.onSearch = this.onSearch.bind(this);
  }

  componentDidMount()
  {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keypress', this.onPress);
  }

  componentWillUnmount()
  {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keypress', this.onPress);
  }

  /**
  * @param { KeyboardEvent } e
  */
  onKeyDown(e)
  {
    // only backspace if their is something to delete
    if (!inputRef.current?.value)
      return;

    // 'Backspace' does not call onPress normally
    if (e.key === 'Backspace')
      this.onPress();
  }

  onPress()
  {
    const dialogue = document.body.querySelector('#dialogue').children.length > 0;
    const contextMenu = document.body.querySelector('#contextMenu').children.length > 0;

    if (document.activeElement === document.body && !dialogue && !contextMenu)
    {
      this.setState({
        visible: true
      }, () => inputRef.current.focus());
    }
  }

  onSearch()
  {
    const { mindmap } = this.props;

    const query = inputRef.current.value.toLowerCase();

    const previous = this.state.previous;

    this.setState({
      previous: query,
      visible: (!query) ? false : true
    });

    /**
    * @type { import('./mindmap.js').FamilizedObject }
    */
    const familizedData = mindmap.state.familizedData;

    /**
    * @param { string } s
    */
    const match = (s) => s?.toLowerCase().includes(query);

    /**
    * @param { import('./mindmap.js').FamilizedObject } children
    * @param { boolean } carry
    */
    const recursive = (children, carry) =>
    {
      let visible = false;

      for (const key in children)
      {
        const item = children[key];

        // query is empty
        // reset all items to be visible again
        if (!query)
        {
          item.invisible = undefined;

          // reset children loop
          recursive(item.children);

          continue;
        }

        // all items default to invisible during search
        item.invisible = true;

        // search item's key and test title
        if (match(key) || match(item.title))
        {
          visible = true;
          item.invisible = false;
        }

        // carried visibility from parent
        if (carry === false)
        {
          item.invisible = false;
        }

        // loop through children to see if any of them match the query
        if (recursive(item.children, item.invisible))
        {
          visible = true;
          item.invisible = false;
        }
      }

      return visible;
    };

    // start loop
    recursive(familizedData);

    // set query
    mindmap.setState({
      familizedData
    }, () =>
    {
      // scroll to center when a search is performed for the first time
      // or when a search is cleared
      if (!previous || (previous && !query))
        mindmap.scrollToCenter();
    });
  }

  render()
  {
    const { mindmap, dirty, stack } = this.props;

    const { visible } = this.state;

    return (
      <div className={ styles.container }>
        <div dirty={ dirty.toString() } className={ styles.button } title={ 'Save File (Ctrl+S)' } onClick={ mindmap.saveFile }>
          <SaveIcon className={ styles.icon }/>
          <div className={ styles.title }>Save</div>
        </div>

        <div className={ styles.button } title={ 'Load File (Ctrl+O)' } onClick={ mindmap.loadFile }>
          <LoadIcon className={ styles.icon }/>
          <div className={ styles.title }>Load</div>
        </div>

        <div className={ styles.button } title={ 'Undo (Ctrl+Z)' } disabled={ !stack.undo } onClick={ mindmap.undo }>
          <UndoIcon className={ styles.icon }/>
          <div className={ styles.title }>Undo</div>
        </div>

        <div className={ styles.button } title={ 'Redo (Ctrl+Y)' } disabled={ !stack.redo } onClick={ mindmap.redo }>
          <RedoIcon className={ styles.icon }/>
          <div className={ styles.title }>Redo</div>
        </div>

        <div visible={ visible.toString() } className={ styles.search }>
          <input ref={ inputRef } spellCheck={ false } autoComplete={ 'off' } onInput={ this.onSearch }/>
        </div>
      </div>
    );
  }
}

TopBar.propTypes = {
  dirty: PropTypes.bool.isRequired,
  stack: PropTypes.object.isRequired,
  mindmap: PropTypes.object.isRequired
};

const styles = createStyle({
  container: {
    zIndex: 1,

    display: 'flex',
    position: 'absolute',

    flexWrap: 'wrap',

    justifyContent: 'center',

    backgroundColor: opacity(colors.whiteBackground, 0.85),
    backdropFilter: 'blur(3px)',

    top: 0,
    width: 'calc(100vw - 20px)',

    fontFamily: 'Noto Sans',
    fontWeight: 700,

    padding: '0 10px',

    borderBottom: '1px solid',
    borderColor: colors.blackShadow
  },

  search: {
    display: 'none',

    width: '100%',
    margin: '8px 0',

    '[visible="true"]': {
      display: 'block'
    },

    '> input': {
      color: opacity(colors.blackText, 0.65),

      fontSize: '13px',
      fontFamily: 'Noto Sans',
      fontWeight: 700,

      textAlign: 'center',

      width: '100%',
      height: '100%',

      border: 0,
      outline: 0,
      padding: 0
    }
  },

  button: {
    opacity: 0.85,

    display: 'flex',
    alignItems: 'center',

    height: '40px',

    cursor: 'pointer',
    color: colors.blackText,

    fontSize: '12px',
    padding: '0 10px',
    margin: '0 5px',

    '[disabled]': {
      pointerEvents: 'none',
      color: colors.accent,

      ' svg': {
        fill: colors.accent
      }
    },

    '[dirty="true"]': {
      fontStyle: 'italic',

      ':after': {
        content: '"!??"',
        margin: '0 0 0 -5px'
      }
    },

    ':hover': {
      color: colors.whiteText,
      backgroundColor: colors.accent,

      ' svg': {
        fill: colors.whiteText
      }
    },

    ' svg': {
      fill: colors.blackText
    }
  },

  title: {
    ':not(:empty)': {
      
      margin: '0 5px'
    }
  },

  icon: {
    width: '20px',
    height: '20px'
  }
});

export default TopBar;
