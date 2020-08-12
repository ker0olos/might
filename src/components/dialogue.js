import React from 'react';
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
  constructor()
  {
    super();

    this.state = {
      masterKey: 0,
      toggles: {}
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
    const { toggles, action } = this.state;

    let { value } = this.state;

    /**
    * @type { Step }
    */
    const s = {
      action: (this.state.action === undefined) ? this.props.step?.action : this.state.action,
      value: (this.state.value === undefined) ? this.props.step?.value : this.state.value
    };

    // handle how the toggles effect the end value
    if (s.action === 'viewport')
    {
      let v = s.value;

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
    if (s.action === 'drag' || s.action === 'swipe')
    {
      value = s.value.split(',').map(s => s.trim());
    }

    // trim value if it's a string
    if (value?.trim)
      value = value.trim();
    
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
      let defaultAction = 0;

      /**
      * @type { Step }
      */
      const s = {
        action: (this.state.action === undefined) ? step.action : this.state.action,
        value: (this.state.value === undefined) ? step.value : this.state.value
      };

      const { toggles } = this.state;

      // determine if toggles should be enabled
      // at the very start of the dialogue
      if (s.action === 'viewport')
      {
        if (toggles['touch'] === undefined && s.value.includes('t'))
          toggles['touch'] = true;

        if (toggles['full'] === undefined && s.value.includes('f'))
          toggles['full'] = true;

        s.value = s.value.replace(/t/g, '').replace(/f/g, '');
      }

      // reset value and toggles every new select
      const onSelect = (action) => this.setState({
        action,
        masterKey: this.state.masterKey + 1,
        toggles: {},
        pure: undefined,
        value: ''
      });

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
        // we need to parse the value here because
        // the runner decides what to wait for based on the value type
        if (s.action === 'wait')
          this.setState({ value: this.parseNumber(value) });
        else
          this.setState({ value, pure: value });
      };

      // set hints & validate value

      let field = {};

      if (s.action === 'wait')
      {
        const duration = (typeof s.value === 'number');

        field = {
          label: (duration) ? 'Duration' : 'Selector',
          valid: (!duration) ? this.testSelector(s.value) : true,
          hint: WaitAction
        };
      }
      else if (s.action === 'viewport')
      {
        const v = this.state.pure ?? s.value;

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
      else if (s.action === 'goto')
      {
        field = {
          valid: (s.value.length > 0),
          label: 'URL',

          hint: GotoAction
        };
      }
      else if (s.action === 'media')
      {
        const value = (this.state.pure ?? s.value).split(':');

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
      else if (s.action === 'select')
      {
        field = {
          label: 'Selector',
          valid: this.testSelector(s.value),
          hint: SelectAction
        };
      }
      else if (s.action === 'hover')
      {
        field = {
          valid: true,
          hint: HoverAction
        };
      }
      else if (s.action === 'click')
      {
        const value = this.state.pure ?? s.value;

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
      else if (s.action === 'drag')
      {
        const coordinates =
        Array.isArray(s.value) ?
          s.value :
          (this.state.pure ?? s.value).split(',');

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
      else if (s.action === 'swipe')
      {
        const coordinates =
        Array.isArray(s.value) ?
          s.value :
          (this.state.pure ?? s.value).split(',');

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
      else if (s.action === 'keyboard')
      {
        let valid = true;

        const split = (this.state.pure ?? s.value).replace('++', '+NumpadAdd').split('+');

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
      else if (s.action === 'type')
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

      // when the dialog is first opened
      // it has no action or value
      // so we use this defaults from the parent
      if (step)
        defaultAction = actions.indexOf(step.action);

      // prettify the default value of arrays
      if (Array.isArray(s.value))
        s.value = s.value.join(', ');

      return <div className={ styles.container }>
        <div className={ styles.title }>Step</div>
    
        <div className={ styles.options }>
          <div className={ styles.actionLabel }>Action</div>

          <div className={ styles.option }>
            <Select defaultIndex={ defaultAction } options={ actions } onChange={ onSelect }/>
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
                    valid={ field.valid }
                    defaultValue={ s.value }
                    autoFocus={ true }
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

          <Markdown className={ styles.hint } source={ field.hint }/>
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
    userSelect: 'none',
    
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
    userSelect: 'none',

    margin: '0 15px -15px 15px'
  },

  actionLabel: {
    color: colors.accent,

    fontSize: '11px',
    userSelect: 'none',

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