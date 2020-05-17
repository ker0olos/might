/* eslint-disable security/detect-object-injection */

import React from 'react';

import { createStyle } from 'flcss';

// import { saveAs } from 'file-saver';

import getTheme from '../colors.js';

import TopBar from '../components/topBar.js';
import Minimap from '../components/minimap.js';

const colors = getTheme();

const mindMapRef = React.createRef();

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
      * @type { Array }
      */
      familizedData: undefined
    };

    this.onFileSave = this.onFileSave.bind(this);
    this.onFileLoad = this.onFileLoad.bind(this);
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
    // this.loadMap(JSON.parse('{"data":[{"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"type","value":"Hello World"}]}]}').data);

    // REMOVE (test group 2)
    // this.loadMap(JSON.parse('{"data":[{"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"type","value":"Hello World"}]}, {"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"type","value":"Hello Mars fkkf ekke kfke fke"}]}]}').data);

    // REMOVE (test group 3)
    // this.loadMap(JSON.parse('{"data":[{"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"type","value":"Hello World"}]},{"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"type","value":"Hello World"},{"action":"click"}]}]}').data);

    // REMOVE (one group)
    // this.loadMap(JSON.parse('{"data":[{"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello World"}]},{"title":"test search-bar input 4","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello Mars"}]},{"title":"test search-bar input 5","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"click"}]}]}').data);
    
    // REMOVE (one group 2)
    // this.loadMap(JSON.parse('{"data":[{"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello World"}]},{"title":"test search-bar input 4","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello Mars"}]},{"title":"test search-bar input 4.5","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello Mars"},{"action":"click"}]},{"title":"test search-bar input 5","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"click"}]}]}').data);

    // REMOVE (three group)
    this.loadMap(JSON.parse('{"data":[{"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello World"}]},{"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello World"},{"action":"click"}]},{"title":"test search-bar input 2","steps":[{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello World"}]},{"title":"test search-bar input 3","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-button"},{"action":"click"}]},{"title":"test search-bar input 4","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello Mars"}]},{"title":"test search-bar input 5","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"click"}]}]}').data);
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
    const familizedData = {};

    // for each test in map
    data.forEach((test, testIndex) =>
    {
      let parent;

      // for step in test
      test.steps.forEach((step, stepIndex) =>
      {
        const key = this.serializeStep(step);

        // if the step is the first in the test
        if (stepIndex === 0)
        {
          // we use the serialized step string as an identifier
          // to catch repeated steps
          if (familizedData[key] === undefined)
            familizedData[key] = {
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

  render()
  {
    const handlePreLines = (children, index, title) =>
    {
      // if parent had no children
      // or if only has one child (then the parent will connect
      // with that child using a post-line only)
      if (!children)
        return <div/>;
        
      {/* first child lines are reversed in direction */}
      return <div className={ (index === 0) ? styles.reverseLines : styles.lines }>

        {
          // if there's only one child then not show any vertical lines
          (children.length > 1) ?
            // first and last child get half vertical lines
            // all other children get full vertical lines
            (index > 0 && index < children.length - 1)
              ?
              <div className={ styles.vertical }/> :
              <div className={ styles.halfVertical }/> :
            <div/>
        }
          
        <div className={ styles.horizontal }>
          <div title={ title } className={ styles.title }>{ title }</div>
        </div>

      </div>;
    };

    const handlePostLines = (children) =>
    {
      // post lines are only drawn to connect to the pre-lines of the next step in the map
      // that means that there need to be pre-lines
      if (!children || children.length <= 1)
        return <div/>;

      return <div className={ styles.horizontal }/>;
    };

    // using the familized data
    // we render the steps in order
    // with parent and children (nesting)

    // this always for better UX since no repeated steps are rendered
    // and the user can add new tests where-ever they need them without needing
    // to copy steps from previous tests

    const handleItems = (children, continuation) =>
    {
      if (!children)
        return <div/>;

      const keys = Object.keys(children);

      return <div className={ styles.column }>
        {
          keys.map((k, index) =>
          {
            const item = children[k];

            let title;

            // this step is the final step in a test
            const markAsATest = this.state.data[item.testIndex].steps.length - 1 === item.stepIndex;

            if (markAsATest)
              title = this.state.data[item.testIndex].title;

            return <div key={ index } className={ (continuation) ? styles.row : styles.firstRow }>

              { (continuation) ? handlePreLines(keys, index, title) : undefined }

              <div  className={ styles.item }>
                <div className={ styles.text }>{ k }</div>
              </div>

              { handlePostLines(Object.keys(item.children || {})) }

              { handleItems(item.children, true) }
            </div>;
          })
        }
      </div>;
    };

    const a = <div ref={ mindMapRef } className={ styles.wrapper }>

      <TopBar onFileSave={ this.onFileSave } onFileLoad={ this.onFileLoad }/>

      {/* Mini-map */}
      <Minimap mindMapRef={ mindMapRef }>
        {/* TODO render the items in a mini versions */}
      </Minimap>

      {/* Full-map */}
      <div className={ styles.container }>
        { handleItems(this.state.familizedData, false) }
      </div>

    </div>;

    return a;
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

  firstRow: {
    extend: 'row',
    margin: '25px 0 !important'
  },

  column: {
    display: 'flex',
    flexDirection: 'column',

    alignItems: 'flex-start',

    '> *': {
      margin: '4px 0'
    }
  },

  item: {
    display: 'flex',
    alignItems: 'center',

    minHeight: '26px',
    maxHeight: '50px',
    width: '110px',
    height: 'fit-content',

    overflow: 'hidden',
    userSelect: 'none',

    margin: 'auto',

    borderRadius: '3px',
    border: `${colors.accent} 1px solid`
  },

  text: {
    maxHeight: '45px',
    
    overflow: 'hidden',
    textOverflow: 'ellipsis',

    fontSize: '10px',
    margin: '5px 10px'
  },

  lines: {
    display: 'flex',
    padding: '15px 0'
  },

  reverseLines: {
    extend: 'lines',
    transform: 'rotateX(180deg)',

    '> div': {
      transform: 'rotateX(180deg)'
    }
  },

  title: {
    color: colors.accent,
    fontSize: '11px',

    userSelect: 'none',
    overflow: 'hidden',

    textAlign: 'center',
    textOverflow: 'ellipsis',

    minWidth: '60px',
    maxWidth: '160px',
    width: 'auto',

    whiteSpace: 'nowrap',
    margin: '0 0 5px 0'
  },

  horizontal: {
    display: 'flex',
    alignItems: 'flex-end',

    height: 0,

    padding: '0px 30px',
    margin: 'auto',

    border: `1px ${colors.accent} solid`
  },

  vertical: {
    position: 'relative',

    top: 'calc(-5px + -15px)',
    width: 0,
    height: 'calc(100% + 8px + 30px)',

    border: `1px ${colors.accent} solid`
  },

  halfVertical: {
    extend: 'vertical',

    top: 'calc(-5px + -15px)',
    height: 'calc(50% + 4px + 15px)'
  }
});

export default Mindmap;
