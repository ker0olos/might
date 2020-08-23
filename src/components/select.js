import React from 'react';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

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

      index: defaultIndex ?? 0,

      suggestions: [],
      other: [],

      value: options[defaultIndex ?? 0]
    };

    this.toggle = this.toggle.bind(this);
    
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onSearch = this.onSearch.bind(this);
  }

  componentDidMount()
  {
    window.addEventListener('keydown', this.onKeyDown);

    const { suggestions, other } = this.getItems([]);

    this.setState({
      suggestions,
      other
    }, () =>
    {
      if (this.props.autoFocus)
        this.toggle(true);
    });
  }

  componentWillUnmount()
  {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  toggle(force)
  {
    const { shown, value } = this.state;
    
    const { suggestions, other } = this.getItems([]);

    this.setState({
      shown: (typeof force === 'boolean') ? force : !shown,
      index: suggestions.concat(other).indexOf(value),
      // reset results if the menu is toggled
      suggestions,
      other
    }, () =>
    {
      if (inputRef.current)
      {
        // clear search
        inputRef.current.value = '';

        // scroll to the new selected option
        document.body.querySelector(`.${styles.option}[highlighted="true"]`).scrollIntoView({
          block: 'nearest'
        });

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

  /**
  * @param { string } queryString
  */
  getItems(queryString)
  {
    /**
    * @type { string[] }
    */
    const options = this.props.options;

    /**
    * @type { string[] }
    */
    const suggestions = this.props.suggestions;

    if (queryString)
    {
      const query = options.filter(s => s.includes(queryString));

      return {
        suggestions: suggestions.filter((s) => query.includes(s)),
        other: query.filter((s) => !suggestions.includes(s)).sort()
      };
    }
    else
    {
      // remove suggestions, and sort alphabetically
      return {
        suggestions,
        other: options.filter((s) => !suggestions.includes(s)).sort()
      };
    }
  }

  /**
  * @param { KeyboardEvent } e
  */
  onKeyDown(e)
  {
    const { shown, index, other, suggestions } = this.state;

    if (!shown)
      return;

    // disable dialogue controls
    e.stopImmediatePropagation();

    if (e.key === 'Enter')
    {
      const all = suggestions.concat(other);

      if (index < all.length)
        // eslint-disable-next-line security/detect-object-injection
        this.onChange(all[index]);
    }

    else if (e.key === 'Escape')
      this.toggle();
   
    else if (e.key === 'ArrowUp')
      this.press(index - 1);
   
    else if (e.key === 'ArrowDown')
      this.press(index+ 1);
  }

  press(i)
  {
    const { other, suggestions } = this.state;

    const length = suggestions.length + other.length;

    if (length <= 0)
      return;

    if (i >= length)
      i = 0;
    else if (i <= -1)
      i = length - 1;

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

  hover(i)
  {
    this.setState({
      index: i
    });
  }

  onSearch()
  {
    const queryString = inputRef.current?.value;

    const { suggestions, other } = this.getItems(queryString);

    this.setState({
      index: 0,
      suggestions,
      other
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
    const { shown, value, other, suggestions, index } = this.state;

    return <div shown={ shown.toString() } className={ styles.container } onClick={ this.toggle }>
      <div className={ styles.search }>
        <input ref={ inputRef } defaultValue={ value } spellCheck={ false } autoComplete={ 'off' } onInput={ this.onSearch }/>
      </div>

      <DownIcon className={ styles.extend }/>

      <div shown={ shown.toString() } className={ styles.block } onClick={ this.toggle }/>

      <div shown={ shown.toString() } className={ styles.menu }>

        {
          (suggestions.length && other.length) ? <div className={ styles.title }>Suggestions</div> : <div/>
        }

        {
          (!suggestions.length && !other.length) ? <div className={ styles.title }>No Results</div> : <div/>
        }

        <div className={ styles.options }>
          {
            suggestions.map((opt, i) =>
            {
              const highlighted = index === i;

              return <div key={ i } highlighted={ highlighted.toString() } className={ styles.option } onClick={ () => this.onChange(opt) }>
                { opt }
              </div>;
            })
          }
        </div>

        {
          (suggestions.length && other.length) ? <div className={ styles.title }>Other</div> : <div/>
        }

        <div className={ styles.options }>
          {
            other.map((opt, i) =>
            {
              const highlighted = index === (i + suggestions.length);

              return <div key={ i } highlighted={ highlighted.toString() } className={ styles.option } onMouseOver={ () => this.hover(i) } onClick={ () => this.onChange(opt) }>
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
  suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
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

    minHeight: '25px',
    maxHeight: 'calc((50px * 4) + 50px)',

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

    height: '25px',

    fontSize: '9px',
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

    '[highlighted="true"]': {
      color: colors.whiteText,
      backgroundColor: colors.accent
    }
  }
});

export default Select;