/* eslint-disable security/detect-object-injection */

import React from 'react';
import ReactDOM from 'react-dom';

import { createStyle } from 'flcss';

// import { saveAs } from 'file-saver';

import getTheme from '../colors.js';

import TopBar from './topBar.js';
import Minimap from './minimap.js';

import ContextMenu from './contextMenu.js';

import Item from './item.js';

import Horizontal from './horizontal.js';
import Vertical from './vertical.js';

const colors = getTheme();

const mindMapRef = React.createRef();

/**
* @typedef { Object } FamilizedItem
* @property { number } testIndex
* @property { number } stepIndex
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
      /**
      * @type { Array }
      */
      data: undefined,

      /**
      * @type { FamilizedObject }
      */
      familizedData: undefined
    };

    this.onFileSave = this.onFileSave.bind(this);
    this.onFileLoad = this.onFileLoad.bind(this);

    this.onContextMenu = this.onContextMenu.bind(this);

    this.addStepAt = this.addStepAt.bind(this);
    this.addNewStep = this.addNewStep.bind(this);

    this.deleteStep = this.deleteStep.bind(this);
    this.editStep = this.editStep.bind(this);
  }

  componentDidMount()
  {
    const maxWidth = 260;
    const maxHeight = 157;

    const minWidth = 180;
    const minHeight = 104;

    const miniMapWidth = Math.min(maxWidth, Math.max(window.innerWidth * 0.25, minWidth));
    const miniMapHeight = Math.min(maxHeight, Math.max(window.innerWidth * 0.15, minHeight));

    const mapWidth = miniMapWidth * 10 -  window.innerWidth;
    const mapHeight = miniMapHeight * 10 -  window.innerHeight;

    // scroll to center of the map on start
    mindMapRef.current.parentElement.scrollTo({
      left: mapWidth / 2,
      top: mapHeight / 2,
      behavior: 'auto'
    });

    // REMOVE (test group)
    this.loadMap(JSON.parse('{"data":[{"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"type","value":"Hello World fj33j hfh3j jh3jhfj3jhfjh3jhfj3jhf jh3jhfj3jhf jh3jhfj3jhf jh3jhfj3jhf"}]}]}').data);

    // REMOVE (test group 2)
    // this.loadMap(JSON.parse('{"data":[{"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"type","value":"Hello World"}]}, {"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"type","value":"Hello Mars fkkf ekke kfke fke"}]}]}').data);

    // REMOVE (test group 3)
    // this.loadMap(JSON.parse('{"data":[{"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"type","value":"Hello World"}]},{"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"type","value":"Hello World"},{"action":"click"}]}]}').data);

    // REMOVE (one group)
    // this.loadMap(JSON.parse('{"data":[{"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello World"}]},{"title":"test search-bar input 4","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello Mars"}]},{"title":"test search-bar input 5","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"click"}]}]}').data);

    // REMOVE (one group 2)
    // this.loadMap(JSON.parse('{"data":[{"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello World"}]},{"title":"test search-bar input 4","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello Mars"}]},{"title":"test search-bar input 4.5","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello Mars"},{"action":"click"}]},{"title":"test search-bar input 5","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"click"}]}]}').data);

    // REMOVE (three group)
    // this.loadMap(JSON.parse('{"data":[{"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello World"}]},{"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello World"},{"action":"click"}]},{"title":"test search-bar input 2","steps":[{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello World"}]},{"title":"test search-bar input 3","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-button"},{"action":"click"}]},{"title":"test search-bar input 4","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello Mars"}]},{"title":"test search-bar input 5","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"click"}]}]}').data);
  }

  /**
  * @param { React.SyntheticEvent } e
  */
  onFileSave()
  {
    // TODO
    // const blob = new Blob([ '{ "a": "b" }' ], { type: 'application/json;charset=utf-8' });

    // saveAs(blob, 'might.gui.json');
  }

  /**
  * @param { React.SyntheticEvent } e
  */
  onFileLoad(e)
  {
    /**
    * @type { File }
    */
    function readJSON(file)
    {
      return new Promise((resolve, reject) =>
      {
        const fr = new FileReader();

        fr.onerror = () => reject(fr.error);
        fr.onload = () => resolve(JSON.parse(fr.result));

        fr.readAsText(file, 'utf8');
      });
    }

    /**
    * @type { FileList }
    */
    const files = e.target.files;

    readJSON(files[0]).then((file) => this.loadMap(file.data));
  }

  serializeStep(step)
  {
    if (step.action === 'wait')
      return `Wait ${step.value}s`;
    else if (step.action === 'select')
      return `Select ${step.value}`;
    else if (step.action === 'click')
      return 'Click';
    else if (step.action === 'type')
      return `Type ${step.value}`;
  }

  /**
  * @param { { title: string, steps: { action: string, value: string }[] }[] } data
  */
  loadMap(data)
  {
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
        const key = this.serializeStep(step);

        const title = (stepIndex == test.steps.length - 1) ? test.title : undefined;

        // if the step is the first in the test
        if (stepIndex === 0)
        {
          // we use the serialized step string as an identifier
          // to catch repeated steps
          if (familizedData[key] === undefined)
            familizedData[key] = {
              title,
              testIndex,
              stepIndex,
              ...step
            };

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
            obj[key] = {
              title,
              testIndex,
              stepIndex,
              ...step
            };

          parent = obj[key];
        }
      });
    });

    this.setState({
      data,
      familizedData
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
      actions={ [ { title: 'New', callback: this.addNewStep } ] }
    />, document.querySelector('#contextMenu'));
  }

  /**
  * @param { number } testIndex
  * @param { number } stepIndex
  */
  addStepAt(testIndex, stepIndex)
  {
    // TODO
  }

  addNewStep()
  {
    // TODO add new step with stepIndex of "0" and a new testIndex
  }

  /**
  * @param { number } testIndex
  * @param { number } stepIndex
  */
  editStep(testIndex, stepIndex)
  {
    // TODO
  }

  /**
  * @param { number } testIndex
  * @param { number } stepIndex
  */
  deleteStep(testIndex, stepIndex)
  {
    // TODO
  }
 
  render()
  {
    /**
    * @param { string[] } children
    * @param { number } index
    * @param { string } title
    * @param { 'mini' | 'full' } mode
    */
    const handlePreLines = (children, index, title, mode) =>
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
            <Vertical reverse={ index === 0 } half={ index === 0 || index === children.length - 1 } mode={ mode }/> :
            <div/>
        }

        <Horizontal mode={ mode } title={ title }/>

      </div>;
    };

    /**
    * @param { string[] } children
    * @param { 'mini' | 'full' } mode
    */
    const handlePostLines = (children, mode) =>
    {
      // post lines are only drawn to connect to the pre-lines of the next step in the map
      // that means that there need to be pre-lines
      if (!children || children.length <= 1)
        return <div/>;

      return <Horizontal mode={ mode }/>;
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
    * @param { boolean } continuation
    */
    const handleItems = (children, mode, continuation) =>
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

            return <div key={ index } className={ styles.row }>

              { (continuation) ? handlePreLines(keys, index, item.title, mode) : undefined }

              <Item mindmap={ this } mode={ mode } title={ step } testIndex={ item.testIndex } stepIndex={ item.stepIndex }/>

              { handlePostLines(Object.keys(item.children || {}), mode) }

              { handleItems(item.children, mode, true) }
            </div>;
          })
        }
      </div>;
    };

    return <div ref={ mindMapRef } className={ styles.wrapper }>

      <TopBar onFileSave={ this.onFileSave } onFileLoad={ this.onFileLoad }/>

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

    maxWidth: 'calc(260px * 10)',
    maxHeight: 'calc(157px * 10)',

    minWidth: 'calc(180px * 10)',
    minHeight: 'calc(104px * 10)',

    width: 'calc(25vw * 10)',
    height: 'calc(15vw * 10)'
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
