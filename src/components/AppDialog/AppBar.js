import React from 'react';
import core from 'core';

import { withStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';


const classes = theme => ({
  appBar: {
    position: 'relative',
    backgroundColor: 'rgb(96, 125, 139)',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  dialog: {
      position: 'relative',
      minHeight: '80vh',
      maxHeight: '80vh',
  },
});



function DialogAppBar(props) {

  const close = () => {
    const store = core.store.getState().appdialog;
    if (props.type === 'form') {
      core.transfer.send(store.transferid, null);
    } else {
      core.transfer.send(store.transferid, ':exit:');
    }
    core.actions.appdialog.close();
  }
  
  const save = () => {
    if (!props.disabledSave) {
      const store = core.store.getState().appdialog;
      if (props.type === 'form' || props.type === 'options') {
        const store = core.store.getState().appdialog;
        const data = {};
  
        Object
          .keys(store.form.data)
          .forEach((key) => {
            Object
              .keys(store.form.data[key])
              .forEach((key2) => {
                data[key2] = store.form.data[key][key2];
              });
          });
        data.active = true;
        core.transfer.send(store.transferid, data, store);
      } else {
        core.transfer.send(store.transferid, store.component.select, store);
      }
    }

    props.noclose || core.actions.appdialog.close();
  }
  
  return (
    <AppBar className={props.classes.appBar}>
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={close} >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" className={props.classes.title}>
          {props.title}
        </Typography>
        {!props.disabledSave ? <Button autoFocus color="inherit" onClick={save} >
            ok
        </Button> : null}
      </Toolbar>
    </AppBar>
  )
}


export default withStyles(classes)(DialogAppBar);