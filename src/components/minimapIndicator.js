import React from 'react';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

const colors = getTheme();

class MinimapIndicator extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      x: 0,
      y: 0
    };

    this.onScroll = this.onScroll.bind(this);
  }

  componentDidMount()
  {
    this.mindMapElem = document.body.querySelector('#main');

    window.addEventListener('resize', this.onScroll);
    
    this.mindMapElem.addEventListener('scroll', this.onScroll);
  }

  componentWillUnmount()
  {
    window.removeEventListener('resize', this.onScroll);
    
    this.mindMapElem.removeEventListener('scroll', this.onScroll);
  }

  minMaxScroll()
  {
    return {

    };
  }

  onScroll()
  {
    
    const maxWidth = 260;
    const maxHeight = 157;
    
    const minWidth = 180;
    const minHeight = 104;
    
    const miniMapWidth = Math.min(maxWidth, Math.max(window.innerWidth * 0.25, minWidth));
    const miniMapHeight = Math.min(maxHeight, Math.max(window.innerWidth * 0.15, minHeight));

    const mapWidth = miniMapWidth * 10 -  window.innerWidth;
    const mapHeight = miniMapHeight * 10 -  window.innerHeight;

    const indicatorWidth = miniMapWidth / 5;
    const indicatorHeight = miniMapHeight / 5;

    const widthPercentage = this.mindMapElem.scrollLeft / mapWidth;
    const heightPercentage = this.mindMapElem.scrollTop / mapHeight;

    this.setState({
      x: (miniMapWidth - indicatorWidth - 2) * widthPercentage,
      y: (miniMapHeight - indicatorHeight - 2) * heightPercentage
    });
  }

  render()
  {
    return (
      <div style={ {
        left: this.state.x,
        top: this.state.y
      } } className={ styles.container }/>
    );
  }
}

const styles = createStyle({
  container: {
    backgroundColor: colors.whiteBackground,

    position: 'absolute',

    maxWidth: 'calc(260px / 5)',
    maxHeight: 'calc(157px / 5)',

    minWidth: 'calc(180px / 5)',
    minHeight: 'calc(104px / 5)',

    width: 'calc(25vw / 5)',
    height: 'calc(15vw / 5)',

    border: '1px solid',
    borderColor: colors.miniMapBorder
  }
});

export default MinimapIndicator;
