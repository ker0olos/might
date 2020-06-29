import React from 'react';

import PropTypes from 'prop-types';

import { ReactSVG } from 'react-svg';

import { createStyle } from 'flcss';

import getTheme, { opacity } from '../colors.js';

const colors = getTheme();

class TopBar extends React.Component
{
  constructor()
  {
    super();
  }

  render()
  {
    return (
      <div className={ styles.container }>
        <div dirty={ this.props.dirty.toString() } className={ styles.button } title={ 'Ctrl+S' } onClick={ this.props.onFileSave }>
          <ReactSVG src='icons/save.svg' className={ styles.icon }/>
          <div className={ styles.title }>Save</div>
        </div>

        <div className={ styles.button } title={ 'Ctrl+O' } onClick={ this.props.onFileLoad }>
          <ReactSVG src='icons/load.svg' className={ styles.icon }/>
          <div className={ styles.title }>Load</div>
        </div>

        <div className={ styles.button } title={ 'Ctrl+Z' } onClick={ this.props.onUndo }>
          <ReactSVG src='icons/undo.svg' className={ styles.icon }/>
          <div className={ styles.title }>Undo</div>
        </div>

        <div className={ styles.button } title={ 'Ctrl+Y' } onClick={ this.props.onRedo }>
          <ReactSVG src='icons/redo.svg' className={ styles.icon }/>
          <div className={ styles.title }>Redo</div>
        </div>
      </div>
    );
  }
}

TopBar.propTypes = {
  dirty: PropTypes.bool.isRequired,
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

  button: {
    opacity: 0.85,

    display: 'flex',
    alignItems: 'center',

    cursor: 'pointer',
    color: colors.blackText,

    fontSize: '12px',
    padding: '0 10px',
    margin: '0 5px',

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
    '> div': {
      width: '20px',
      height: '20px'
    },

    '> div > svg': {
      width: '20px',
      height: '20px'
    },

    margin: '0 5px 0 0'
  }
});

export default TopBar;
