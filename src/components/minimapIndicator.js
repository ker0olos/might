import React from 'react';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

const colors = getTheme();

class MinimapIndicator extends React.Component
{
  constructor()
  {
    super();

    // the '15' is margin of the wrapper
    this.state = {
      x: 15,
      y: 15
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

  onScroll()
  {
    const miniMapWidth = 260;
    const miniMapHeight = 157;

    const mapWidth = miniMapWidth * 10 -  window.innerWidth;
    const mapHeight = miniMapHeight * 10 -  window.innerHeight;

    const indicatorWidth = window.innerWidth / 10;
    const indicatorHeight = window.innerHeight / 10;

    const widthPercentage = this.mindMapElem.scrollLeft / mapWidth;
    const heightPercentage = this.mindMapElem.scrollTop / mapHeight;

    // the '15' is margin of the wrapper
    // the '2' is the size of the indicator's border
    this.setState({
      x: (miniMapWidth - indicatorWidth - 2) * widthPercentage + 15,
      y: (miniMapHeight - indicatorHeight - 2) * heightPercentage + 15
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
    zIndex: 1,
    position: 'absolute',

    backgroundColor: colors.transparent,

    width: 'calc(100vw / 10)',
    height: 'calc(100vh / 10)',

    border: '1px solid',
    borderColor: colors.accent
  }
});

export default MinimapIndicator;
