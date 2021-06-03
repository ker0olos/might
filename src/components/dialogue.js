import React, { createRef } from 'react';
import ReactDOM from 'react-dom';

import Markdown from 'react-markdown';

import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import { actions } from 'might-core';

import getTheme, { opacity } from '../colors.js';

import Select from './select.js';
import Input from './input.js';

import Toggle from './toggle.js';

import WaitAction from '../documentation/wait.md';

import ViewportAction from '../documentation/viewport.md';
import GotoAction from '../documentation/goto.md';
import MediaAction from '../documentation/media.md';

import SelectAction from '../documentation/select.md';
import HoverAction from '../documentation/hover.md';
import ClickAction from '../documentation/click.md';

import DragAction from '../documentation/drag.md';
import SwipeAction from '../documentation/swipe.md';

import KeyboardAction from '../documentation/keyboard.md';
import TypeAction from '../documentation/type.md';

const colors = getTheme();

const unmount = () => ReactDOM.unmountComponentAtNode(document.querySelector('#dialogue'));

/**
* @typedef { import('might-core').Step } Step
*/

class Dialogue extends React.Component
{
  constructor({ step, referrer })
  {
    super();

    this.state = {
      masterKey: 0,
      
      action: step?.action ?? this.getSuggestions(referrer)[0] ?? actions[0],
      value: step?.value ?? '',
      pure: step?.value ?? '',

      autoCompletePossibilities: [],
      autoCompleteSteps: [],

      toggles: {}
    };

    this.inputRef = createRef();

    this.onKeyDown = this.onKeyDown.bind(this);
    
    this.done = this.done.bind(this);
  }

  componentDidMount()
  {
    window.addEventListener('keydown', this.onKeyDown);

    const { step } = this.props;

    if (!step)
      return;

    const {
      autoCompletePossibilities,
      autoCompleteSteps
    } = this.getAutoComplete(step);

    this.setState({
      autoCompletePossibilities,
      autoCompleteSteps
    });
  }

  componentWillUnmount()
  {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown(e)
  {
    if (e.key === 'Escape')
      unmount();

    if (e.key === 'ArrowRight')
      this.doAutoComplete(0);

    if (e.key === 'Enter' && this.isValid())
      this.done();
  }

  /**
  * @param { Step } referrer
  */
  getSuggestions(referrer)
  {
    // new root step
    if (!referrer)
    {
      return [ 'wait', 'select', 'goto' ];
    }
    else if (referrer.action === 'wait' && typeof referrer.value === 'number')
    {
      return [ 'select' ];
    }
    else if (referrer.action === 'wait' || referrer.action === 'select')
    {
      return [ 'click', 'type', 'drag' ];
    }

    return [ 'wait', 'select' ];
  }

  /**
  * @param { Step } step
  */
  getAutoComplete({ action, value })
  {
    if (action === 'click')
    {
      const returnPossibilities =
        [
          'left',
          'middle',
          'right'
        ].filter((s) => s.startsWith(value) && s !== value);
      
      return {
        autoCompletePossibilities: returnPossibilities,
        autoCompleteSteps: returnPossibilities
      };
    }
    else if (action === 'goto')
    {
      const returnPossibilities =
        [
          'back',
          'forward'
        ].filter((s) => s.startsWith(value) && s !== value);
      
      return {
        autoCompletePossibilities: returnPossibilities,
        autoCompleteSteps: returnPossibilities
      };
    }
    else if (action === 'media')
    {
      const returnPossibilities = [
        'prefers-color-scheme: dark',
        'prefers-color-scheme: light'
        
        // TODO "prefers-reduced-motion" is no longer supported
        // 'prefers-reduced-motion: reduce',
        // 'prefers-reduced-motion: no-preference'
      ].filter((s) => s.startsWith(value) && s !== value);
        
      return {
        autoCompletePossibilities: returnPossibilities,
        autoCompleteSteps: returnPossibilities.map(s => s.split(' '))
      };
    }

    return {
      autoCompletePossibilities: [],
      autoCompleteSteps: []
    };
  }

  /**
  * @param { number } index
  * @param { boolean } full
  */
  doAutoComplete(index, full)
  {
    const input = this.inputRef.current;
    
    // eslint-disable-next-line security/detect-object-injection
    if (!input || !this.state.autoCompleteSteps || !this.state.autoCompleteSteps[index])
      return;
    
    let value;

    // eslint-disable-next-line security/detect-object-injection
    const steps = this.state.autoCompleteSteps[index];

    const current = input.value;

    if (full)
    {
      value = steps.join?.(' ') ?? steps;
    }
    else
    {
      for (let i = 0; i < steps.length; i++)
      {
        // eslint-disable-next-line security/detect-object-injection
        const step = steps[i];
        
        if (current.startsWith(step))
          continue;
        
        value = steps?.slice(0, i + 1).join?.(' ') ?? steps;
    
        break;
      }
    }

    const event = new Event('input', {
      bubbles: true,
      cancelable: true
    });

    input.value = value;

    input.dispatchEvent(event);
  }

  done()
  {
    const { toggles } = this.state;

    let { value } = this.state;

    const { action } = this.state;

    // handle how the toggles effect the end value
    if (action === 'viewport')
    {
      let v = value;

      if (toggles['touch'])
        v = v.includes('t') ? v : (v + 't');
      else
        v = v.replace(/t/g, '');

      if (toggles['full'])
        v = v.includes('f') ? v : (v + 'f');
      else
        v = v.replace(/f/g, '');
      
      value = v;
    }

    // handle converting coords to an array
    if (action === 'drag' || action === 'swipe')
    {
      value = value.split(',').map(s => s.trim());
    }

    // trim value if it's a string
    if (value?.trim)
      value = value.trim();

    // send the final results of the dialogue to the parent
    this.props.done?.call(undefined, action, value);
    
    // remove this dialogue element from dom
    unmount();
  }

  isValid()
  {
    // not the best way to check if apply is enabled or not
    // but the least headache-y, someone should probably change it in the future
    const valid = !document.querySelector(`.${styles.button}[invalid="true"]`);

    return valid;
  }

  parseNumber(s)
  {
    const number = parseInt(s);

    if (
      !isNaN(number) &&
      number.toString().length === s.length &&
      number > -1
    )
      return number;
    else
      return s;
  }

  filterNumber(s)
  {
    const number = parseInt(s);

    if (isNaN(number))
      return undefined;
    else
      return s.trim().replace(number.toString(), '');
  }

  testNumber(s)
  {
    const number = parseInt(s);

    if (
      !isNaN(number) &&
      number.toString().length === s.length &&
      number > -1
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
    * type: 'edit-test' | 'new-step' | 'edit-step'
    * title: string
    * step: Step
    * done: () => void
    * } }
    */
    const { type, title } = this.props;

    const action = this.state.action;
    let value = this.state.value;
    
    const suggestions =  (type === 'new-step') ? this.getSuggestions(this.props.referrer) : [];

    // Types of Dialogue

    const Test = () =>
    {
      const defaultTitle = title || '';

      const onInput = (value) => this.setState({ value });

      return <div className={ styles.container }>
        <div className={ styles.title }>Test</div>
    
        <div className={ styles.options }>
          <div className={ styles.actionLabel }>Title</div>

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
      const autoFocusSelect = (type === 'new-step');

      const { toggles } = this.state;

      // determine if toggles should be enabled
      // at the very start of the dialogue
      if (action === 'viewport')
      {
        if (toggles['touch'] === undefined && value.includes('t'))
          toggles['touch'] = true;

        if (toggles['full'] === undefined && value.includes('f'))
          toggles['full'] = true;

        value = value.replace(/t/g, '').replace(/f/g, '');
      }

      // reset value and toggles every new select
      const onSelect = (action) =>
      {
        const oldAction = this.state.action, oldValue = this.state.value;

        let value = '';

        // select and wait are allowed to exchange values
        // or if the action did not change
        if (
          (oldAction === action) ||
          // go from select to wait but only if value is valid
          (oldAction === 'select' && action === 'wait' && this.isValid()) ||
          // go from wait (for elements) to select
          (oldAction === 'wait' && typeof oldValue === 'string' && action === 'select')
        )
          value = oldValue;

        const {
          autoCompletePossibilities,
          autoCompleteSteps
        } = this.getAutoComplete({ action, value });

        this.setState({
          action,
          value,
          pure: value,

          masterKey: this.state.masterKey + 1,

          autoCompletePossibilities,
          autoCompleteSteps,

          toggles: {}
        }, () =>
        {
          const input = this.inputRef.current;

          // auto focus on input after selection
          input?.focus();

          if (!value)
            return;
          
          // if value was not cleared post-select
          // then select all the text to make it easier
          // for the user to clear if not required

          input?.setSelectionRange(0, value.length);
        });
      };

      const onToggle = (value, key) =>
      {
        const { toggles } = this.state;

        // eslint-disable-next-line security/detect-object-injection
        toggles[key] = value;

        this.setState({
          toggles
        });
      };

      const onInput = (value) =>
      {
        let pure;
        
        const {
          autoCompletePossibilities,
          autoCompleteSteps
        } = this.getAutoComplete({ action, value });

        // we need to parse the value here because
        // the runner decides what to wait for based on the value type
        if (action === 'wait')
          pure = value = this.parseNumber(value);
        else
          pure = value;

        this.setState({
          value,
          pure,

          autoCompletePossibilities,
          autoCompleteSteps
        });
      };

      // set hints & validate value

      let field = {};

      if (action === 'wait')
      {
        const duration = (typeof value === 'number');

        field = {
          label: (duration) ? 'Duration' : 'Selector',
          valid: (!duration) ? this.testSelector(value) : true,
          hint: WaitAction
        };
      }
      else if (action === 'viewport')
      {
        const v = this.state.pure ?? value;

        const dimensions = v.split('x');

        let valid = false;

        if (v.length === 0)
        {
          valid = true;
        }
        else if (dimensions.length === 2)
        {
          const [ w, h ] = dimensions;

          if (this.testNumber(w) && this.testNumber(h))
            valid = true;
          else if (this.testNumber(w) && !h)
            valid = true;
          else if (this.testNumber(h) && !w)
            valid = true;
        }

        field = {
          valid,
          label: 'Dimensions',

          toggles: [
            {
              label: 'Touch',
              value: false
            },
            {
              label: 'Full',
              value: false
            }
          ],

          hint: ViewportAction
        };
      }
      else if (action === 'goto')
      {
        field = {
          valid: (value.length > 0),
          label: 'URL',

          hint: GotoAction
        };
      }
      else if (action === 'media')
      {
        const value = (this.state.pure ?? value).split(':');

        const valid = (
          value.length === 2 &&
          value[0]?.trim().length > 0 &&
          value[1]?.trim().length > 0
        );

        field = {
          valid,
          label: 'Feature',
          hint: MediaAction
        };
      }
      else if (action === 'select')
      {
        field = {
          label: 'Selector',
          valid: this.testSelector(value),
          hint: SelectAction
        };
      }
      else if (action === 'hover')
      {
        field = {
          valid: true,
          hint: HoverAction
        };
      }
      else if (action === 'click')
      {
        const value = this.state.pure ?? value;

        const valid = (
          value === 'left' ||
          value === 'middle' ||
          value === 'right'
        );

        field = {
          valid,
          label: 'Type',
          hint: ClickAction
        };
      }
      else if (action === 'drag')
      {
        const coordinates =
        Array.isArray(value) ?
          value :
          (this.state.pure ?? value).split(',');

        let valid = true;

        if (coordinates.length === 2)
        {
          for (let i = 0; i < coordinates.length; i++)
          {
            // eslint-disable-next-line security/detect-object-injection
            const result = this.filterNumber(coordinates[i]);
    
            if (result !== '' && result !== 'f' && result !== 'v')
              valid = false;
          }
        }
        else
        {
          valid = false;
        }

        field = {
          valid,
          label: 'Coordinates',
          hint: DragAction
        };
      }
      else if (action === 'swipe')
      {
        const coordinates =
        Array.isArray(value) ?
          value :
          (this.state.pure ?? value).split(',');

        let valid = true;

        if (coordinates.length === 4)
        {
          for (let i = 0; i < coordinates.length; i++)
          {
            // eslint-disable-next-line security/detect-object-injection
            const result = this.filterNumber(coordinates[i]);
  
            if (result !== '' && result !== 'v')
              valid = false;
          }
        }
        else
        {
          valid = false;
        }

        field = {
          valid,
          label: 'Coordinates',
          hint: SwipeAction
        };
      }
      else if (action === 'keyboard')
      {
        let valid = true;

        const split = (this.state.pure ?? value).replace('++', '+NumpadAdd').split('+');

        if (split.length <= 0)
          valid = false;
        
        split.forEach((s) =>
        {
          if (!s)
            valid = false;
        });

        field = {
          label: 'Combination',
          valid: valid,
          hint: KeyboardAction
        };
      }
      else if (action === 'type')
      {
        field = {
          label: 'Value',
          valid: true,
          hint: TypeAction
        };
      }

      // change the input label to reflect that the
      // current value is invalid
      if (!field.valid)
        field.label  = `Invalid ${field.label}`;

      // prettify the default value of arrays
      if (Array.isArray(value))
        value = value.join(', ');

      return <div className={ styles.container }>
        <div className={ styles.title }>Step</div>
    
        <div className={ styles.options }>
          <div className={ styles.actionLabel }>Action</div>

          <div className={ styles.option }>
            <Select
              autoFocus={ autoFocusSelect }
              defaultIndex={ actions.indexOf(action) }
              options={ actions }
              suggestions={ suggestions }
              onChange={ onSelect }
            />
          </div>

          {
            (field.label) ?
              <div key={ this.state.masterKey }>

                <div className={ styles.labels }>
                  <div className={ styles.valueLabel } valid={ field.valid.toString() }>{ field.label }</div>

                  {
                    (field.toggles ?? []).map((toggle, i) =>
                    {
                      return <div key={ i } className={ styles.additionalLabel }>{ toggle.label }</div>;
                    })
                  }
                </div>

                <div className={ styles.option }>
                  <Input
                    inputRef = { this.inputRef }
                    valid={ field.valid }
                    defaultValue={ value }
                    autoFocus={ !autoFocusSelect }
                    onChange={ onInput }
                  />

                  {
                    (field.toggles ?? []).map((toggle, i) =>
                    {
                      const key = toggle.label.toLowerCase();

                      return <Toggle
                        key={ i }
                        // eslint-disable-next-line security/detect-object-injection
                        value={ toggles[key] ?? toggle.value }
                        trueText={ toggle.true }
                        falseText={ toggle.false }
                        onToggle={ (value) => onToggle(value, key) }
                      />;
                    })
                  }
                </div>
              </div> : <div/>
          }

          <div className={ styles.autoCompleteContainer }>
            {
              this.state.autoCompletePossibilities.map((s, i) =>
              {
                const current = (this.state.pure ?? value)?.toString();

                return <div key={ i } className={ styles.autoComplete } onClick={ () => this.doAutoComplete(i, true) }>
                  <div className={ styles.autoCompleteProgress }>{ current }</div>
                  <div className={ styles.autoCompleteLeft }>
                    { s.substring(current?.length) }
                  </div>
                </div>;
              })
            }
          </div>

          {/* eslint-disable-next-line react/no-children-prop */}
          <Markdown className={ styles.hint } children={ field.hint }/>
        </div>

        <div className={ styles.buttons }>
          <div invalid={ (!field.valid).toString() } className={ styles.button } onClick={ this.done }>Apply</div>
          <div className={ styles.button } onClick={ unmount }>Cancel</div>
        </div>
      </div>;
    };

    return <div className={ styles.wrapper }>
      { type.endsWith('step') ? Step() : Test() }
    </div>;
  }
}

Dialogue.propTypes = {
  type: PropTypes.string.isRequired,
  title: PropTypes.string,
  step: PropTypes.object,
  referrer: PropTypes.object,
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
    display: 'grid',

    gridTemplateColumns: '100%',
    gridTemplateRows: 'auto 1fr auto',
    gridTemplateAreas: '"." "." "."',

    fontSize: '14px',
    fontFamily: 'Noto Sans',
    fontWeight: 700,

    backgroundColor: colors.whiteBackground,

    width: '100%',
    height: '100%',
    maxWidth: '350px',
    maxHeight: '500px',

    overflow: 'hidden',
    borderRadius: '5px'
  },

  title: {
    color: colors.blackText,

    fontSize: '11px',
    
    margin: '25px 15px'
  },

  options: {
    flexGrow: 1,

    display: 'flex',
    flexDirection: 'column',

    minHeight: '360px'
  },

  labels: {
    display: 'flex',

    color: colors.accent,

    fontSize: '11px',

    margin: '0 15px -15px 15px'
  },

  actionLabel: {
    color: colors.accent,

    fontSize: '11px',

    margin: '0 15px -15px 15px'
  },

  valueLabel: {
    flexGrow: 1,

    '[valid="false"]': {
      color: colors.red
    }
  },

  additionalLabel: {
    textAlign: 'center',

    width: '40px',
    margin: '0px 0 0 10px'
  },

  hint: {
    flexGrow: 1,

    color: opacity(colors.blackText, 0.65),

    fontWeight: 300,
    fontSize: '13px',

    overflow: 'auto',
    margin: '0 15px',

    ' *': {
      userSelect: 'text'
    },

    '::-webkit-scrollbar': {
      width: '5px',
      background: colors.whiteBackground
    },

    '::-webkit-scrollbar-thumb': {
      background: colors.accent
    },

    ' a': {
      color: colors.blue,
      textDecoration: 'none'
    },

    ' a:hover': {
      color: colors.blue,
      textDecoration: 'underline'
    },

    ' a:visited': {
      color: colors.blue
    }
  },

  option: {
    display: 'flex',
    margin: '15px'
  },

  autoCompleteContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    
    margin: '0 15px'
  },

  autoComplete: {
    cursor: 'pointer',

    display: 'flex',
    width: 'auto',

    fontSize: '11px',
    textTransform: 'uppercase',

    margin: '0 15px 5px 0'
  },

  autoCompleteProgress: {
    whiteSpace: 'pre-wrap',
    color: colors.blackText
  },

  autoCompleteLeft: {
    whiteSpace: 'pre-wrap',
    color: colors.accent
  },
  
  buttons: {
    display: 'flex'
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