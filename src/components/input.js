import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

const colors = getTheme();

/**
* @param { {
*    defaultValue: string,
*    valid: boolean,
*    autoFocus: boolean,
*    onChange: (newValue: string) => string
*  } } param0
*/
const Input = ({ defaultValue, valid, autoFocus, onChange }) =>
{
  if (valid === undefined)
    valid = true;
  
  const change = (e) =>
  {
    if (onChange)
      onChange.call(undefined, e.target.value);
  };

  return <div className={ styles.container }>
    <input valid={ valid.toString() } autoFocus={ autoFocus } className={ styles.input } spellCheck={ false } defaultValue={ defaultValue } type={ 'text' }  onInput={ change }/>
  </div>;
};

Input.propTypes = {
  valid: PropTypes.bool,
  defaultValue: PropTypes.any,
  autoFocus: PropTypes.bool,
  onChange: PropTypes.func
};

const styles = createStyle({
  container: {
    display: 'flex',
    backgroundColor: colors.whiteBackground,

    height: '40px'
  },

  input: {
    flexGrow: 1,

    fontSize: '14px',
    fontFamily: 'Noto Sans',
    fontWeight: 700,

    padding: '10px',

    border: 0,
    borderBottom: `${colors.blackText} 1px solid`,

    transition: 'border-bottom 0.1s',

    ':focus': {
      outline: 0
    },

    '[valid="false"]': {
      borderBottom: `${colors.red} 3px solid`
    },

    '[valid="true"]:focus': {
      borderBottom: `${colors.blue} 3px solid`,
    }
  }
});

export default Input;