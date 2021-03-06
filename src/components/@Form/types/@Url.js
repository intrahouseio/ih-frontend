import React from 'react';

import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  root: {
    margin: 12,
  }
}

const classes = theme => ({
  root: {
  },
  input: {

  },
});

function Url(props) {
  return (
    <TextField
      multiline
      variant="outlined"
      id={props.options.id} 
      label={props.options.title} 
      style={styles.root}
      InputProps={{ classes: { root: props.classes.root, input: props.classes.input } }}
      InputLabelProps={{ shrink: true, style: props.getStyle(props) }}
      value={props.data}
      error={props.cache && props.cache.error}
      helperText={props.cache && props.cache.error}
      onChange={(e) => props.onChange(props.id, props.options, null, e.target.value)}
    />
  )
}


export default withStyles(classes)(React.memo(Url));