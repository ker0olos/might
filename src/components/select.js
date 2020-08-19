import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme, { opacity } from '../colors.js';

import DownIcon from '../../icons/down.svg';

const colors = getTheme();

const inputRef = React.createRef();

class Select extends React.Component
{
  constructor({ options, defaultIndex })
  {
    super();

    this.state = {
      shown: false,

      query: undefined,
      index: undefined,
      value: options[defaultIndex ?? 0],

      mainGroupText: 'All'
    };

    this.toggle = this.toggle.bind(this);
    
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onSearch = this.onSearch.bind(this);
  }

  componentDidMount()
  {
    window.addEventListener('keydown', this.onKeyDown);

    if (this.props.autoFocus)
      this.toggle(true);
  }

  componentWillUnmount()
  {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  toggle(force)
  {
    const { shown } = this.state;
    
    this.setState({
      shown: (typeof force === 'boolean') ? force : !shown,

      query: undefined,
      index: undefined
    }, () =>
    {
      if (inputRef.current)
      {
        // clear search
        inputRef.current.value = '';

        // auto-focus on search input
        if (this.state.shown)
        {
          inputRef.current?.focus();
        }
        else
        {
          inputRef.current.value = this.state.value;

          inputRef.current?.blur();
        }
      }
    });
  }

  highlight(i)
  {
    let { options } = this.props;

    const { query } = this.state;

    if (query)
      options = query;

    if (options.length <= 0)
      return;

    if (i >= options.length)
      i = 0;
    else if (i <= -1)
      i = options.length - 1;

    this.setState({
      index: i
    }, () =>
    {
      // scroll to the new highlighted option
      document.body.querySelector(`.${styles.option}[highlighted="true"]`).scrollIntoView({
        block: 'nearest'
      });
    });

  }

  /**
  * @param { KeyboardEvent } e
  */
  onKeyDown(e)
  {
    let { options } = this.props;

    const { shown, query, index } = this.state;

    if (!shown)
      return;

    if (query)
      options = query;

    // disable dialogue controls
    e.stopImmediatePropagation();

    if (e.key === 'Enter' && index !== undefined && options.length > index)
      // eslint-disable-next-line security/detect-object-injection
      this.onChange(options[index]);

    else if (e.key === 'Escape')
      this.toggle();
    
    else if (e.key === 'ArrowUp')
      this.highlight((index ?? 0) - 1);
    
    else if (e.key === 'ArrowDown')
      this.highlight((index ?? -1) + 1);
  }

  onSearch()
  {
    const { options } = this.props;

    const queryString = inputRef.current?.value;

    const query = (queryString) ? options.filter(s => s.includes(queryString)) : undefined;

    let mainGroupText;

    if (queryString)
    {
      if (query.length)
        mainGroupText = `Results (${query.length})`;
      else
        mainGroupText = 'No results';
    }
    else
    {
      mainGroupText = 'All';
    }

    this.setState({
      index: 0,
      mainGroupText,
      query
    });
  }

  onChange(opt)
  {
    const { onChange } = this.props;

    this.setState({
      value: opt
    }, () => this.toggle(false));

    onChange?.call(undefined, opt);
  }

  render()
  {
    const { shown, value, query, index } = this.state;
    
    const { options } = this.props;

    return <div shown={ shown.toString() } className={ styles.container } onClick={ this.toggle }>

      <div className={ styles.search }>
        <input ref={ inputRef } defaultValue={ value } onInput={ this.onSearch }/>
      </div>

      <DownIcon className={ styles.extend }/>

      <div shown={ shown.toString() } className={ styles.block } onClick={ this.toggle }/>

      <div shown={ shown.toString() } className={ styles.menu }>

        <div className={ styles.title }>
          { this.state.mainGroupText }
        </div>

        <div className={ styles.options }>
          {
            (query ?? options).map((opt, i) =>
            {
              const highlighted = index === i;

              return <div key={ i } highlighted={ highlighted.toString() } className={ styles.option } onClick={ () => this.onChange(opt) }>
                { opt }
              </div>;
            })
          }
        </div>
      </div>
    </div>;
  }
}

Select.propTypes = {
  autoFocus: PropTypes.bool,
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

  search: {
    flexGrow: 1,
    margin: 'auto 10px',

    '> input': {
      color: colors.blackText,

      fontSize: '14px',
      fontFamily: 'Noto Sans',
      fontWeight: 700,

      textTransform: 'capitalize',

      width: '100%',
      height: '100%',

      border: 0,
      outline: 0,
      padding: 0
    }
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

    backgroundColor: colors.transparent,

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

    backgroundColor: colors.whiteBackground,

    top: '50px',
    left: '-5px',

    minHeight: '30px',
    maxHeight: 'calc((50px * 4) + 30px)',

    width: 'calc(100% + 10px)',
    height: 'auto',

    border: `${colors.accent} 1px solid`,
    
    '[shown="true"]': {
      display: 'block'
    },

    '::-webkit-scrollbar': {
      width: '5px',
      background: colors.whiteBackground
    },

    '::-webkit-scrollbar-thumb': {
      background: colors.accent
    }
  },

  title: {
    display: 'flex',
    alignItems: 'center',
    color: colors.accent,

    height: '30px',

    fontSize: '11px',
    textTransform: 'uppercase',

    padding: '0 15px'
  },

  options: {
    display: 'grid',
    gridAutoRows: '50px'
  },

  option: {
    display: 'flex',
    alignItems: 'center',

    color: colors.blackText,
    backgroundColor: colors.whiteBackground,

    textTransform: 'capitalize',

    padding: '0 15px',

    ':hover': {
      color: colors.whiteText,
      backgroundColor: opacity(colors.accent, 0.65)
    },

    '[highlighted="true"]': {
      color: colors.whiteText,
      backgroundColor: colors.accent
    }
  }
});

export default Select;