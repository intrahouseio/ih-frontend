import core from 'core';


core.network.request('appdialog_devlink', (send, context) => {
  send({ 
    method: 'get', 
    type: 'link',
    id: 'devicelink',
    nodeid: context.params.id,
    anchor: context.props.anchor,
  });
})

core.network.response('appdialog_devlink', (answer, res, context) => {
  answer(res);
})



core.network.request('appdialog_channellink', (send, context) => {
  send({ 
    method: 'get', 
    type: 'link',
    id: 'channellink',
    nodeid: context.params.id,
    anchor: context.props.anchor,
  });
})

core.network.response('appdialog_channellink', (answer, res, context) => {
  answer(res);
})


core.network.request('appdialog_set_channellink', (send, context) => {
  send(context.params);
})

core.network.response('appdialog_set_channellink', (answer, res, context) => {
  answer(res);
})


