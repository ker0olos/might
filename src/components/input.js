import React from 'react';

// import PropTypes from 'prop-types';

import { createStyle } from 'flcss';

import getTheme from '../colors.js';

const colors = getTheme();

const Input = () =>
{
  return <div className={ styles.container }>

  </div>;
};

Input.propTypes = {
  //
};

const styles = createStyle({
  container: {
    cursor: 'pointer',

    backgroundColor: colors.whiteBackground,

    height: '40px',

    borderRadius: '5px',
    border: `${colors.blackText} 1px solid`
  }
});

export default Input;