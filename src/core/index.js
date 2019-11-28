import EventEmitter from 'events';

import connect from './connect';
import store from './store';
import components from './components';


function dependencies(deps) {
  core.store = store(deps);
  core.components = components(deps, core.store.dispatch);
}

function event(name, id, data) {
  const eventid = `${name}:${id}`;

  if (core.events._events[eventid] !== undefined) {
    core.events.emit(eventid, id, data);
  } else {
    core.events.emit(name, id, data);
  }
}


const core = {
  action: {},
  store: {},
  connect,
  dependencies,
  event,
  events: new EventEmitter(),
}


export default core;