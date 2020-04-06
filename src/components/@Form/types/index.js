import React from 'react';

import Text from './@Text';
import Header from './@Header';
import Input from './@Input';
import Textarea from './@Textarea';
import Droplist from './@Droplist';
import Tags from './@Tags';

import SmartButton from './@SmartButton';
import Table from './@Table';
import Code from './@Code';
import PluginForm1 from './@PluginForm1';


function getComponentByType(type) {
  switch (type) {
    case 'text':
      return Text;
    case 'header':
      return Header;
    case 'input':
      return Input;
    case 'textarea':
      return Textarea;
    case 'table':
      return Table;
    case 'droplist':
      return Droplist;
    case 'tags':
      return Tags;
    case 'smartbutton':
      return SmartButton;
    case 'code':
      return Code;
    case 'pluginform1':
      return PluginForm1;
    default:
      return Text;
  }
}

function components(id, item, data, cache, route, onChange) {
  const component = getComponentByType(item.type);
  if (component) {
    return React.createElement(component, { key: item.prop, id, options: item, data, cache, route, onChange });
  }
  return null;
}


export default components;