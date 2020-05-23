import React from 'react';
// import ReactDOM from 'react-dom';

// import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme, { opacity } from '../colors.js';

import Select from './select.js';
import Input from './input.js';

const colors = getTheme();

// const unmount = () =>
// {
//   ReactDOM.unmountComponentAtNode(document.querySelector('#dialogue'));
// };

const Dialogue = () =>
{
  // FIX incompatible with <Select/> focus logic
  // unmount the dialogue (cancel) by pressing escape key
  // useEffect(() =>
  // {
  //   window.addEventListener('keydown', (e) =>
  //   {
  //     if (e.key === 'Escape')
  //       unmount();
  //   });
  // }, []);

  const onChange = (newValue) =>
  {
    // TODO apply changes
    console.log(newValue);
  };

  return <div className={ styles.wrapper }>
    <div className={ styles.container }>
      <div className={ styles.title }>Action:</div>

      <div className={ styles.options }>
        <Select defaultIndex={ 0 } options={ [ 'Option 1', 'Option 2', 'Option 3' ] } onChange={ onChange }/>
        <Input/>
      </div>

      <div className={ styles.buttons }>
        <div className={ styles.button }>Apply</div>
      </div>
    </div>
  </div>;
};

Dialogue.propTypes = {
  //
};

const styles = createStyle({
  wrapper: {
    zIndex: 3,

    display: 'flex',
    position: 'absolute',

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: opacity(colors.blackBackground, 0.85),

    top: 0,
    left: 0,
    
    width: '100vw',
    height: '100vh'
  },

  container: {
    display: 'flex',
    flexDirection: 'column',

    fontSize: '14px',
    fontFamily: 'Noto Sans',
    fontWeight: 700,

    backgroundColor: colors.whiteBackground,

    width: '350px',
    height: '450px',
    
    overflow: 'hidden',
    borderRadius: '5px'
  },

  title: {
    userSelect: 'none',
    margin: '25px 15px 10px 15px'
  },

  options: {
    flexGrow: 1,

    '> div': {
      margin: '15px'
    }
  },
  
  buttons: {
    display: 'flex',
    userSelect: 'none'
  },

  button: {
    flexGrow: 1,
    cursor: 'pointer',
    
    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    textAlign: 'center',
    padding: '15px 0px',

    transition: 'transform 0.1s cubic-bezier(0.47, 0, 0.75, 0.72)',

    ':hover': {
      color: colors.whiteText,
      backgroundColor: colors.accent
    },

    ':active': {
      transform: 'scale(0.95)'
    }
  }
});

export default Dialogue;