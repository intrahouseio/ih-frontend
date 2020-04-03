import core from 'core';

core.network.request('appdialog_devlink', (send, context) => {
  send({ 
    method: 'get', 
    type: 'link',
    id: 'devicelink',
    nodeid: context.params.nodeid,
    anchor: context.params.anchor,
  });
})

core.network.response('appdialog_devlink', (answer, res, context) => {
  answer(res);
})