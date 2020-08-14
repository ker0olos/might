import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme, { opacity } from '../colors.js';

import SaveIcon from '../../icons/save.svg';
import LoadIcon from '../../icons/load.svg';
import UndoIcon from '../../icons/undo.svg';
import RedoIcon from '../../icons/redo.svg';

const colors = getTheme();

class TopBar extends React.Component
{
  constructor()
  {
    super();
  }

  render()
  {
    const { stack } = this.props;

    return (
      <div className={ styles.container }>
        {
          (typeof window.chooseFileSystemEntries !== 'function') ?
            <div className={ styles.notice }>
              <a href='https://web.dev/native-file-system'>Native File System API</a>
              { ' is not enabled in your browser.' }
              <br/>
              { 'Saving and Loading won\'t work.' }
            </div> : <div/>
        }

        <div dirty={ this.props.dirty.toString() } className={ styles.button } title={ 'Ctrl+S' } onClick={ this.props.onFileSave }>
          <SaveIcon className={ styles.icon }/>
          <div className={ styles.title }>Save</div>
        </div>

        <div className={ styles.button } title={ 'Ctrl+O' } onClick={ this.props.onFileLoad }>
          <LoadIcon className={ styles.icon }/>
          <div className={ styles.title }>Load</div>
        </div>

        <div className={ styles.button } title={ 'Ctrl+Z' } disabled={ !stack.undo } onClick={ this.props.onUndo }>
          <UndoIcon className={ styles.icon }/>
          <div className={ styles.title }>Undo</div>
        </div>

        <div className={ styles.button } title={ 'Ctrl+Y' } disabled={ !stack.redo } onClick={ this.props.onRedo }>
          <RedoIcon className={ styles.icon }/>
          <div className={ styles.title }>Redo</div>
        </div>
      </div>
    );
  }
}

TopBar.propTypes = {
  dirty: PropTypes.bool.isRequired,
  stack: PropTypes.object.isRequired,
  onFileSave: PropTypes.func.isRequired,
  onFileLoad: PropTypes.func.isRequired,
  onUndo: PropTypes.func.isRequired,
  onRedo: PropTypes.func.isRequired
};

const styles = createStyle({
  container: {
    zIndex: 1,

    display: 'flex',
    position: 'absolute',
    
    backgroundColor: opacity(colors.whiteBackground, 0.85),
    backdropFilter: 'blur(3px)',

    top: 0,
    width: 'calc(100vw - 20px)',
    height: '40px',

    fontFamily: 'Noto Sans',
    fontWeight: 700,

    userSelect: 'none',

    padding: '0 10px',

    borderBottom: '1px solid',
    borderColor: colors.blackShadow
  },

  notice: {
    position: 'absolute',
    color: colors.accent,
    
    top: '100%',

    fontFamily: 'Noto Sans',
    fontSize: '11px',
    fontWeight: 700,

    margin: '10px 0 0 0',

    ' a': {
      color: colors.blue,
      textDecoration: 'none'
    },

    ' a:hover': {
      color: colors.blue,
      textDecoration: 'underline'
    },

    ' a:visited': {
      color: colors.blue
    }
  },

  button: {
    opacity: 0.85,

    display: 'flex',
    alignItems: 'center',

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
    margin: '0 5px 0 0'
  },

  icon: {
    width: '20px',
    height: '20px',

    margin: '0 5px 0 0'
  }
});

export default TopBar;
