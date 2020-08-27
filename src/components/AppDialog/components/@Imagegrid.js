import React, { Component } from 'react';
import core from 'core';

import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import InboxOutlinedIcon from '@material-ui/icons/InboxOutlined';

import Paper from '@material-ui/core/Paper';

import { Scrollbars } from 'react-custom-scrollbars';


const styles = {
  root2: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    color: '#9E9E9E',
  },
  container1: {
    height: '100%',
    padding: 20,
  },
  container2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gridGap: '2vw',
    padding: 24,
  },
  paper: {
    height: '100%',
  },
  imgContainer: {
    height: 170,
  },
  imgBody: {
    height: 136,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: 120,
    height: 120,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
  },
  imgBody2: {
    display: 'flex',
    justifyContent: 'space-between',
    height: 34,
  },
  imgTitle: {
    paddingLeft: 14,
    height: 34,
    fontSize: 12,
    display: 'grid',
    alignItems: 'center',
    lineHeight: '16px',
    overflow: 'hidden',
  }
}


function Image(props) {
  return (
    <Paper style={styles.imgContainer} >
      <div style={styles.imgBody} >
        <div style={{ backgroundImage: `url(/images/${encodeURI(props.path)})`, ...styles.img }} />
      </div>
      <div style={styles.imgBody2}>
        <div style={styles.imgTitle}>{props.path}</div>
        <Checkbox
          size="small"
          color="primary"
          onChange={(e) => props.onClick(e.target.checked, props.path)}
        />
      </div>
    </Paper>
  )
}


class Imagegrid extends Component {
  componentDidMount() {
    this.request();
  }

  request = () => {
    const props = this.props.state.template;
    const params = this.props.state.component;
    params.dialogid = this.props.state.template.id;
    const { state } = this.props;
    
    core
      .request({ method: 'appdialog_imagegrid', props, params })
      .ok((res) => {
        const select = { 
          folder: state.component.select.folder !== undefined ? state.component.select.folder : state.template.selectnodeid, 
          value: state.component.select.value !== undefined ? state.component.select.value : state.template.selectId, 
        }
        // const index = res.data.properties.findIndex(i => i.result.value.did === select.did && i.result.value.prop === select.prop)

        core.actions.appdialog.component({ res:1, list: res.data, select });
        /*
        if (this.link && index !== -1) {
          this.link.scrollTop(index * 50)
        }
        */

      });
  }

  handleClickOk = (item) => {
    core.transfer.send(this.props.state.transferid, item);
  }

  handleClickCheckBox = (cb, value) => {
    const { state } = this.props;
    if (cb) {
      core.actions.appdialog.select({ folder: state.component.id, value } );
    } else {
      core.actions.appdialog.select({ folder: null, value: '' } );
    }
  }

  linked = (e) => {
    this.link = e;
  }
  
  render({ state } = this.props) {
    if (state.component.res && state.component.list.length === 0) {
      return (
        <div style={styles.root2} >
          <InboxOutlinedIcon style={{ fontSize: '6em', margin: 6, color: '#B0BEC5' }} />
          <Typography variant="h5">It's empty is here</Typography>
        </div>
      )
    }
    return (
      <>
        <div style={styles.container1}>
          <Paper style={styles.paper}>
            <Scrollbars ref={this.linked} >
              <div style={styles.container2}>
                {state.component.list
                  .map((i, key)=> 
                    <Image key={key} path={i} onClick={this.handleClickCheckBox} />
                )}
              </div>
            </Scrollbars>
          </Paper>
        </div>
      </>
    )
  }
}


export default Imagegrid;