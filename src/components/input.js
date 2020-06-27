import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme, { opacity } from '../colors.js';

const colors = getTheme();

/**
* @param { {
*    defaultValue: string,
*    suffix: { content: string, title: string },
*    autoFocus: boolean,
*    onChange: (newValue: string) => string
*  } } param0
*/
const Input = ({ defaultValue, suffix, autoFocus, onChange }) =>
{
  const change = (e) =>
  {
    if (onChange)
      onChange.call(undefined, e.target.value);
  };

  return <div className={ styles.container }>
    <input autoFocus={ autoFocus } className={ styles.input } spellCheck={ false } defaultValue={ defaultValue } type={ 'text' }  onInput={ change }/>
    <div className={ styles.suffix } title={ suffix?.title }>{ suffix?.content }</div>
  </div>;
};

Input.propTypes = {
  defaultValue: PropTypes.any,
  suffix: PropTypes.object,
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

    ':invalid': {
      borderBottom: `${colors.red} 3px solid`
    },

    ':focus': {
      borderBottom: `${colors.blue} 3px solid`,

      outline: 0
    }
  },

  suffix: {
    userSelect: 'none',

    fontSize: '14px',
    padding: '10px',

    border: 0,
    borderBottom: `${colors.blackText} 1px solid`,

    transition: 'border-bottom 0.1s',

    'input:invalid ~ %this':
    {
      borderBottom: `${colors.red} 3px solid`
    },

    'input:focus ~ %this':
    {
      borderBottom: `${colors.blue} 3px solid`
    },

    ':empty': {
      margin: 0
    }
  }
});

export default Input;