import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme, { opacity } from '../colors.js';

import SaveIcon from '../../icons/save.svg';
import LoadIcon from '../../icons/load.svg';
import UndoIcon from '../../icons/undo.svg';
import RedoIcon from '../../icons/redo.svg';

import GitHubIcon from '../../icons/github.svg';

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
        <div dirty={ this.props.dirty.toString() } className={ styles.button } title={ 'Save File (Ctrl+S)' } onClick={ this.props.onFileSave }>
          <SaveIcon className={ styles.icon }/>
          <div className={ styles.title }>Save</div>
        </div>

        <div className={ styles.button } title={ 'Load File (Ctrl+O)' } onClick={ this.props.onFileLoad }>
          <LoadIcon className={ styles.icon }/>
          <div className={ styles.title }>Load</div>
        </div>

        <div className={ styles.button } title={ 'Undo (Ctrl+Z)' } disabled={ !stack.undo } onClick={ this.props.onUndo }>
          <UndoIcon className={ styles.icon }/>
          <div className={ styles.title }>Undo</div>
        </div>

        <div className={ styles.button } title={ 'Redo (Ctrl+Y)' } disabled={ !stack.redo } onClick={ this.props.onRedo }>
          <RedoIcon className={ styles.icon }/>
          <div className={ styles.title }>Redo</div>
        </div>

        <a style={ { margin: '0 0 0 auto' } } title={ 'Might\'s GitHub page' } className={ styles.button } href={ 'https://github.com/ker0olos/Might' } rel={ 'noreferrer' } target={ '_blank' }>
          <GitHubIcon className={ styles.icon }/>
        </a>
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

    padding: '0 10px',

    borderBottom: '1px solid',
    borderColor: colors.blackShadow
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
