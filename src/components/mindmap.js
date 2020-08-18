/* eslint-disable security/detect-object-injection */

import React from 'react';
import ReactDOM from 'react-dom';

import Dexie from 'dexie';

import { createStyle } from 'flcss';

import { stringifyStep } from 'might-core';

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
* @typedef { Object } Occurrence
* @property { number } testIndex
* @property { number } stepIndex
*/

/**
* @typedef { Object } FamilizedItem
* @property { boolean } root
* @property { string } title
* @property { number } titleTestIndex
* @property { 'parent' | 'child' | '' } groupState
* @property { 'remove-step' | 'remove-branch' } hover
* @property { string } action
* @property { string } value
* @property { Occurrence[] } occurrences
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

    this.timestamp = 0;

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

    this.db = new Dexie('database');

    this.db.version(1).stores({
      files: 'id,fileHandle'
    });

    this.onBeforeUnload = this.onBeforeUnload.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);

    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);

    this.onMouseMove = this.onMouseMove.bind(this);

    this.saveFile = this.saveFile.bind(this);
    this.loadFile = this.loadFile.bind(this);

    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);

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

    const mapWidth = miniMapWidth * 20 -  window.innerWidth;
    const mapHeight = miniMapHeight * 20 -  window.innerHeight;

    // scroll to center of the map on start
    mindMapRef.current.parentElement.scrollTo({
      left: mapWidth / 2,
      top: mapHeight / 2,
      behavior: 'auto'
    });

    window.addEventListener('beforeunload', this.onBeforeUnload);
    document.body.addEventListener('keydown', this.onKeyDown);

    // automatically load the file handle from previous session
    // if it exists
    this.loadHandle();

    // REMOVE (for testing purposes)
    // this.loadMap(JSON.parse('{"data":[{"steps":[{"action":"wait","value":0},{"action":"select","value":"body"},{"action":"click","value":"left"}]}]}').data, true);
  }

  componentWillUnmount()
  {
    window.removeEventListener('beforeunload', this.onBeforeUnload);
    document.body.removeEventListener('keydown', this.onKeyDown);
  }

  /**
  * @param { BeforeUnloadEvent } e
  */
  onBeforeUnload(e)
  {
    const { dirty } = this.state;

    const message = 'Changes you made may not be saved.';
    
    if (!dirty)
      return;
    
    e.returnValue = message;

    return message;
  }

  /**
  * @param { KeyboardEvent } e
  */
  onKeyDown(e)
  {
    if (e.ctrlKey && e.key.toLowerCase() === 's')
    {
      e.preventDefault();

      this.saveFile();
    }

    if (e.ctrlKey && e.key.toLowerCase() === 'o')
    {
      e.preventDefault();

      this.loadFile();
    }

    if (e.ctrlKey && e.key.toLowerCase() === 'z')
      this.undo();

    if (e.ctrlKey && e.key.toLowerCase() === 'y')
      this.redo();
  }

  onMouseDown()
  {
    this.down = true;
  }

  onMouseUp()
  {
    this.down = false;
    
    this.lastX = this.lastY = undefined;
  }

  onMouseLeave()
  {
    if (this.down)
      this.onMouseUp();
  }

  /**
 * @param { React.MouseEvent } e
 */
  onMouseMove(e)
  {
    if (!this.down)
      return;

    const delta = Date.now() - this.timestamp;

    // small cooldown between each call
    if (delta > 25)
    {
      this.handleMovement(e);

      this.timestamp = Date.now();
    }
  }

  /**
  * @param { React.MouseEvent } e
  */
  handleMovement(e)
  {
    const x = e.clientX;
    const y = e.clientY;

    /**
    * @type { HTMLElement }
    */
    const element = mindMapRef.current;

    if (this.lastX !== undefined && this.lastY !== undefined)
    {
      const deltaX = this.lastX - x;
      const deltaY = this.lastY - y;
      
      element.parentElement.scrollTo({
        left: element.parentElement.scrollLeft + deltaX,
        top: element.parentElement.scrollTop + deltaY
      });
    }

    this.lastX = x, this.lastY = y;
  }

  storeHandle(fileHandle)
  {
    // store the handle for the future sessions
    this.db.table('files').put({ id: 0, fileHandle });

    // store the handle for the current session
    this.fileHandle = fileHandle;

    return fileHandle;
  }

  loadHandle()
  {
    // auto-loading only works with the ntf api
    if (typeof window.chooseFileSystemEntries !== 'function')
      return;

    // get the stored file handle from a previous session
    this.db.table('files').get(0).then(({ fileHandle }) =>
    {
      // ask the user for a permission to view the file
      fileHandle.requestPermission().then((response) =>
      {
        // permission granted load the file
        if (response === 'granted')
        {
          this.fileHandle = fileHandle;

          this.loadFile(undefined, fileHandle);
        }
        // if rejected then delete the stored file handle
        else
        {
          this.db.table('files').delete(0);
        }
      });
    }).catch(() => undefined);
  }

  saveFile()
  {
    // pretty-printed json file
    const content = JSON.stringify({ data: this.state.data }, undefined, 2);
    
    // use the nfs api
    const getFromHandle = () =>
    {
      if (this.fileHandle)
        // get the saved file handle
        return Promise.resolve(this.fileHandle.createWritable())
          // add data to the stream
          .then((writable) =>
          {
            writable.write(content);
          
            // close the stream (writes the data to disk)
            return writable.close();
          });
      
      // shows the user the pick file dialogue
      return window.chooseFileSystemEntries({
        type: 'save-file',
        accepts: [ {
          description: 'Might Map File (.json)',
          extensions: [ 'json' ],
          mimeTypes: [ 'application/json' ]
        } ]
      })
        // get a writeable stream
        .then(fileHandle => this.storeHandle(fileHandle).createWritable())
        // add data to the stream
        .then((writable) =>
        {
          writable.write(content);
        
          // close the stream (writes the data to disk)
          return writable.close();
        });
    };

    // fallback for no having the nfs api enabled
    const getFromBlob = () =>
    {
      const a = document.createElement('a');

      const blob = new Blob([ content ], { type: 'text/plain' });

      a.download = 'might.map.json';

      a.href = URL.createObjectURL(blob);

      a.addEventListener('click', () =>
      {
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      });
      
      a.click();

      return Promise.resolve();
    };

    (typeof window.chooseFileSystemEntries === 'function'
      ? getFromHandle()
      : getFromBlob()
    )
      // update dirty state
      .then(() => this.setState({ dirty: false }))
      .catch(err => console.error(err));
  }

  loadFile(e, fileHandle)
  {
    // use the nfs api
    const getFromHandle = (fileHandle) =>
    {
      if (fileHandle)
        // get a readable stream from the provided file handle
        return Promise.resolve(fileHandle.getFile())
          // get some readable text from the stream
          .then(file => file.text());
      
      // shows the user the pick file dialogue
      return window.chooseFileSystemEntries({
        type: 'open-file',
        multiple: false,
        accepts: [ {
          description: 'Might Map File (.json)',
          extensions: [ 'json' ],
          mimeTypes: [ 'application/json' ]
        } ]
      })
        // get a readable stream
        .then(fileHandle => this.storeHandle(fileHandle).getFile())
        // get some readable text from the stream
        .then(file => file.text());
    };

    // fallback for no having the nfs api enabled
    const getFromBlob = () =>
    {
      return new Promise((resolve) =>
      {
        const input = document.createElement('input');

        input.type = 'file';
  
        input.multiple = false;
        input.accept = 'application/json';
  
        input.addEventListener('change', () =>
        {
          const file = input.files[0];

          const reader = new FileReader();

          reader.addEventListener('load', event => resolve(event.target.result));

          reader.readAsText(file);
        });
  
        input.click();
      });
    };

    (typeof window.chooseFileSystemEntries === 'function'
      ? getFromHandle(fileHandle)
      : getFromBlob()
    )
      .then((content) =>
      {
        // parse the text
        const json = JSON.parse(content);

        // load the data
        this.loadMap(json.data, true);
      })
      .catch(err => console.error(err));
  }

  undo()
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

  redo()
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

      const groupables = {
        click: true,
        hover: true,
        drag: true,
        type: true
      };

      // for step in test
      test.steps.forEach((step, stepIndex) =>
      {
        const key = stringifyStep(step, { pretty: true });

        let root, title, titleTestIndex, obj, groupState;
        
        // titles are passed to items that are the last step in their individual test object
        if (stepIndex === test.steps.length - 1)
        {
          title = test.title;
          titleTestIndex = testIndex;
        }

        // if the step is the first in the test
        if (stepIndex === 0)
        {
          root = true;
          obj = familizedData;
        }
        else
        {
          if (!parent.children)
            parent.children = {};

          obj = parent.children;
        }

        // steps that can start a group
        if (
          step.action === 'select' ||
          (step.action === 'wait' && typeof step.value === 'string')
        )
        {
          groupState = 'parent';
        }
        // steps that can be part of a group
        else if (groupables[step.action])
        {
          groupState = 'child';
        }

        // style will change even if the group is interrupted
        // by other actions, that's not an issue we need to fix
        // because this is just meant as a way to make the mindmap more compact

        // we use the serialized step string as an identifier
        // to catch duplicated steps

        // if step is not a duplicate
        // create a new entry for it
        if (obj[key] === undefined)
        {
          obj[key] = {
            root,

            title,
            titleTestIndex,

            groupState,

            action: step.action,
            value: step.value,

            occurrences: [ {
              testIndex,
              stepIndex
            } ]
          };
        }
        // but if a step is a duplicate
        // we should push new occurrence to the array
        else
        {
          if (
            obj[key].title === undefined &&
            title !== undefined
          )
          {
            obj[key].title = title;
            obj[key].titleTestIndex = titleTestIndex;
          }

          obj[key].occurrences.push({
            testIndex,
            stepIndex
          });
        }

        // set this step as the new parent
        // going forward in a path until the last step in the test
        parent = obj[key];
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

    this.changeStack.push({
      data: JSON.parse(JSON.stringify(data)),
      familizedData: JSON.parse(JSON.stringify(familizedData))
    });
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
  * @param { Occurrence[] } occurrences
  */
  markTest(occurrences)
  {
    const data = this.state.data;

    const done = (action, value) =>
    {
      // copy test
      const test = { ...data[occurrences[0].testIndex] };

      // set the title for the test
      test.title = value || '';

      // slice the steps to remove the unneeded ones
      test.steps = test.steps.slice(0, occurrences[0].stepIndex + 1);

      // push new test
      data.push(test);

      // re-create the mindmap with the new data
      this.loadMap(data);
    };

    // open dialog to edit the test title
    ReactDOM.render(<Dialogue type={ 'edit-test' } title={ '' } done={ done }/>, document.querySelector('#dialogue'));
  }

  /**
  * @param { Occurrence[] } occurrences
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

    // clean deleted spots
    for (let i = 0; i < data.length; i++)
    {
      if (data[i] === undefined)
      {
        // remove the test from the array
        data.splice(i, 1);

        // fix the loop after the test is removed
        i = i - 1;
      }
    }

    // re-create the mindmap with the new data
    this.loadMap(data);
  }

  /**
  * @param { Occurrence[] } occurrences
  * @param { number } children
  * @param { 'new' | 'insert' } mode
  */
  addStepAfter(occurrences, children, mode)
  {
    const data = this.state.data;

    const step = { action: 'select', value: '' };
    
    // emits when the step edit dialogue is done
    const done = (action, value) =>
    {
      if (action !== undefined)
        step.action = action;

      if (value !== undefined)
        step.value = value;
        
      if (mode === 'new')
      {
        const original = data[occurrences[0].testIndex];

        // copy test
        const test = { ...original };

        // set a new empty title for the test
        test.title = '';

        // slice the steps to remove the unneeded ones
        test.steps = test.steps.slice(0, occurrences[0].stepIndex + 1);

        // push new step
        test.steps.push(step);

        // if the original test
        // is untitled with and no children
        // then replace it with the new test instead
        if (children === 0 && !original.title)
        {
          data[occurrences[0].testIndex] = test;
        }
        // else push the new test
        else
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

    const step = { action: 'wait', value: '' };

    // emits when the step edit dialogue is done
    const done = (action, value) =>
    {
      if (action !== undefined)
        step.action = action;

      if (value !== undefined)
        step.value = value;

      const test = {
        title: '',
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
  * @param { Occurrence[] } occurrences
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
  editTest(testIndex)
  {
    const data = this.state.data;

    const done = (action, value) =>
    {
      // validate title
      if (typeof value === 'string')
        data[testIndex].title = value;

      // re-create the mindmap with the new data
      this.loadMap(data);
    };
    
    // open a dialogue that edits just the title
    ReactDOM.render(<Dialogue type={ 'edit-test' } title={ data[testIndex].title } done={ done }/>, document.querySelector('#dialogue'));
  }

  /**
  * @param { Occurrence[] } occurrences
  * @param { 'this' | 'branch' } mode
  */
  deleteStep(occurrences, mode)
  {
    const data = this.state.data;

    // removes each occurrence of the required step
    occurrences.forEach((occurrence) =>
    {
      const { title, steps } = data[occurrence.testIndex];

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

      // if all the steps of a test were removed
      // remove the test
      if (steps.length <= 0)
      {
        data.splice(occurrence.testIndex);
      }
      // if the test is untitled
      // and this is the last step in it
      // delete it if its unnecessary
      else if (occurrence.stepIndex === steps.length && !title)
      {
        /**
        * @type { FamilizedItem }
        */
        let parent = this.state.familizedData;

        // retrace steps to get to the parent of this step
        for (const step of steps)
        {
          const key = stringifyStep(step, { pretty: true });

          parent = parent[key].children;
        }

        // if there at least another one other test
        // with the same steps, then remove this one
        if (Object.keys(parent).length > 1)
          data.splice(occurrence.testIndex);
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
    * @param { boolean } group
    */
    const handlePreLines = (children, index, item, mode, highlight, group) =>
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

        <Horizontal mode={ mode } highlight={ highlight } group={ group }/>
      </div>;
    };

    /**
    * @param { string[] } children
    * @param { 'mini' | 'full' } mode
    * @param { string } highlight
    * @param { boolean } group
    */
    const handlePostLines = (children, mode, highlight, group) =>
    {
      // post lines are only drawn to connect to the pre-lines of the next step in the map
      // that means that there need to be pre-lines
      if (!children || children.length <= 1)
        return <div/>;

      return <Horizontal mode={ mode } highlight={ highlight } group={ group }/>;
    };

    // using the familized data
    // we render the steps in order
    // with parent and children (nesting)

    // this always for better UX since no repeated steps are rendered
    // and the user can add new tests where-ever they need them without needing
    // to copy steps from previous tests

    const handleHover = (hover) =>
    {
      let carried, highlight, postLinesHighlight, preLinesHighlight;

      if (hover === 'remove-branch')
      {
        highlight = 'remove';
        postLinesHighlight = 'remove';
        carried = 'remove-branch-carried';
      }
      else if (hover === 'remove-branch-carried')
      {
        highlight = 'remove';
        preLinesHighlight = 'remove';
        carried = 'remove-branch-carried';
      }
      else if (hover === 'new-step' || hover === 'insert-step')
      {
        highlight = 'add';
        preLinesHighlight = 'add';
      }
      else if (hover === 'parent-new-step')
      {
        postLinesHighlight = 'add';
      }
      else if (hover === 'remove-step')
      {
        highlight = 'remove';
      }
      else
      {
        highlight = hover;
      }

      return {
        carried,
        highlight,
        preLinesHighlight,
        postLinesHighlight
      };
    };

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

            const {
              carried, highlight,
              postLinesHighlight, preLinesHighlight
            } = handleHover(hover || item.hover);

            let preGroup = false;
            let postGroup = false;

            if (item.groupState === 'parent')
            {
              postGroup = true;
            }
            else if (item.groupState === 'child')
            {
              preGroup = true;
              postGroup = true;
            }

            return <div key={ index } className={ styles.row }>

              {
              // A root item is the first item in a branch
              // therefore it has no previous items connected to it
              // and does not need any pre-lines
              }
              {
                (!item.root) ? handlePreLines(keys, index, item, mode, preLinesHighlight, preGroup) : undefined
              }

              <div className={ styles.column }>
                <Item mindmap={ this } mode={ mode } content={ step } highlight={ highlight } item={ item }/>
              </div>

              {
                handlePostLines(Object.keys(item.children || {}), mode, postLinesHighlight, postGroup)
              }

              { handleItems(item.children, mode, carried) }
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
        onFileSave={ this.saveFile }
        onFileLoad={ this.loadFile }
        onUndo={ this.undo }
        onRedo={ this.redo }
      />

      {/* Mini-map */}
      <Minimap mindMapRef={ mindMapRef } onContextMenu={ this.onContextMenu }>
        { handleItems(this.state.familizedData, 'mini', false) }
      </Minimap>

      {/* Full-map */}
      <div
        className={ styles.container }

        onMouseUp={ this.onMouseUp }
        onMouseLeave={ this.onMouseLeave }
        onMouseDown={ this.onMouseDown }

        onMouseMove={ this.onMouseMove }
        
        onContextMenu={ this.onContextMenu }
      >
        { handleItems(this.state.familizedData, 'full', false) }
      </div>

    </div>;
  }
}

const styles = createStyle({
  wrapper: {
    backgroundColor: colors.whiteBackground,

    width: 'calc(260px * 20)',
    height: 'calc(157px * 20)'
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
