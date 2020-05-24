import React, { useState } from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import ArrowDownIcon from 'mdi-react/ArrowDownIcon';

import getTheme, { opacity } from '../colors.js';

const colors = getTheme();

/**
* @param { {
*    defaultIndex: number,
*    options: Array<string>,
*    onChange: (newValue: string) => void
*  } } param0
*/
const Select = ({ defaultIndex, options, onChange }) =>
{
  const [ shown, setShown ] = useState(false);
  const [ value, setValue ] = useState(options[defaultIndex || 0]);

  const show = () =>
  {
    if (shown)
      return;

    setShown(true);
  };

  const change = (opt) =>
  {
    setShown(false);
    setValue(opt);

    if (onChange)
      onChange.call(undefined, opt);
  };

  return <div shown={ shown.toString() } className={ styles.container } onClick={ show }>

    <div className={ styles.label }>{ value }</div>

    <ArrowDownIcon className={ styles.icon }/>

    <div shown={ shown.toString() } className={ styles.wrapper }/>

    <div shown={ shown.toString() } className={ styles.menu }>
      {
        options.map((opt, i) =>
        {
          return <div key={ i } className={ styles.option } onClick={ ()  => change(opt) }>
            { opt }
          </div>;
        })
      }
    </div>

  </div>;
};

Select.propTypes = {
  defaultIndex: PropTypes.number,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func
};

const styles = createStyle({
  container: {
    display: 'flex',
    position: 'relative',

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    userSelect: 'none',

    height: '40px',

    borderRadius: '5px',
    border: `${colors.blackText} 1px solid`,

    ':hover': {
      color: colors.whiteText,
      backgroundColor: colors.accent,
      border: `${colors.accent} 1px solid`
    },

    '[shown="true"]': {
      color: colors.whiteText,
      backgroundColor: colors.accent,
      border: `${colors.accent} 1px solid`
    }
  },

  label: {
    flexGrow: 1,

    fontSize: '14px',
    margin: 'auto 10px'
  },

  icon: {
    width: '20px',
    margin: 'auto 10px'
  },

  wrapper: {
    display: 'none',
    position: 'fixed',

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: opacity(colors.blackBackground, 0.25),

    top: 0,
    left: 0,
    
    width: '100vw',
    height: '100vh',

    '[shown="true"]': {
      display: 'flex'
    }
  },

  menu: {
    display: 'none',
    position: 'absolute',
    
    flexDirection: 'column',
    backgroundColor: colors.whiteBackground,

    top: '50px',
    left: '-5px',

    minHeight: '40px',
    width: 'calc(100% + 10px)',
    height: 'fit-content',

    overflow: 'hidden',
    borderRadius: '5px',

    border: `${colors.accent} 1px solid`,
    
    '[shown="true"]': {
      display: 'flex'
    }
  },

  option: {
    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    padding: '15px',

    ':hover': {
      color: colors.whiteText,
      backgroundColor: colors.accent
    }
  }
});

export default Select;