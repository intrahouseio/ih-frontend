import React, { Component } from 'react';
import core from 'core';

import { withStyles } from '@material-ui/core/styles';


const styles = {
  box: {
  },
};

const classes = theme => ({
  root: {
  },
});


class Example extends Component {

  componentDidMount() {
    // context.event('app:example', this.props.id);
  }
  componentWillUnmount() {
    // context.event('app:example', this.props.id);
  }

  render({ id, state, classes } = this.props) {
    return (
      <div style={styles.box}>
        Example
      </div>
    );
  }

}

export default core.connect(withStyles(classes)(Example));