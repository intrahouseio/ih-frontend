import React, { Component } from 'react';
import core from 'core';

import 'react-sortable-tree/style.css'; 

import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { withStyles } from '@material-ui/core/styles';


import { SortableTreeWithoutDndContext as SortableTree, getNodeAtPath, getDescendantCount } from 'react-sortable-tree';

import { ContextMenu } from "@blueprintjs/core";
import Menu from 'components/Menu';

import Skeleton from '@material-ui/lab/Skeleton';
import Panel from 'components/Panel';

import shortid from'shortid';

import theme from './theme';
import { getNodesRange, editNodes, insertNodes, findNode, getOrder } from './utils';

const styles = {
  panel: {
    height: '100%',
    backgroundColor: '#ECEFF1',
    padding: 0,
    flexShrink: 0,
    overflow: 'hidden',
    borderRight: '1px solid #d3d3d3',
  },
  box: {
    width: '100%',
    height: '100%',
  },
  active: {
    cursor: 'pointer',
    backgroundColor: 'rgba(158, 158, 158, 0.2)',
  },
  noactive: {
    cursor: 'pointer',
  }
};

const classes = theme => ({

});


class AppNav extends Component {

  componentDidMount() {
    this.props.route.menuid && core
    .request({ method: 'appnav', params: this.props.route })
    .ok((res) => {
      if (this.props.route.nodeid) {
        const node = findNode(res.list, this.props.route.nodeid);
        if (node) {
          if (node.windowHeight - this.panel.clientHeight > 0) {
            res.scrollTop = node.scrollPoint - ((this.panel.clientHeight - 5) / 2) - 9;
          }
          res.list = editNodes(res.list, (item) => {
            if (item.children !== undefined && node.paths[item.id]) {
              return { ...item, expanded: true };
            }
            return item;
          }); 
        }
      }
      core.actions.appnav.data(res)
    });
  }

  handleChange = (list) => {
    core.actions.appnav.data({ ...this.props.state, list })
  }

  handleCheckChild = (node) => {
    return node.children !== undefined && node.children === undefined;
  }

  generateNodeProps = (rowinfo) => {
    const style = {};
    const id = rowinfo.node.id;

    if (this.props.route.nodeid === id) {
      style.backgroundColor = 'rgba(158, 158, 158, 0.2)';
    }

    if (this.props.state.selects.data[id]) {
      style.backgroundColor = 'rgba(33, 150, 243, 0.2)';
    } else {
      if (this.props.state.selects.contextMenu && this.props.state.selects.contextMenu.id === id) {
        style.outline = '1px solid #2196F3';
      }
    }

    return {
      style,
      renameid: this.props.state.renameid,
      onContextMenu: (e) => this.handleContextMenuNode(e, rowinfo),
      onClick: (e) => this.handleClickNode(e, rowinfo),
    };
  }

  handleChangeRoute = (type, rootid, item) => {
    const { state, route } = this.props;
    const componentid = item.node.component || state.options[rootid][type].defaultComponent;

    const params = core.cache.componentsParams[componentid] ?  
      '/' + core.cache.componentsParams[componentid] :
      '/' + core.options.componentsScheme[componentid].defaultTab;
    
    core.route(`${route.menuid}/${rootid}/${componentid}/${item.node.id}${params}`);
  }

  handleClickNode = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.shiftKey) {
       const curent = item.node;
       const last = this.props.state.selects.lastItem || curent;
       const selects = getNodesRange(this.props.state.list, last.id, curent.id);
       core.actions.appnav.selectNodes(curent, selects);
    } else if (e.ctrlKey || e.metaKey) {
      const selects = getNodesRange(this.props.state.list, item.node.id, item.node.id);
      core.actions.appnav.selectNodes(item.node, selects);
    } else {
      if (this.props.state.selects.lastItem) {
        core.actions.appnav.clearSelected();
      }

      const rootid = this.props.state.options.roots[item.path[0]];
      const type = item.node.children !== undefined ? 'parent' : 'child';
  
      this.handleChangeRoute(type, rootid, item);
    }
  }

  handleContextMenuBody = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const pos = { left: e.clientX, top: e.clientY };
    const scheme = {
      main: [
        { id: 'newDevice', title: 'New device', click: this.handleAddNode },
        { id: 'newType', title: 'New type', click: this.handleAddNode },
      ]
    }

    ContextMenu.show(<Menu scheme={scheme} />, pos);
  }

  handleClickBody = (e) => {
    e.preventDefault();
    e.stopPropagation();

    core.actions.appnav.clearSelected();
  }

  handleContextMenuNode = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
   
    const pos = { left: e.clientX, top: e.clientY };

    if (item.node.children !== undefined) {  
      const scheme = {
        main: [
          { id: 'newFolder', title: 'New folder', click: () => this.handleAddNode(true, item) },
          { id: 'newNode', title: 'New node', click: () => this.handleAddNode(false, item) },
        ]
      }
      core.actions.appnav.selectNodeContextMenu(item.node);
      ContextMenu.show(<Menu scheme={scheme} />, pos, core.actions.appnav.selectNodeContextMenu);
    } else {
      const scheme = {
        main: [
          { id: 'newFolder', title: 'New folder', click: () => this.handleAddNode(true, item) },
          { id: 'newNode', title: 'New node', click: () => this.handleAddNode(false, item) },
        ]
      }
      core.actions.appnav.selectNodeContextMenu(item.node);
      ContextMenu.show(<Menu scheme={scheme} />, pos, core.actions.appnav.selectNodeContextMenu);
    }
  }

  handleAddNode = (folder, item) => {
    let scrollTop = this.props.state.scrollTop;
    // test
    const rootid = this.props.state.options.roots[item.path[0]];

    const parent = item.node.children !== undefined ? item.node : item.parentNode;

    const items = [{ parentid: parent.id, order: getOrder(parent, item.node) }];
    const payload = { [rootid]: { [folder ? 'folders' : 'nodes'] : items } }

    core
    .request({ method: 'appnav_new_node', params: this.props.route, payload })
    .ok((res) => {
      const type = folder ? 'parent' : 'child';
      const list = insertNodes(this.props.state.list, item.node, res.data);
      const node = findNode(list, res.data[0].id);
      
      if (node) {
        if (node.windowHeight - this.panel.clientHeight > 0) {
          scrollTop = node.scrollPoint - ((this.panel.clientHeight - 5) / 2) - 9;
        }
      }

      core.actions.appnav.data({ ...this.props.state, scrollTop, list });
      this.handleChangeRoute(type, rootid, { node: res.data[0] });
    });
  }

  handleChangePanelSize = (value) => {
    core.actions.appnav.panelWidth(value);
  }

  linkPanel = (e) => {
    this.panel = e;
  }

  render({ state, route } = this.props) {
    if (route.menuid) {
      return (
        <Panel width={state.width} position="right" style={styles.panel} onChangeSize={this.handleChangePanelSize}>
          <div ref={this.linkPanel} style={styles.box} onClick={this.handleClickBody} onContextMenu={this.handleContextMenuBody}>  
            <SortableTree
              reactVirtualizedListProps={{ 
                onScroll: core.actions.appnav.scroll,
                scrollTop: state.scrollTop, 
              }}
              rowHeight={21}
              innerStyle={{ padding: 5 }}
              treeData={state.list}
              onChange={this.handleChange}
              generateNodeProps={this.generateNodeProps}
              canNodeHaveChildren={this.handleCheckChild}
              getNodeKey={({ node }) => node.id}
              theme={theme}
            />    
          </div>
        </Panel>
      );
    }
    return null;
  }
}


const mapStateToProps = createSelector(
  state => state.app.route,
  state => state.appnav,
  (route, state) => ({ route, state })
)

export default connect(mapStateToProps)(withStyles(classes)(AppNav));