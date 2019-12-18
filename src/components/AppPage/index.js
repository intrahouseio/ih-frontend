import React, { Component } from 'react';
import core from 'core';

import Table from 'components/Table';
import Options from 'components/Options';
import Graph from 'components/Graph';


const styles = {
  root: {
    width: '100%',
    height: '100%',
  }
};


function getComponent(type) {
  switch (type) {
    case 'table':
      return <Table />;
    case 'options':
      return <Options />;
    case 'graph':
      return <Graph />;
    default:
      return null;
  }
}

function handleContextPageBody(e, params) {
  e.preventDefault();
  e.stopPropagation();
  core.event('contextmenu', 'page', e, params);
}


function AppPage(props) {
  if (props.state.open) {
    return (
      <div style={styles.root} onContextMenu={(e) => handleContextPageBody(e, props.state)}>
        {getComponent(props.state.component)}
      </div>
    );
  }
  return null
}


export default AppPage;