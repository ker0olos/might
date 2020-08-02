import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';


const colors = getTheme();

const Toggle = ({ value, trueText, falseText, onToggle }) =>
{
  value = value || false;

  trueText = trueText || 'yes';
  falseText = falseText || 'no';

  const onClick = () => onToggle?.call(undefined, !value);

  return <div className={ styles.wrapper }>

    <div className={ styles.container } onClick={ onClick }>
      {
        (value) ?
          <div className={ styles.state }>{ trueText }</div> :
          <div className={ styles.state }>{ falseText }</div>
      }
    </div>

  </div>;
};

Toggle.propTypes = {
  value: PropTypes.bool,
  trueText: PropTypes.string,
  falseText: PropTypes.string,
  onToggle: PropTypes.func
};

const styles = createStyle({
  wrapper: {
    display: 'flex',

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    height: '40px',

    userSelect: 'none'
  },

  container: {
    flexGrow: 1,
    display: 'flex',

    cursor: 'pointer',

    alignItems: 'center',
    justifyContent: 'center',

    border: 0,
    borderBottom: `${colors.blackText} 1px solid`,
    
    margin: '10px 0 0 10px'
  },

  state: {
    color: colors.blackText.replace,
    
    fontSize: '14px',
    fontWeight: 700,

    textTransform: 'uppercase',
    
    padding: '0 10px'
  }
});

export default Toggle;