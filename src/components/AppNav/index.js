import React, { Component } from 'react';

import Panel from 'components/#basic/Panel';
import Explorer from 'components/Explorer';


const styles = {
  box: {
    height: '100%',
    backgroundColor: '#ECEFF1',
    padding: 6,
    flexShrink: 0,
    overflow: 'hidden',
    borderRight: '1px solid #d3d3d3',
  }
};


function AppNav (props) {
  if (props.state.open) {
    return (
      <Panel width={200} position="right" style={styles.box}>
        <Explorer />
      </Panel>
    );
  }
  return null;
}


export default AppNav;