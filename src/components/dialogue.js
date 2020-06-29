import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import PropTypes, { string } from 'prop-types';

import { createStyle } from 'flcss';

import getTheme, { opacity } from '../colors.js';

import Select from './select.js';
import Input from './input.js';

const colors = getTheme();

const unmount = () => ReactDOM.unmountComponentAtNode(document.querySelector('#dialogue'));

/**
* @param { 'edit-title' | 'edit-step' | 'delete-step' } type
* @param { string } title
* @param { { action: string, value: string } } step
* @param { () => void } done
*/
const Dialogue = ({ type, title, step, done }) =>
{
  const actions = [ 'wait', 'select', 'click', 'type' ];
  
  const [ action, setAction ] = useState();
  const [ value, setValue ] = useState();

  // unmount the dialogue (cancel) by pressing escape key
  useEffect(() =>
  {
    window.addEventListener('keydown', (e) =>
    {
      if (e.key === 'Escape')
        unmount();
    });
  }, []);

  // Callbacks

  const _done = (...args) =>
  {
    if (done)
      done.call(undefined, ...args);
    
    unmount();
  };

  // Types of Dialogue

  const Title = () =>
  {
    let defaultTitle = '';

    if (title)
      defaultTitle = title;

    const onInput = (value) => setValue(value);

    return <div className={ styles.container }>
      <div className={ styles.title }>Title:</div>
    
      <div className={ styles.options }>
        <Input defaultValue={ defaultTitle } autoFocus={ true } onChange={ onInput }/>
      </div>

      <div className={ styles.buttons }>
        <div className={ styles.button } onClick={ () => _done(action, value) }>Apply</div>
        <div className={ styles.button } onClick={ unmount }>Cancel</div>
      </div>
    </div>;
  };

  const Step = () =>
  {
    let defaultAction = 0;
    let defaultValue = '';

    let suffix;
    let suffixTitle;

    if (action === 'wait')
    {
      suffix = 'S';
      suffixTitle = 'Seconds';
    }
  
    if (step)
    {
      defaultAction = actions.indexOf(step.action);
      defaultValue = step.value;

      if (!action && defaultAction === 0)
      {
        suffix = 'S';
        suffixTitle = 'Seconds';
      }
    }

    const onSelect = (action) => setAction(action);

    const onInput = (value) =>
    {
      // TODO validate the value based on the action
      // like if wait action had characters that weren't number in its value
      setValue(value);
    };

    return <div className={ styles.container }>
      <div className={ styles.title }>Action:</div>
    
      <div className={ styles.options }>
        <Select defaultIndex={ defaultAction } options={ actions } onChange={ onSelect }/>
        <Input defaultValue={ defaultValue } suffix={ { content: suffix, title: suffixTitle } } autoFocus={ true } onChange={ onInput }/>
      </div>

      <div className={ styles.buttons }>
        <div className={ styles.button } onClick={ () => _done(action, value) }>Apply</div>
        <div className={ styles.button } onClick={ unmount }>Cancel</div>
      </div>
    </div>;
  };

  const Delete = () =>
  {
    return <div className={ styles.container }>
      <div className={ styles.description }>Are you sure you want to delete that?</div>

      <div className={ styles.buttons }>
        <div className={ styles.button } onClick={ _done }>Confirm</div>
        <div className={ styles.button } onClick={ unmount }>Cancel</div>
      </div>
    </div>;
  };

  let Element;
  
  if (type === 'edit-title')
    Element = Title;
  else if (type === 'edit-step')
    Element = Step;
  else
    Element = Delete;
  
  return <div className={ styles.wrapper }>
    { Element() }
  </div>;
};

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
    userSelect: 'none',
    margin: '25px 15px 10px 15px'
  },

  description: {
    fontSize: '14px',

    userSelect: 'none',
    margin: '25px 15px 20px 15px'
  },

  options: {
    flexGrow: 1,
    minHeight: '360px',

    '> div': {
      margin: '15px'
    }
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
    }
  }
});

export default Dialogue;