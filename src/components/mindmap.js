/* eslint-disable security/detect-object-injection */

import React from 'react';
import ReactDOM from 'react-dom';

import { createStyle } from 'flcss';

import { serializeStep } from 'might-core';

import getTheme from '../colors.js';

import TopBar from './topBar.js';
import Minimap from './minimap.js';

import ContextMenu from './contextMenu.js';

import Item from './item.js';

import Horizontal from './horizontal.js';
import Vertical from './vertical.js';

import Dialogue from './dialogue.js';

const colors = getTheme();

const mindMapRef = React.createRef();

/**
* @typedef { Object } FamilizedItem
* @property { { testIndex: number, stepIndex: number }[] } occurrences
* @property { string } title
* @property { boolean } root
* @property { 'remove-step' | 'remove-branch' } hover
* @property { string } action
* @property { string } value
* @property { FamilizedObject } children
*/

/**
* @typedef { Object<string, FamilizedItem> } FamilizedObject
*/

class Mindmap extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      dirty: false,

      stackIndex: undefined,

      /**
      * @type { { title: string, steps: { action: string, value: string }[] }[] }
      */
      data: [],

      /**
      * @type { FamilizedObject }
      */
      familizedData: {}
    };

    /**
    * @type { { data: Array, familizedData: {} }[] }
    */
    this.changeStack = [ {
      data: [],
      familizedData: {}
    } ];

    this.onKeyDown = this.onKeyDown.bind(this);

    this.onFileSave = this.onFileSave.bind(this);
    this.onFileLoad = this.onFileLoad.bind(this);

    this.onUndo = this.onUndo.bind(this);
    this.onRedo = this.onRedo.bind(this);

    this.onContextMenu = this.onContextMenu.bind(this);

    this.addStepAfter = this.addStepAfter.bind(this);
    this.addNewStep = this.addNewStep.bind(this);

    this.deleteStep = this.deleteStep.bind(this);
    this.editStep = this.editStep.bind(this);
  }

  componentDidMount()
  {
    const miniMapWidth = 260;
    const miniMapHeight = 157;

    const mapWidth = miniMapWidth * 10 -  window.innerWidth;
    const mapHeight = miniMapHeight * 10 -  window.innerHeight;

    // scroll to center of the map on start
    mindMapRef.current.parentElement.scrollTo({
      left: mapWidth / 2,
      top: mapHeight / 2,
      behavior: 'auto'
    });

    document.body.addEventListener('keydown', this.onKeyDown);

    // REMOVE (for testing purposes)
    // this.loadMap(JSON.parse('{"data":[{"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"type","value":"Hello World"}]}]}').data, true);
  }

  componentWillUnmount()
  {
    document.body.removeEventListener('keydown', this.onKeyDown);
  }

  /**
  * @param { KeyboardEvent } e
  */
  onKeyDown(e)
  {
    if (e.ctrlKey && e.key.toLowerCase() === 's')
    {
      e.preventDefault();

      this.onFileSave();
    }

    if (e.ctrlKey && e.key.toLowerCase() === 'o')
    {
      e.preventDefault();

      this.onFileLoad();
    }

    if (e.ctrlKey && e.key.toLowerCase() === 'z')
      this.onUndo();

    if (e.ctrlKey && e.key.toLowerCase() === 'y')
      this.onRedo();
  }

  onFileSave()
  {
    const content = JSON.stringify({ data: this.state.data });
    
    // shows the user the pick file dialogue
    window.chooseFileSystemEntries({
      type: 'save-file',
      accepts: [ {
        description: 'Might Map File (.json)',
        extensions: [ 'json' ],
        mimeTypes: [ 'application/json' ]
      } ]
    })
      // get a writeable stream
      .then((fileHandle) => fileHandle.createWritable())
      // add data to the stream
      .then((writable) =>
      {
        writable.write(content);
      
        return writable;
      })
      // close the stream (writes the data to disk)
      .then((writable) => writable.close())
      // set dirty state
      .then(() => this.setState({ dirty: false }))
      .catch((err) => console.error(err));
  }

  onFileLoad()
  {
    // shows the user the pick file dialogue
    window.chooseFileSystemEntries({
      type: 'open-file',
      multiple: false,
      accepts: [ {
        description: 'Might Map File (.json)',
        extensions: [ 'json' ],
        mimeTypes: [ 'application/json' ]
      } ]
    })
      // get a readable stream
      .then((fileHandle) => fileHandle.getFile())
      // get some readable text from the stream
      .then((file) => file.text())
      .then((content) =>
      {
        // parse the text
        const json = JSON.parse(content);

        // load the data
        this.loadMap(json.data, true);
      })
      .catch((err) => console.error(err));
  }

  onUndo()
  {
    let { stackIndex } = this.state;

    if (stackIndex === undefined)
      stackIndex = this.changeStack.length - 1;
    
    // already at the oldest change in the stack
    if (stackIndex - 1 <= -1)
      return;

    // move through the stack by 1 change
    stackIndex = stackIndex - 1;

    this.setState({
      stackIndex,
      dirty: true,
      data: this.changeStack[stackIndex].data,
      familizedData: this.changeStack[stackIndex].familizedData
    });
  }

  onRedo()
  {
    let { stackIndex } = this.state;

    if (stackIndex === undefined)
      stackIndex = this.changeStack.length - 1;
    
    // already at the newest change in the stack
    if (stackIndex + 1 >= this.changeStack.length)
      return;
    
    // move through the stack by 1 change
    stackIndex = stackIndex + 1;

    this.setState({
      stackIndex,
      dirty: true,
      data: this.changeStack[stackIndex].data,
      familizedData: this.changeStack[stackIndex].familizedData
    });
  }

  /**
  * @param { { title: string, steps: { action: string, value: string }[] }[] } data
  * @param { boolean } file
  */
  loadMap(data, file)
  {
    const ids = [];

    // filtering duplicate tests
    for (let i = 0; i < data.length; i++)
    {
      const test = data[i];

      const id = JSON.stringify(test.steps);
      
      if (ids.includes(id))
      {
        // remove the test from the data
        data.splice(i, 1);

        // lower the index to adopt to
        // the fact that an item was removed
        i = i - 1;
      }
      else
      {
        // push the id to the array
        ids.push(id);
      }
    }

    /**
    * @type { FamilizedObject }
    */
    const familizedData = {};

    // for each test in map
    data.forEach((test, testIndex) =>
    {
      /**
      * @type { FamilizedObject }
      */
      let parent;

      // for step in test
      test.steps.forEach((step, stepIndex) =>
      {
        const key = serializeStep(step);

        // titles are passed to items that are the last in their branches only
        // because that item the only item that renders the title
        const title = (stepIndex === test.steps.length - 1) ? test.title : undefined;

        // if the step is the first in the test
        if (stepIndex === 0)
        {
          // we use the serialized step string as an identifier
          // to catch duplicated steps

          // if step is not a duplicate
          // create a new entry for it

          // however if a step is a duplicate
          // we should push new occurrence to the array

          if (familizedData[key] === undefined)
          {
            familizedData[key] = {
              // root items should never get a title
              // that's why its not defined here
              root: true,
              occurrences: [ { testIndex, stepIndex } ],
              ...step
            };
          }
          else
          {
            familizedData[key].occurrences.push({ testIndex, stepIndex });
          }

          // set this step as the new parent
          // going forward in a path until the last step in the test
          parent = familizedData[key];
        }
        else
        {
          if (!parent.children)
            parent.children = {};

          const obj = parent.children;

          if (obj[key] === undefined)
          {
            obj[key] = {
              title,
              occurrences: [ { testIndex, stepIndex } ],
              ...step
            };
          }
          else
          {
            if (!obj[key].title && title)
              obj[key].title = title;
            
            obj[key].occurrences.push({ testIndex, stepIndex });
          }

          parent = obj[key];
        }
      });
    });

    // if loaded form a file
    if (file)
    {
      // the change stack array should to emptied
      // the first stack should be set to the initial state of the loaded file
      // meaning it will replace the default empty stack
      // else the fist stack always is empty
      this.changeStack.splice(0);
    }

    // record the change
    this.recordChange(data, familizedData);

    this.setState({
      data,
      familizedData,
      stackIndex: undefined,
      dirty: (file) ? false : true
    });
  }

  /**
  * @param { Array } data
  * @param { {} } data
  */
  recordChange(data, familizedData)
  {
    const { stackIndex } = this.state;

    // if the current stack was changed by undo/redo
    // then remove any unused stacks
    // is the common practice in most applications that offer
    // this function
    if (stackIndex !== undefined)
      this.changeStack.splice(stackIndex + 1);

    // push the new data to the stack

    this.changeStack.push({ data: [ ...data ], familizedData: { ...familizedData } });
  }

  /**
  * @param { React.SyntheticEvent } e
  */
  onContextMenu(e)
  {
    // prevent the native browser context menu from showing
    e.preventDefault();

    // mount the context menu
    ReactDOM.render(<ContextMenu
      x={ e.nativeEvent.pageX }
      y={ e.nativeEvent.pageY }
      actions={ [ { title: 'Add', actions: [ { title: 'Step', callback: this.addNewStep } ] } ] }
    />, document.querySelector('#contextMenu'));
  }

  /**
  * @param { { testIndex: number, stepIndex: number }[] } occurrences
  */
  markTest(occurrences)
  {
    const data = this.state.data;

    const done = (action, value) =>
    {
      // copy test
      const test = { ...data[occurrences[0].testIndex] };

      // set the title for the test
      test.title = value || 'Untitled Test';

      // slice the steps to remove the unneeded ones
      test.steps = test.steps.slice(0, occurrences[0].stepIndex + 1);

      // push new test
      data.push(test);

      // re-create the mindmap with the new data
      this.loadMap(data);
    };

    // open dialog to edit the test title
    ReactDOM.render(<Dialogue type={ 'edit-test' } title={ 'Untitled Test' } done={ done }/>, document.querySelector('#dialogue'));
  }

  /**
  * @param { { testIndex: number, stepIndex: number }[] } occurrences
  */
  unmarkTest(occurrences)
  {
    const data = this.state.data;

    // delete all occurrences where the step is
    // the last one in its branch

    occurrences.forEach((occurrence) =>
    {
      const { testIndex, stepIndex } = occurrence;

      if (data[testIndex].steps.length === stepIndex + 1)
        delete data[testIndex];
    });

    // re-create the mindmap with the new data
    this.loadMap(data);
  }

  /**
  * @param { { testIndex: number, stepIndex: number }[] } occurrences
  * @param { 'new' | 'insert' } mode
  */
  addStepAfter(occurrences, mode)
  {
    const data = this.state.data;

    const step = { action: 'type', value: 'New Step' };
    
    // emits when the step edit dialogue is done
    const done = (action, value) =>
    {
      if (action !== undefined)
        step.action = action;

      if (value !== undefined)
        step.value = value;
        
      if (mode === 'new')
      {
        // copy test
        const test = { ...data[occurrences[0].testIndex] };

        // set a new empty title for the test
        test.title = 'Untitled Test';

        // slice the steps to remove the unneeded ones
        test.steps = test.steps.slice(0, occurrences[0].stepIndex + 1);

        // push new step
        test.steps.push(step);

        // push new test
        data.push(test);
      }
      else
      {
        // insert in every occurrence
        occurrences.forEach((occurrence) =>
        {
          // get test
          const test = data[occurrence.testIndex];

          // split the steps from current stepIndex
          const steps1 = test.steps.slice(0, occurrence.stepIndex + 1);
          const steps2 = test.steps.slice(occurrence.stepIndex + 1);

          // push new step in between

          steps1.push(step);

          test.steps = steps1.concat(steps2);
        });
      }

      // re-create the mindmap with the new data
      this.loadMap(data);
    };

    // open dialog to edit the new step
    ReactDOM.render(<Dialogue type={ 'edit-step' } step={ step } done={ done }/>, document.querySelector('#dialogue'));
  }

  addNewStep()
  {
    const data = this.state.data;

    const step = { action: 'type', value: 'New Step' };

    // emits when the step edit dialogue is done
    const done = (action, value) =>
    {
      if (action !== undefined)
        step.action = action;

      if (value !== undefined)
        step.value = value;

      const test = {
        title: 'Untitled Test',
        steps: [
          step
        ]
      };

      // push new test
      data.push(test);

      // re-create the mindmap with the new data
      this.loadMap(data);
    };

    ReactDOM.render(<Dialogue type={ 'edit-step' } step={ step } done={ done }/>, document.querySelector('#dialogue'));
  }

  /**
  * @param { { testIndex: number, stepIndex: number }[] } occurrences
  */
  editStep(occurrences)
  {
    const data = this.state.data;

    const done = (action, value) =>
    {
      // edit each occurrence of the required step
      occurrences.forEach((occurrence) =>
      {
        const step = data[occurrence.testIndex].steps[occurrence.stepIndex];

        if (action !== undefined)
          step.action = action;

        if (value !== undefined)
          step.value = value;
      });

      // re-create the mindmap with the new data
      this.loadMap(data);
    };

    const occurrence = occurrences[0];

    const step = data[occurrence.testIndex].steps[occurrence.stepIndex];

    ReactDOM.render(<Dialogue type={ 'edit-step' } step={ step } done={ done }/>, document.querySelector('#dialogue'));
  }

  /**
  * @param { number } testIndex
  */
  editTitle(testIndex)
  {
    const data = this.state.data;

    const done = (action, value) =>
    {
      // validate title
      if (typeof value === 'string' && value.length > 0)
        data[testIndex].title = value;

      // re-create the mindmap with the new data
      this.loadMap(data);
    };
    
    // open a dialogue that edits just the title
    ReactDOM.render(<Dialogue type={ 'edit-test' } title={ data[testIndex].title } done={ done }/>, document.querySelector('#dialogue'));
  }

  /**
  * @param { { testIndex: number, stepIndex: number }[] } occurrences
  * @param { 'this' | 'branch' } mode
  */
  deleteStep(occurrences, mode)
  {
    const data = this.state.data;

    // removes each occurrence of the required step
    occurrences.forEach((occurrence) =>
    {
      /**
      * @type { Array }
      */
      const steps = data[occurrence.testIndex].steps;

      // there's two ways to delete items
  
      // delete the item and any other items branched from it
      if (mode === 'branch')
      {
        // delete the step and all of its children
        steps.splice(occurrence.stepIndex);
      }
      // delete just the item and leave its children in place
      else
      {
        // delete just the step it self
        // leaving its children as is
        steps.splice(occurrence.stepIndex, 1);
      }
    });

    // re-create the mindmap with the new data
    this.loadMap(data);
  }
 
  render()
  {
    /**
    * @param { string[] } children
    * @param { number } index
    * @param { FamilizedItem } item
    * @param { 'mini' | 'full' } mode
    * @param { string } highlight
    */
    const handlePreLines = (children, index, item, mode, highlight) =>
    {
      // if parent had no children
      // or if only has one child (then the parent will connect
      // with that child using a post-line only)
      if (!children)
        return <div/>;

      // first child lines are reversed in direction
      return <div className={ (index === 0) ? styles.lines : styles.lines }>

        {
          // if there's only one child then not show any vertical lines
          (children.length > 1) ?
            // first line should be rotated upside down (reversed)
            // first and last child get half vertical lines
            // all other children get full vertical lines
            <Vertical reverse={ index === 0 } half={ index === 0 || index === children.length - 1 } highlight={ highlight }/> :
            <div/>
        }

        <Horizontal mode={ mode } highlight={ highlight }/>
      </div>;
    };

    /**
    * @param { string[] } children
    * @param { 'mini' | 'full' } mode
    * @param { string } highlight
    */
    const handlePostLines = (children, mode, highlight) =>
    {
      // post lines are only drawn to connect to the pre-lines of the next step in the map
      // that means that there need to be pre-lines
      if (!children || children.length <= 1)
        return <div/>;

      return <Horizontal mode={ mode } highlight={ highlight }/>;
    };

    // using the familized data
    // we render the steps in order
    // with parent and children (nesting)

    // this always for better UX since no repeated steps are rendered
    // and the user can add new tests where-ever they need them without needing
    // to copy steps from previous tests

    /**
    * @param { FamilizedObject } children
    * @param { 'mini' | 'full' } mode
    * @param { string } hover
    */
    const handleItems = (children, mode, hover) =>
    {
      // nothing to be rendered
      if (!children)
        return <div/>;

      const keys = Object.keys(children);

      return <div className={ styles.column }>
        {
          keys.map((step, index) =>
          {
            const item = children[step];

            let highlight, postLinesHighlight, preLinesHighlight;

            if (hover === 'remove-branch')
            {
              highlight = 'remove';
              preLinesHighlight = 'remove';
            }
            else if (item.hover === 'new-step' || item.hover === 'insert-step')
            {
              highlight = 'add';
              preLinesHighlight = 'add';
            }
            else if (item.hover === 'parent-new-step')
            {
              postLinesHighlight = 'add';
            }
            else if (item.hover === 'remove-branch')
            {
              highlight = 'remove';
              postLinesHighlight = 'remove';
            }
            else if (item.hover === 'remove-step')
            {
              highlight = 'remove';
            }
            else
            {
              highlight = item.hover;
            }

            return <div key={ index } className={ styles.row }>

              {/*
                A root item is the first item in a branch
                therefore it has no previous items connected to it
                and does not need any pre-lines
              */}
              {
                (!item.root) ? handlePreLines(keys, index, item, mode, preLinesHighlight) : undefined
              }

              <Item mindmap={ this } mode={ mode } content={ step } highlight={ highlight } item={ item }/>

              { handlePostLines(Object.keys(item.children || {}), mode, postLinesHighlight) }

              { handleItems(item.children, mode, hover || item.hover) }
            </div>;
          })
        }
      </div>;
    };

    const stackIndex = (this.state.stackIndex !== undefined) ? this.state.stackIndex : this.changeStack.length - 1;

    const undo = (stackIndex - 1 > -1);
    const redo = (stackIndex + 1 < this.changeStack.length);

    return <div ref={ mindMapRef } className={ styles.wrapper }>

      <TopBar
        dirty={ this.state.dirty }
        stack={ { undo, redo } }
        onFileSave={ this.onFileSave }
        onFileLoad={ this.onFileLoad }
        onUndo={ this.onUndo }
        onRedo={ this.onRedo }
      />

      {/* Mini-map */}
      <Minimap mindMapRef={ mindMapRef } onContextMenu={ this.onContextMenu }>
        { handleItems(this.state.familizedData, 'mini', false) }
      </Minimap>

      {/* Full-map */}
      <div className={ styles.container } onContextMenu={ this.onContextMenu }>
        { handleItems(this.state.familizedData, 'full', false) }
      </div>

    </div>;
  }
}

const styles = createStyle({
  wrapper: {
    backgroundColor: colors.whiteBackground,

    width: 'calc(260px * 10)',
    height: 'calc(157px * 10)'
  },

  container: {
    display: 'flex',

    justifyContent: 'center',
    alignItems: 'center',

    fontFamily: 'Noto Sans',
    fontWeight: 700,

    width: '100%',
    height: '100%'
  },

  row: {
    display: 'flex',
    flexDirection: 'row'
  },

  column: {
    display: 'flex',
    flexDirection: 'column',

    alignItems: 'flex-start'
  },

  lines: {
    display: 'flex'
  }
});

export default Mindmap;
