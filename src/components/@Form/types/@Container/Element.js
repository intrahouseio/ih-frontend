import React, { Component } from 'react';
import core from 'core';

import Draggable from 'react-draggable';

import ResizeControls from './ResizeControls';


const styles = {

}


function Element(props) {
  return (
    <Draggable
      bounds=".parent"
      scale={props.scale}
      position={props.item}
      disabled={props.isGroup}
      onStart={(e, data) => props.onStartMove(e, props.id, data)}
      onDrag={(e, data) => props.onMove(e, props.id, data)}
      onStop={(e, data) => props.onStopMove(e, props.id, data)}
    >
      <div
        style={{ 
          position: 'absolute',
          width: props.item.w, 
          height: props.item.h, 
          outline: props.select ? '2px dashed #ff00ff' : '2px dashed transparent',
        }}
        onClick={(e) => props.isGroup || props.onClick(e, props.id)}
        onContextMenu={(e) => props.isGroup || props.onContextMenu(e, props.id)} 
      >
        {props.onRenderElement(props.id, props.item)}
        <ResizeControls
          id={props.id}
          disabled={props.isGroup}
          position={props.item} 
          scale={props.scale} 
          onChange={props.onChangeSize}
        />
      </div>
    </Draggable>
  );
}

export default Element;