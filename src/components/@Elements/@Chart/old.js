import React, { PureComponent } from 'react';
import Dygraph from 'dygraphs';

import Intl from 'intl';


import 'dygraphs/dist/dygraph.min.css';

import { mousedown, mousewheel } from './interaction';

import {
  getDayId,
  getZoomInterval,
  getZoomIntervalPlotter,
  render,
  createContext,
  renderRealTime,
  darkenColor,
  discrete,
  getBarFormatDate,
} from './utils';

require('intl/locale-data/jsonp/en');
require('intl/locale-data/jsonp/ru');

const DateTimeFormat = global.Intl ? global.Intl.DateTimeFormat : Intl.DateTimeFormat;

const MIN_DATE = new Date(1451606400 * 1000);
const MAX_DATE = new Date(2524694399 * 1000);

const requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;


const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: -1,
  },
  container: {
    display: 'flex',
    position: 'absolute',
    width: '100%',
    flexShrink: 0,
  },
  spiner: {
    display: 'none',
    position: 'absolute',
    width: 52,
    height: 18,
    backgroundColor: 'rgba(247,252,255,.65)',
    fontSize: 10,
    top: 4,
    right: 5,
    border: '1px solid #b3b3b3',
    boxShadow: '2px 2px 10px rgba(154,154,154,.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    display: 'none',
    position: 'absolute',
    width: '100%',
    height: 30,
    backgroundColor: '#9E9E9E',
    flexShrink: 0,
  },
  legend: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    flexShrink: 0,
    minHeight: 40,
    zIndex: 1,
  },
  buttonSync: {
    position: 'absolute',
    bottom: 4,
    left: 6,
  },
  buttonHome: {
    position: 'absolute',
    bottom: 4,
    right: 6,
  },
  buttonNavNext: {
    position: 'absolute',
    bottom: 4,
    left: 'calc(50% + 30px)',
  },
  buttonNavBefore: {
    position: 'absolute',
    bottom: 4,
    left: 'calc(50% - 70px)',
  },
  buttonDate: {
    position: 'absolute',
    bottom: 4,
    left: 'calc(50% - 20px)',
  },
  buttonsDiscrete: {
    position: 'absolute',
    bottom: 4,
    left: 56,
  },
  datePicker: {
    display: 'none',
  },
  speeddial: {
    position: 'absolute',
    bottom: 4,
    left: 40,
    height: 40,
    width: 40,
  },
  toolbar: {
    height: 44,
  },
};


function getHeight(h, elementStyle) {
  if (!elementStyle.buttonSync && !elementStyle.buttonHome && !elementStyle.buttonDate && !elementStyle.buttonDiscrete && !elementStyle.buttonNavigate) {
    return h;
  }
  return h - 44;
}


class Chart extends PureComponent {

  state = { enabledsd: null, speeddial: false, realtime: true }

  componentDidMount() {
    const options = {
      underlayCallback: this.handleChanged,
      interactionModel: {
        ...Dygraph.defaultInteractionModel,
        dblclick: this.dblclick,
        mousedown: this.mousedown,
        mousewheel: this.mousewheel,
      },
      connectSeparatedPoints: true,
      gridLineColor: 'transparent',
      legend: 'always',
      // labelsDiv: this.legend,
      width: '100%',
      height: '100%',
    };
    this.chart = new Dygraph(this.link, [[new Date(), null]], options);
    this.getData();




    setTimeout(() => {
      const test = {
        ...this.props,
        params: {
          ...this.props.params,
          forceRealtime: false,
          range: [1604581705796, 1604581781231],
          timerange: [1604581705796, 1604581781231],
          triger: 1604581705796,
        },
      };
      this.componentWillReceiveProps(test);
    }, 500)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.network !== this.props.network && nextProps.network) {
      this.subDisabled(nextProps);
      this.getData(nextProps);
    }

    if (nextProps.params.chartid !== this.props.params.chartid) {
      this.subDisabled(nextProps);
      this.getData(nextProps);
    } else {
      if (this.props.elementStyle !== nextProps.elementStyle) {
        if (JSON.stringify(this.props.elementStyle) !== JSON.stringify(nextProps.elementStyle)) {
          this.updateOptions(nextProps);
        }
      }
      if (nextProps.params.triger !== undefined && nextProps.params.triger !== this.props.params.triger) {
        if (nextProps.params.timerange !== undefined) {
          this.props.params.timerange = nextProps.params.timerange
          this.ctx.buffer.raw = {}
          this.ctx.init = true;
        }
        this.setState({ realtime: nextProps.params.forceRealtime });
        this.ctx.chart.updateOptions({ dateWindow: nextProps.params.range });
      }
    }
    if (
      this.props.settings.h !== nextProps.settings.h ||
      this.props.settings.w !== nextProps.settings.w
    ) {
      this.ctx.chart.resize();
    }
  }

  componentWillUnmount() {
    this.subDisabled();
  }

  getData = (props = this.props, _discrete = false) => {
    this.spiner.style.display = 'none';
    props.fetch('get', {
      id: `WIDGET_CHARTS_${props.id}_${props.params.chartid}`,
      route: [
        { propname: 'data', tablename: 'chartlist', filter: { id: props.params.chartid !== '' ? props.params.chartid : 'null' } },
        { propname: 'items', tablename: 'charts', filter: { chartid: props.params.chartid !== '' ? props.params.chartid : 'null' } },
      ],
    })
    .then(response => response.set)
    .then(set => {
      const dn = set.items.map(i => i.dn).join(',');
      const alias = [].reduce((l, n) => ({ ...l, [n.dn]: n.id }), {});
      const legend = set.data[0] || {};
      const { start, end } = getZoomInterval(props.elementStyle.chartInterval);
      this.ctx = createContext(
        this.chart,
        this.spiner,
        props.fetch,
        { start, end },
        { id: props.id, dn, alias, items: set.items, legend },
        this.panel,
      );
      const genlegend = this.generateLegend();
      this.setClickLegend(genlegend);
      this.ctx.litems = genlegend;
      if (_discrete) {
        this.ctx.params.legend.discrete = _discrete;
      }
      this.updateOptions(props, _discrete);

      if (dn !== '' && legend.chart_type !== 'bar' && props.elementStyle.chartRealtime !== false) {
        props.fetch('sub', {
          id: `WIDGET_CHARTS_${props.id}_${props.params.chartid}`,
          route: { event: 'trend', filter: dn, alias },
        })
        .then(response => {
          this.sub = response.sub;
          this.subId = response.id;
          this.sub.on(response.id, this.realtime);
        });
      }
    });
  }

  setClickLegend = (legend) => {
    Object
      .keys(legend)
      .forEach(key => {
        legend[key].parentNode.onclick = this.handleClickLegend;
      });
  }

  handleClickLegend = e => {
    e.stopPropagation();

    if (e.target.parentElement.nodeName === 'SPAN') {
      const id = e.target.parentElement.children[0].nodeName === 'DIV' ?
        e.target.parentElement.children[0].id : e.target.parentElement.children[1].id;
      const chartid = Number(id.split('_').slice(-1)[0]);

      const visibility = this.chart.getOption('visibility');
      e.target.parentElement.style.opacity = visibility[chartid] ? 0.5 : 1;
      this.chart.setVisibility(chartid, !visibility[chartid]);
    }
  }

  subDisabled = (props = this.props) => {
    if (this.subId) {
      props.fetch('unsub', { id: this.subId, route: { event: 'devices' } });
      this.sub.removeListener(this.subId, this.realtime);
    }
  }

  realtime = (data) => {
    let x = 0;
    Object.keys(data)
      .forEach(key => {
        const item = data[key];
        x = x < item.x ? item.x : x;
        const d = this.ctx.params.items
          .map(v => {
            if (v.dn === key) {
              return Number(item.y);
            }
            return null;
          });
        const id = getDayId(item.x);
        if (this.ctx.buffer.raw[id] && this.ctx.buffer.raw[id].ready) {
          this.ctx.buffer.raw[id].data.push([new Date(item.x)].concat(d));
        }
      });
    if (this.state.realtime) {
      renderRealTime(this.ctx);
      this.setWindow(x, this.props.elementStyle.chartPositionCurentTime);
    }
  }

  multiColumnBarPlotter = (e) => {
    if (e.seriesIndex !== 0) return;

    var g = e.dygraph;
    var ctx = e.drawingContext;
    var sets = e.allSeriesPoints;

    var y_bottom = e.dygraph.toDomYCoord(0);
    var min_sep = discrete(g, this.ctx.params.legend.discrete);

    for (var j = 0; j < sets.length; j++) {
      var points = sets[j];
      for (var i = 1; i < points.length; i++) {
        var sep = points[i].canvasx - points[i - 1].canvasx;
        if (sep < min_sep) min_sep = sep;
      }
    }
    var bar_width = Math.floor(2.0 / 3 * min_sep);

    var fillColors = [];
    var strokeColors = g.getColors();
    for (var i = 0; i < strokeColors.length; i++) {
      fillColors.push(darkenColor(strokeColors[i]));
    }

    for (var j = 0; j < sets.length; j++) {

      ctx.fillStyle = fillColors[j];
      ctx.strokeStyle = strokeColors[j];
      for (var i = 0; i < sets[j].length; i++) {
        var p = sets[j][i];
        var center_x = p.canvasx;


        const width = bar_width/sets.length;
        const x = center_x + (j * width);

        ctx.fillRect(x, p.canvasy, width - 0, y_bottom - p.canvasy);
        ctx.strokeRect(x, p.canvasy, width - 0, y_bottom - p.canvasy);
      }
    }
  }

  updateOptions = (props = this.props, windowfreeze = false) => {
    this.ctx.init = true;
    const { legend, items } = this.ctx.params;
    const { start, end } = getZoomInterval(props.elementStyle.chartInterval);
    this.ctx.chart.updateOptions({
      stepPlot: legend.chart_type === 'step' ? true : false,
      visibility: items.map(() => true),
      includeZero: legend.chart_type === 'bar' ? true : false,
      highlightCircleSize: legend.chart_type === 'bar' ? 0 : 3,
      plotter: legend.chart_type === 'bar' ? this.multiColumnBarPlotter : null,
      file: [[new Date()].concat(items.map(() => null))],
      dateWindow: windowfreeze ? [this.ctx.chart.dateWindow_[0], this.ctx.chart.dateWindow_[1]] : [start, end],
      series: items.reduce((l, n) => ({ ...l, [n.id]: {
        axis: legend.rightaxis && n.rightaxis ? 'y2' : 'y' }
      }), {}),
      axes: {
        x: {
          axisLabelFormatter: this.getAxisValueX,
          axisLineColor: props.elementStyle.chartGridColor,
        },
        y: {
          axisLabelFormatter: this.getAxisValueY,
          axisLabelWidth: 50,
          axisLineColor: props.elementStyle.chartGridColor,
          valueRange: legend.chart_type === 'bar' ? null : [legend.leftaxis_min, legend.leftaxis_max],
        },
        y2: {
          axisLabelFormatter: this.getAxisValueY,
          drawAxis: legend.rightaxis,
          axisLabelWidth: 50,
          axisLineColor: props.elementStyle.chartGridColor,
          valueRange: [legend.rightaxis_min, legend.rightaxis_max],
        },
      },
      labels: ['x'].concat(items.map(i => i.id)),
      colors: items.map(i => i.lineColor),
      ylabel: this.getLabelLeft(),
      y2label: this.getLabelRight(),
      gridLineColor: props.elementStyle.chartGridColor,
      legend: 'always',
      labelsSeparateLines: true,
      hideOverlayOnMouseOut: false,
      legendFormatter: this.setLegend,
      drawPoints: props.elementStyle.chartPoints,
    });
    if (windowfreeze === false) {
      this.setWindow(Date.now(), this.props.elementStyle.chartPositionCurentTime);
    } else {
      const { start, end } = getZoomIntervalPlotter(this.ctx.chart.dateWindow_, windowfreeze);
      this.ctx.chart.updateOptions({ dateWindow: [start, end] });
    }
    requestAnimationFrame(() => this.ctx.chart.resize());
    this.setState({ enabledsd: legend.chart_type === 'bar' ? true : null })
  }

  mousewheel = (e, g, c) => {
    mousewheel(e, g, c);
  }

  mousedown = (e, g, c) => {
    if (this.state.realtime) {
      this.setState({ realtime: false });
    }
    mousedown(e, g, c);
    c.is2DPan = false;
  }

  dblclick = (e, g, c) => {
    const { start, end } = getZoomInterval(this.props.elementStyle.chartInterval);
    const a = (end - start) / 2;
    const b = (this.ctx.render.e - this.ctx.render.s) / 2;
    const x = this.ctx.render.s + b;
    const ns = x - a;
    const ne = x + a;
    g.updateOptions({ dateWindow: [ns, ne] });
  }

  setWindow = (n, p) => {
    const [s, e] = this.ctx.chart.dateWindow_;
    const i = e - s;
    const d = (i / 100) * p;
    const ns = n - d;
    const ne = n + i - d;
    this.ctx.chart.updateOptions({ dateWindow: [ns, ne] });
  }

  handleChanged = (_, __, chart) => {
    render(this.ctx, chart, this.props.params.timerange);
  }

  linked = (e) => {
    this.link = e;
  }

  linkedSpiner = (e) => {
    this.spiner = e;
  }

  linkedPanel = (e) => {
    this.panel = e;
  }

  linkedLegend = (e) => {
    this.legend = e;
  }

  linkedDatePicker = (e) => {
    this.linkDatePicker = e;
  }

  getLabelLeft = () => {
    const elementStyle = this.props.elementStyle;
    return `<span
      style="font-size:14px;color:${elementStyle.chartTextColor}">
      ${this.ctx.params.legend.leftaxis_title
      }</span>`;
  }

  getLabelRight = () => {
    const elementStyle = this.props.elementStyle;
    return `<span
      style="position:relative;top:-5px;font-size:14px;color:${elementStyle.chartTextColor}">
      ${this.ctx.params.legend.rightaxis_title
      }</span>`;
  }

  getAxisValueY = (v) => {
    const elementStyle = this.props.elementStyle;
    if (Number.isInteger(v)) {
      return `<span style="color:${elementStyle.chartTextColor}">${v}</span>`;
    }
    return `<span style="color:${elementStyle.chartTextColor}">${v.toFixed(2)}</span>`;
  }

  getAxisValueX = (a, b, c, d) => {
    if (this.ctx.params.legend.chart_type === 'bar') {
      const elementStyle = this.props.elementStyle;
      const v = getBarFormatDate(a, b, c, d, this.ctx.params.legend.discrete);
      return `<span style="white-space:nowrap;color:${elementStyle.chartTextColor}">${v}</span>`;
    }
    const elementStyle = this.props.elementStyle;
    const v = Dygraph.dateAxisLabelFormatter(a, b, c, d);
    return `<span style="color:${elementStyle.chartTextColor}">${v}</span>`;
  }

  setLegend = (data) => {
    if (data.x) {
      const x = new Date(data.x);
      if (this.ctx.params.legend.chart_type === 'bar') {
        this.ctx.litems[`l_${this.props.id}_t`].innerHTML = `${x.toLocaleDateString()}`;
      } else {
        this.ctx.litems[`l_${this.props.id}_t`].innerHTML = `${x.toLocaleDateString()} ${x.toLocaleTimeString()}`;
      }
    }
    data.series.forEach((i, k) => {
      const id = `l_${this.props.id}_${k}`;
      if (this.ctx.litems && this.ctx.litems.hasOwnProperty(id)) {
        if (typeof i.y === 'number') {
          this.ctx.litems[id].innerHTML = i.y;
        } else {
          this.ctx.litems[id].innerHTML = '&nbsp;';
        }
      }
    });
    return '';
  }

  handleDate = () => {
    this.linkDatePicker.openDialog();
  }

  handleHome = () => {
    this.setState({ realtime: true });
    renderRealTime(this.ctx);
    this.setWindow(Date.now(), this.props.elementStyle.chartPositionCurentTime);
  }

  handleChandeDate = (_, v) => {
    this.setState({ realtime: false });
    this.setWindow(v.getTime(), 0);
  }

  handleSync = () => {
    this.props.actions
      .updateOptionsChartsCanvas(this.ctx.chart.dateWindow_, this.state.realtime);
  };

  handleChangeDiscrete = (v) => {
    this.setState({ speeddial: false });
    this.getData(this.props, v);
  }

  handleSpeeddial = (v) => {
    if (this.state.speeddial !== v.isOpen) {
      this.setState({ speeddial: v.isOpen });
    }
  }

  handleNavBefore = () => {
    const [s, e] = this.ctx.chart.dateWindow_;
    const i = e - s;
    const ns = s - i;
    const ne = e - i;
    this.ctx.chart.updateOptions({ dateWindow: [ns, ne] });
  }

  handleNavNext = () => {
    const [s, e] = this.ctx.chart.dateWindow_;
    const i = e - s;
    const ns = e;
    const ne = e + i;
    this.ctx.chart.updateOptions({ dateWindow: [ns, ne] });
  }

  generateLegend = () => {
    const color = this.props.elementStyle.chartTextColor;
    const st = `text-align:center;color:${color};width:150px;font-size:14px;display:flex;align-items:center;justify-content:center;`;
    const s0 = 'display:flex;flex-direction:row;flex-shrink:0;height: 100%;';
    const sl = 'font-size:14px;display:flex;width:100%;padding-left:5px;padding-right:10px;height:100%';
    const sr = 'font-size:14px;display:flex;width:100%;padding-right:5;padding-left:10px;height:100%;align-items:left;';
    const bl = 'flex-direction:row;display:flex;width:100%;height:100%;justify-content:end;flex-wrap: wrap;text-align:right;';
    const br = 'flex-direction:row;display:flex;width:100%;height:100%;justify-content:end;flex-wrap: wrap;';
    const temp = this.ctx.params.items.map((i, k) => ({ ...i, id: `l_${this.props.id}_${k}` }));

    const lt = temp
      .filter(v => v.rightaxis === false)
      .map(i => `<span style="cursor:pointer;display:flex;margin-left:5px;margin-top:2px;"><span style="color:${i.lineColor}">${i.legend}</span><div id="${i.id}" style="text-align:left;margin-left:8px;margin-right:10px;width:50px;height: 20px;font-weight:bold;color:${i.lineColor}"></div></span>`)
      .join('');
    const rt = temp
      .filter(v => v.rightaxis === true)
      .map(i => `<span style="cursor:pointer;display:flex;margin-right:5px;margin-top:2px;"><span style="color:${i.lineColor}">${i.legend}</span><div id="${i.id}" style="text-align:left;margin-right:10px;margin-left:8px;width:50px;height: 20px;font-weight:bold;color:${i.lineColor}"></div></span>`)
      .join('');
    const left = `<div style="${bl}">${lt}</div>`;
    const right = `<div style="${br}">${rt}</div>`;
    const string = `<div style="${s0}"><div style="${sl}">${left}</div><div id="l_${this.props.id}_t" style="${st}">&nbsp;</div><div style="${sr}">${right}</div></div>`;
    this.legend.innerHTML = string;
    this.ctx.chart.resize();
    return temp
      .concat([{ id: `l_${this.props.id}_t` }])
      .reduce((l, n) => {
        return { ...l, [n.id]: document.getElementById(n.id) };
      }, {});
  }

  render = ({ settings, containerStyle, elementStyle, params, locale } = this.props) => {
    console.log(this.props)
    const height = (settings.h - (containerStyle.borderWidth * 2)) - elementStyle.chartLegendHeight;
    const top = elementStyle.chartLegendHeight;
    const buttonSize = elementStyle.buttonSize / 100;
    return (
      <div style={{ ...styles.root, ...containerStyle, zIndex: styles.root.zIndex }}>
        <div ref={this.linkedLegend} style={{ ...styles.legend, height: top }} />
        <div ref={this.linked} style={{ ...styles.container, width: '100%', top, height: getHeight(height, elementStyle) }} />
        <div style={styles.toolbar} />
        <div ref={this.linkedSpiner} style={styles.spiner}>LOADING</div>
        <div ref={this.linkedPanel} style={styles.panel} />
      </div>
    );
  }
}

export default Chart;