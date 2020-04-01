import React from 'react';


const styles = {
  root: {
    padding: 20,
  }
}


function Devicelink(props) {
  return (
    <div style={styles.root} >
      <div>{`Component: ${props.state.component.type}`}</div>
      <div>{`Nodeid: ${props.state.component.id}`}</div>
    </div>
  )
}


export default Devicelink;