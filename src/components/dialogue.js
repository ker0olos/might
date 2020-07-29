import React from 'react';
import ReactDOM from 'react-dom';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import { actions } from 'might-core';

import getTheme, { opacity } from '../colors.js';

import Select from './select.js';
import Input from './input.js';

const colors = getTheme();

const unmount = () => ReactDOM.unmountComponentAtNode(document.querySelector('#dialogue'));

/**
* @typedef { import('might-core').Step } Step
*/

class Dialogue extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      masterKey: 0
    };

    this.onKeyDown = this.onKeyDown.bind(this);
    
    this.done = this.done.bind(this);
  }

  componentDidMount()
  {
    window.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount()
  {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown(e)
  {
    if (e.key === 'Escape')
      unmount();

    if (
      e.key === 'Enter' &&
      // not the best way to check if apply is enabled or not
      // but the least headache-y, someone should probably change it in the future
      !document.querySelector(`.${styles.button}[invalid="true"]`)
    )
      this.done();
  }

  done()
  {
    const { action, value } = this.state;
    
    // send the final results of the dialogue to the parent
    this.props.done?.call(undefined, action, value);
    
    // remove this dialogue element from dom
    unmount();
  }

  parseNumber(s)
  {
    const number = parseInt(s);

    if (
      !isNaN(number) &&
      number.toString().length === s.length
    )
      return number;
    else
      return s;
  }

  testNumber(s)
  {
    const number = parseInt(s);

    if (
      !isNaN(number) &&
      number.toString().length === s.length
    )
      return true;
    else
      return false;
  }

  testSelector(s)
  {
    try
    {
      document.body.querySelector(s);
    }
    catch
    {
      return false;
    }
    
    return true;
  }

  render()
  {
    /**
    * @type { {
    * type: 'edit-test' | 'edit-step'
    * title: string
    * step: Step
    * done: () => void
    * } }
    */
    const { type, title, step } = this.props;

    // Types of Dialogue

    const Test = () =>
    {
      let defaultTitle = '';

      if (title)
        defaultTitle = title;

      const onInput = (value) => this.setState({ value });

      return <div className={ styles.container }>
        <div className={ styles.title }>Test</div>
    
        <div className={ styles.options }>
          <div className={ styles.label }>Title</div>

          <div className={ styles.option }>
            <Input defaultValue={ defaultTitle } autoFocus={ true } onChange={ onInput }/>
          </div>
        </div>

        <div className={ styles.buttons }>
          <div className={ styles.button } onClick={ this.done }>Apply</div>
          <div className={ styles.button } onClick={ unmount }>Cancel</div>
        </div>
      </div>;
    };

    const Step = () =>
    {
      let defaultAction = 0;

      /**
      * @type { Step }
      */
      const s = {
        action: (this.state.action === undefined) ? step.action : this.state.action,
        value: (this.state.value === undefined) ? step.value : this.state.value
      };

      const onSelect = (action) => this.setState({
        action,
        masterKey: this.state.masterKey + 1,
        value: ''
      });

      const onInput = (value) =>
      {
        // we need to parse the value here because
        // the runner decides what to wait for based on the value type
        if (s.action === 'wait')
          this.setState({ value: this.parseNumber(value) });
        else
          this.setState({ value });
      };

      // set hints & validate value

      let field = {};

      if (s.action === 'wait')
      {
        const duration = (typeof s.value === 'number');

        field = {
          label: (duration) ? 'Duration' : 'Selector',
          valid: (!duration) ? this.testSelector(s.value) : true,
          hint: `Wait for an element to appear, or for a duration of time.\n
                Duration takes time in seconds, while elements take a CSS selector.`
        };
      }
      else if (s.action === 'viewport')
      {
        const dimensions = s.value.split('x');

        const valid = (
          dimensions.length === 2 &&
          this.testNumber(dimensions[0]) &&
          this.testNumber(dimensions[1])
        );

        field = {
          valid,
          label: 'Dimensions',
          hint: `Change the viewport of the page.\n
                Dimensions take width [x] height. For Example: (1280x720).`
        };
      }
      else if (s.action === 'select')
      {
        field = {
          label: 'Selector',
          valid: this.testSelector(s.value),
          hint: 'Select an element using a CSS selector.'
        };
      }
      else if (s.action === 'hover')
      {
        field = {
          valid: true,
          hint: `Hover over an element.\n
          An element needs to be previously selected with the Select action.`
        };
      }
      else if (s.action === 'click')
      {
        field = {
          valid: true,
          hint: `Click on an element.\n
          An element needs to be previously selected with the Select action.`
        };
      }
      else if (s.action === 'type')
      {
        field = {
          label: 'Value',
          valid: true,
          hint: `Type anything inside an input element.\n
          An element needs to be previously selected with the Select action.`
        };
      }

      // change the input label to reflect that the
      // current value is invalid
      if (!field.valid)
        field.label  = `Invalid ${field.label}`;

      // when the dialog is first opened
      // it has no action or value
      // so we use this defaults from the parent
      if (step)
        defaultAction = actions.indexOf(step.action);

      return <div className={ styles.container }>
        <div className={ styles.title }>Step</div>
    
        <div className={ styles.options }>
          <div className={ styles.label }>Action</div>

          <div className={ styles.option }>
            <Select defaultIndex={ defaultAction } options={ actions } onChange={ onSelect }/>
          </div>

          {
            (field.label) ?
              <div key={ this.state.masterKey }>
                <div className={ styles.label } valid={ field.valid.toString() }>{ field.label }</div>

                <div className={ styles.option }>
                  <Input
                    valid={ field.valid }
                    defaultValue={ s.value }
                    autoFocus={ true }
                    onChange={ onInput }
                  />
                </div>
              </div> : <div/>
          }

          <div className={ styles.hint }>{ field.hint }</div>
        </div>

        <div className={ styles.buttons }>
          <div invalid={ (!field.valid).toString() } className={ styles.button } onClick={ this.done }>Apply</div>
          <div className={ styles.button } onClick={ unmount }>Cancel</div>
        </div>
      </div>;
    };

    return <div className={ styles.wrapper }>
      { (type === 'edit-step') ? Step() : Test() }
    </div>;
  }
}

Dialogue.propTypes = {
  type: PropTypes.string.isRequired,
  title: PropTypes.string,
  step: PropTypes.object,
  done: PropTypes.func
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
    
    overflow: 'hidden',
    borderRadius: '5px'
  },

  title: {
    color: colors.blackText,

    fontSize: '11px',
    userSelect: 'none',
    
    margin: '25px 15px'
  },

  label: {
    color: colors.accent,

    fontSize: '11px',
    userSelect: 'none',

    margin: '0 15px -15px 15px',

    '[valid="false"]': {
      color: colors.red
    }
  },

  hint: {
    color: opacity(colors.blackText, 0.65),

    fontSize: '13px',
    
    userSelect: 'none',
    whiteSpace: 'pre-line',

    margin: '15px'
  },

  options: {
    flexGrow: 1,
    minHeight: '360px'
  },

  option: {
    margin: '15px'
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
    },

    '[invalid="true"]': {
      color: colors.red,
      pointerEvents: 'none'
    }
  }
});

export default Dialogue;