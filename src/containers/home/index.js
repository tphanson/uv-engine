import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import { } from '@material-ui/icons';

import Drain from 'components/drain';
import Map from 'components/map';
import POI from 'components/poi';
import Point from 'components/point';
import Bot from 'components/bot';
import Header from './header';
import Action, { virtualEl } from './action';

import styles from './styles';
import History from 'helpers/history';
import api from 'helpers/api';
import utils from 'helpers/utils';
import KOLVN from 'static/images/kolvn_office.pgm';
import { setError } from 'modules/ui.reducer';


class Home extends Component {
  constructor() {
    super();

    const DATA = [
      { x: 50, y: 50, editable: true, t: 60000, v: 0.5, l: 500 },
      { x: 100, y: 100, editable: false, t: 0, v: 0, l: 0 },
      { x: 150, y: 150, editable: false, t: 0, v: 0, l: 0 },
      { x: 200, y: 200, editable: false, t: 0, v: 0, l: 0 },
      { x: 250, y: 250, editable: false, t: 0, v: 0, l: 0 },
      { x: 300, y: 300, editable: true, t: 120000, v: 0.1, l: 1000 },
      { x: 350, y: 350, editable: false, t: 0, v: 0, l: 0 },
      { x: 400, y: 400, editable: false, t: 0, v: 0, l: 0 },
      { x: 450, y: 450, editable: false, t: 0, v: 0, l: 0 },
      { x: 500, y: 500, editable: false, t: 0, v: 0, l: 0 },
      { x: 550, y: 550, editable: true, t: 45000, v: 2, l: 5000 }
    ]

    this.state = {
      anchorEl: virtualEl(),
      selected: -1,
      trajectory: DATA,
      map: '',
      disabled: {}
    }

    this.history = new History(DATA);
  }

  componentDidMount() {
    this.onData();
    this.history.watch(disabled => {
      return this.setState({ disabled });
    });
  }

  onHistory = () => {
    const { trajectory } = this.state;
    return this.history.set(trajectory);
  }

  undo = () => {
    const newTrajectory = this.history.undo();
    return this.setState({ trajectory: newTrajectory });
  }

  redo = () => {
    const newTrajectory = this.history.redo();
    return this.setState({ trajectory: newTrajectory });
  }

  onChange = (index, pos) => {
    const { trajectory } = this.state;
    const newTrajectory = [...trajectory];
    newTrajectory[index] = { ...newTrajectory[index], ...pos }
    return this.setState({ trajectory: newTrajectory }, this.onHistory);
  }

  onData = () => {
    const { setError } = this.props;
    return api.get(KOLVN).then(data => {
      return this.setState({ map: data });
    }).catch(er => {
      return setError(er);
    });
  }

  onClick = (e, index) => {
    return this.setState({
      anchorEl: virtualEl(e.evt.clientX, e.evt.clientY),
      selected: index
    });
  }

  onClose = () => {
    return this.setState({ anchorEl: virtualEl(), selected: -1 });
  }

  onSwitch = (editable) => {
    const { trajectory, selected } = this.state;
    const newTrajectory = [...trajectory];
    newTrajectory[selected] = { ...newTrajectory[selected], editable }
    return this.setState({ trajectory: newTrajectory }, this.onHistory);
  }

  onTime = (t) => {
    const { trajectory, selected } = this.state;
    const newTrajectory = [...trajectory];
    newTrajectory[selected] = { ...newTrajectory[selected], t }
    return this.setState({ trajectory: newTrajectory }, this.onHistory);
  }

  onVelocity = (v) => {
    const { trajectory, selected } = this.state;
    const newTrajectory = [...trajectory];
    newTrajectory[selected] = { ...newTrajectory[selected], v }
    return this.setState({ trajectory: newTrajectory }, this.onHistory);
  }

  onLightAmptitude = (l) => {
    const { trajectory, selected } = this.state;
    const newTrajectory = [...trajectory];
    newTrajectory[selected] = { ...newTrajectory[selected], l }
    return this.setState({ trajectory: newTrajectory }, this.onHistory);
  }

  render() {
    const { ui: { width } } = this.props;
    const { trajectory, map, anchorEl, selected, disabled } = this.state;

    const selectedNode = trajectory[selected] || {
      editable: false
    }

    return <Grid container spacing={2} justify="center">
      <Grid item xs={11} md={10}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <Header
              disabledUndo={disabled.disabledUndo}
              disabledRedo={disabled.disabledRedo}
              onUndo={this.undo}
              onRedo={this.redo}
            />
          </Grid>
          <Grid item xs={12}>
            <Drain small />
          </Grid>
          <Grid item xs={12}>
            <Map map={map}>
              <Bot x={500} y={350} r={width / 150} />
              {trajectory.map(({ x, y, editable }, index) => {
                if (editable) return <POI
                  key={index}
                  x={x}
                  y={y}
                  r={width / 175}
                  onClick={(e) => this.onClick(e, index)}
                  onChange={pos => this.onChange(index, pos)}
                />
                return <Point
                  key={index}
                  x={x}
                  y={y}
                  r={width / 300}
                  onClick={(e) => this.onClick(e, index)}
                />
              })}
            </Map>
          </Grid>
          <Action
            anchorEl={anchorEl}
            editable={selectedNode.editable}
            x={selectedNode.x}
            y={selectedNode.y}
            time={selectedNode.t}
            velocity={selectedNode.v}
            light={selectedNode.l}
            onClose={this.onClose}
            onSwitch={this.onSwitch}
            onTime={this.onTime}
            onVelocity={this.onVelocity}
            onLightAmptitude={this.onLightAmptitude}
          />
        </Grid>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Home)));