import React, { PureComponent } from 'react';
import core from 'core';

import elemets from 'components/@Elements';

const method = window.document.body.style.zoom === undefined;


class Template extends PureComponent {

  handleRender = (id, item) => {
    if (item.type === 'group') {
      return (
        <div
          key={id}
          style={{ 
            position: 'absolute', 
            left: item.x.value,
            top: item.y.value,
            width: item.w.value,
            height: item.h.value,
            zIndex: item.zIndex.value,
            opacity: item.opacity.value / 100,
            animation: item.animation && item.animation.active ? item.animation.value : 'unset',
            overflow: item.overflow && item.item.overflow.value ? 'hidden' : 'unset',
            visibility: item.visible && item.visible.value == false ? 'hidden' : 'unset',
          }}
        >
          {item.elements.map(cid => this.handleRender(cid, this.props.item.elements ? this.props.item.elements[cid] : this.props.template.elements[cid]))}
        </div>
      )
    }
    return (
      <div
        key={id}
        style={{ 
          position: 'absolute', 
          left: item.x.value,
          top: item.y.value,
          width: item.w.value,
          height: item.h.value,
          zIndex: item.zIndex.value,
          animation: item.animation && item.animation.active ? item.animation.value : 'unset',
        }}
      >
        {elemets(this.props.template.elements[id].type, { id, layoutId: this.props.layoutId, containerId: this.props.containerId, templateId: this.props.id, mode: this.props.mode, item: this.props.item.elements ? this.props.item.elements[id] : this.props.template.elements[id], actions: this.props.item.actions })}
      </div>
    )
  }

  render() {
    const type = this.props.template.settings.backgroundColor.type;
    const color = type === 'fill' ? '' : ', ' + this.props.template.settings.backgroundColor.value;
    const src =  this.props.template.settings.backgroundImage.value.indexOf('://') !== -1 ? this.props.template.settings.backgroundImage.value : '/images/' + this.props.template.settings.backgroundImage.value
    const scale = this.props.item.w.value / this.props.template.settings.w.value;
    return (
      <div
        className="parent2"
        style={{
          position: 'absolute', 
          width: '100%', 
          height: '100%',
          transform: method ? `scale(${scale})` : 'unset',
          transformOrigin: method ? '0 0' : 'unset',
          zoom: method ? 'unset' : scale,
          opacity: this.props.item.opacity.value / 100,
          // animation: this.props.item.animation && this.props.item.animation.active ? this.props.item.animation.value : 'unset',
          overflow: this.props.item.overflow && this.props.item.overflow.value ? 'hidden' : 'unset',
          backgroundColor: this.props.template.settings.backgroundColor.value,
          backgroundImage:  `url(${encodeURI(src)})${color}`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          visibility: this.props.item.visible && this.props.item.visible.value == false ? 'hidden' : 'unset',
        }}
      >
        <div style={{ width: '100%', height: '100%', background: this.props.template.settings.overlayColor.value }}>
          {this.props.template.list.map(id => this.handleRender(id, this.props.item.elements ? this.props.item.elements[id] : this.props.template.elements[id]))}
        </div>
      </div>
    )
  }
}

export default Template;