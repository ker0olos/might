import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme, { opacity } from '../colors.js';

import DownIcon from '../../icons/down.svg';

const colors = getTheme();

class Select extends React.Component
{
  constructor({ options, defaultIndex })
  {
    super();

    this.state = {
      shown: false,
      value: options[defaultIndex ?? 0]
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle()
  {
    const { shown } = this.state;

    this.setState({
      shown: !shown
    });
  }

  onChange(opt)
  {
    const { onChange } = this.props;

    this.setState({
      shown: false,
      value: opt
    });

    onChange?.call(undefined, opt);
  }

  render()
  {
    const { shown, value } = this.state;
    
    const { options  } = this.props;

    return <div shown={ shown.toString() } className={ styles.container } onClick={ this.toggle }>

      <div className={ styles.selected }>{ value }</div>

      <DownIcon className={ styles.extend }/>

      <div shown={ shown.toString() } className={ styles.block } onClick={ this.toggle }/>

      <div shown={ shown.toString() } className={ styles.menu }>
        {
          options.map((opt, i) =>
          {
            return <div key={ i } className={ styles.option } onClick={ () => this.onChange(opt) }>
              { opt }
            </div>;
          })
        }
      </div>

    </div>;
  }
}

Select.propTypes = {
  defaultIndex: PropTypes.number,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func
};

const styles = createStyle({
  container: {
    display: 'flex',
    cursor: 'pointer',

    position: 'relative',

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    userSelect: 'none',

    width: '100%',
    height: '40px',

    border: 0,
    borderBottom: `${colors.blackText} 1px solid`,

    transition: 'border-bottom 0.1s',

    ' svg': {
      fill: colors.blackText
    },

    '[shown="true"]': {
      borderBottom: `${colors.blue} 3px solid`
    }
  },

  selected: {
    flexGrow: 1,
    textTransform: 'capitalize',

    fontSize: '14px',
    margin: 'auto 10px'
  },

  extend: {
    width: '20px',
    height: '20px',

    margin: 'auto 10px'
  },

  block: {
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
      display: 'block'
    }
  },

  menu: {
    display: 'none',
    position: 'absolute',
    
    overflow: 'auto',

    flexDirection: 'column',
    backgroundColor: colors.whiteBackground,

    top: '50px',
    left: '-5px',

    minHeight: '40px',
    maxHeight: '200px',

    width: 'calc(100% + 10px)',
    height: 'fit-content',

    border: `${colors.accent} 1px solid`,
    
    '[shown="true"]': {
      display: 'flex'
    },

    '::-webkit-scrollbar': {
      width: '5px',
      background: colors.whiteBackground
    },

    '::-webkit-scrollbar-thumb': {
      background: colors.accent
    }
  },

  option: {
    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    textTransform: 'capitalize',

    padding: '15px',

    ':hover': {
      color: colors.whiteText,
      backgroundColor: colors.accent
    }
  }
});

export default Select;