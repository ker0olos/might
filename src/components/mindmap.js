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
      data: {},
      familizedData: {}
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

    // REMOVE (one group)
    // this.loadMap(JSON.parse('{"data":[{"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello World"}]},{"title":"test search-bar input 4","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello Mars"}]},{"title":"test search-bar input 5","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"click"}]}]}').data);
    
    // REMOVE (one group 2)
    // this.loadMap(JSON.parse('{"data":[{"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello World"}]},{"title":"test search-bar input 4","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello Mars"}]},{"title":"test search-bar input 4.5","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello Mars"},{"action":"click"}]},{"title":"test search-bar input 5","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"click"}]}]}').data);

    // REMOVE (three group)
    this.loadMap(JSON.parse('{"data":[{"title":"test search-bar input 1","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello World"}]},{"title":"test search-bar input 2","steps":[{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello World"}]},{"title":"test search-bar input 3","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-button"},{"action":"click"}]},{"title":"test search-bar input 4","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"type","value":"Hello Mars"}]},{"title":"test search-bar input 5","steps":[{"action":"wait","value":2},{"action":"select","value":"input.js-search-input"},{"action":"click"}]}]}').data);
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

    data.forEach((test, testIndex) =>
    {
      let parent;

      test.steps.forEach((step, stepIndex) =>
      {
        const key = this.serializeStep(step);

        if (stepIndex === 0)
        {
          if (familizedData[key] == undefined)
            familizedData[key] = {
              testIndex,
              stepIndex,
              ...step
            };

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
    const handlePreLines = (children, index) =>
    {
      if (!children || children.length <= 1)
        return <div/>;

      return <div className={ (index === 0) ? styles.reverseLines : styles.lines }>

        { (index > 0 && index < children.length - 1) ? <div className={ styles.vertical }/> : <div className={ styles.halfVertical }/> }
        
        <div className={ styles.horizontal }/>

      </div>;
    };
    
    const handlePostLines = (children) =>
    {
      if (!children)
        return <div/>;

      return <div className={ styles.horizontal }/>;
    };

    const handleItems = (children, continuation) =>
    {
      if (!children)
        return <div/>;

      const keys = Object.keys(children);

      return <div className={ styles.column }>
        {
          keys.map((k, index) =>
          {
            return <div key={ index } className={ (continuation) ? styles.row : styles.firstRow }>

              { (continuation) ? handlePreLines(keys, index) : undefined }

              <div  className={ styles.item }>
                <div className={ styles.text }>{ k }</div>
              </div>

              { handlePostLines(children[k].children) }

              { handleItems(children[k].children, true) }
            </div>;
          })
        }
      </div>;
    };

    const a = <div ref={ mindMapRef } className={ styles.wrapper }>

      <TopBar onFileSave={ this.onFileSave } onFileLoad={ this.onFileLoad }/>

      <Minimap mindMapRef={ mindMapRef }>
        {/* TODO ._. */}
      </Minimap>

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
    display: 'flex'
  },

  reverseLines: {
    extend: 'lines',
    transform: 'rotateX(180deg)'
  },

  vertical: {
    position: 'relative',

    top: '-4px',
    width: 0,
    height: 'calc(100% + 8px)',

    border: `1px ${colors.accent} solid`
  },

  halfVertical: {
    extend: 'vertical',

    top: '-5px',
    height: 'calc(50% + 4px)'
  },

  horizontal: {
    height: 0,
    width: '60px',

    margin: 'auto',
    border: `1px ${colors.accent} solid`
  }
});

export default Mindmap;
