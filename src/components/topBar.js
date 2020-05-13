import React from 'react';

import PropTypes from 'prop-types';

import ContentSaveIcon from 'mdi-react/ContentSaveOutlineIcon';
import DownloadIcon from 'mdi-react/DownloadOutlineIcon';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

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
        <div className={ styles.button } onClick={ this.props.onFileSave }>
          <ContentSaveIcon className={ styles.icon }/>
          <div>Save</div>
        </div>

        <label className={ styles.button }>
          <input className={ styles.fileInput } id='loadFile' type='file' accept='application/json' onChange={ this.props.onFileLoad }/>
          <DownloadIcon className={ styles.icon }/>
          Load
        </label>
      </div>
    );
  }
}

TopBar.propTypes = {
  onFileSave: PropTypes.func.isRequired,
  onFileLoad: PropTypes.func.isRequired
};

const styles = createStyle({
  container: {
    zIndex: 1,

    display: 'flex',
    position: 'absolute',
    
    backgroundColor: colors.whiteBackground,

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
    display: 'flex',
    alignItems: 'center',

    cursor: 'pointer',
    color: colors.blackText,

    fontSize: '12px',
    padding: '0 10px',
    margin: '0 5px',

    ':hover': {
      color: colors.whiteText,
      backgroundColor: colors.accent
    }
  },

  icon: {
    width: '20px',
    height: '20px',

    margin: '0 5px'
  },

  fileInput: {
    width: '0.1px',
    height: '0.1px',
    opacity: 0,
    overflow: 'hidden',
    position: 'absolute',
    zIndex: '-1'
  }
});

export default TopBar;
