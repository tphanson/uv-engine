import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import IconButton from '@material-ui/core/IconButton';

import { SettingsRounded } from '@material-ui/icons';

import Map from 'components/map';
import POI from 'components/poi';
import Point from 'components/point';
import CircularProgressWithLabel from 'components/progress';

import styles from './styles';
import api from 'helpers/api';
import utils from 'helpers/utils';
import KOLVN from 'static/images/kolvn_office.pgm';
import { setError } from 'modules/ui.reducer';


class Home extends Component {
  constructor() {
    super();

    this.state = {
      anchorPosition: {},
      selected: -1,
      trajectory: [
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
      ],
      map: ''
    }
  }

  componentDidMount() {
    this.onData();
  }

  onChange = (index, pos) => {
    const { trajectory } = this.state;
    const newTrajectory = [...trajectory];
    newTrajectory[index] = { ...newTrajectory[index], ...pos }
    return this.setState({ trajectory: newTrajectory });
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
      anchorPosition: {
        left: e.evt.clientX,
        top: e.evt.clientY + 10,
      },
      selected: index
    });
  }

  onClose = () => {
    return this.setState({ anchorPosition: {}, selected: -1 });
  }

  onSwitch = (e) => {
    const { trajectory, selected } = this.state;
    const editable = e.target.checked || false;
    const newTrajectory = [...trajectory];
    newTrajectory[selected] = { ...newTrajectory[selected], editable }
    return this.setState({ trajectory: newTrajectory });
  }

  onTime = (value) => {
    const { trajectory, selected } = this.state;
    const newTrajectory = [...trajectory];
    const t = 600000 * value / 100;
    newTrajectory[selected] = { ...newTrajectory[selected], t }
    return this.setState({ trajectory: newTrajectory });
  }

  onVelocity = (value) => {
    const { trajectory, selected } = this.state;
    const newTrajectory = [...trajectory];
    const v = 3 * value / 100;
    newTrajectory[selected] = { ...newTrajectory[selected], v }
    return this.setState({ trajectory: newTrajectory });
  }

  onLightAmptitude = (value) => {
    const { trajectory, selected } = this.state;
    const newTrajectory = [...trajectory];
    const l = 10000 * value / 100;
    newTrajectory[selected] = { ...newTrajectory[selected], l }
    return this.setState({ trajectory: newTrajectory });
  }

  render() {
    const { classes } = this.props;
    const { ui: { width } } = this.props;
    const { trajectory, map, anchorPosition, selected } = this.state;

    const selectedNode = trajectory[selected] || {
      editable: false
    }

    return <Grid container spacing={2} justify="center">
      <Grid item xs={11} md={10}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h4">
              <strong>Path Editor</strong>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Map map={map}>
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
          <Popover
            open={selected >= 0}
            anchorPosition={anchorPosition}
            anchorReference="anchorPosition"
            onClose={this.onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Paper className={classes.popover}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Grid container spacing={1} className={classes.noWrap} alignItems="center">
                    <Grid item>
                      <IconButton size="small" color="primary">
                        <SettingsRounded />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <Typography variant="body2"><strong>Settings</strong></Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2} className={classes.noWrap} alignItems="center">
                    <Grid item className={classes.stretch}>
                      <Typography>Editable</Typography>
                    </Grid>
                    <Grid item>
                      <Switch
                        checked={selectedNode.editable}
                        onChange={this.onSwitch}
                        size="small"
                        color="primary"
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2} className={classes.noWrap} alignItems="center">
                    <Grid item className={classes.stretch}>
                      <Typography>Position (x meters, y meters)</Typography>
                    </Grid>
                    <Grid item>
                      <Typography>({utils.prettyNumber(selectedNode.x)}, {utils.prettyNumber(selectedNode.y)})</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                {selectedNode.editable ? <Fragment>
                  <Grid item xs={12}>
                    <Grid container spacing={2} className={classes.noWrap} alignItems="center">
                      <Grid item className={classes.stretch}>
                        <Typography>Time (Max. 10 minutes)</Typography>
                      </Grid>
                      <Grid item>
                        <CircularProgressWithLabel
                          variant="determinate"
                          onChange={this.onTime}
                          value={selectedNode.t * 100 / 600000}
                          label={`${utils.prettyNumber(selectedNode.t / 60000)}`}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={2} className={classes.noWrap} alignItems="center">
                      <Grid item className={classes.stretch}>
                        <Typography>Velocity (Max. 3 m/s)</Typography>
                      </Grid>
                      <Grid item>
                        <CircularProgressWithLabel
                          variant="determinate"
                          onChange={this.onVelocity}
                          value={selectedNode.v * 100 / 3}
                          label={`${utils.prettyNumber(selectedNode.v)}`}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={2} className={classes.noWrap} alignItems="center">
                      <Grid item className={classes.stretch}>
                        <Typography>Light Amptitude (Max 10,000)</Typography>
                      </Grid>
                      <Grid item>
                        <CircularProgressWithLabel
                          variant="determinate"
                          onChange={this.onLightAmptitude}
                          value={selectedNode.l * 100 / 10000}
                          label={`${utils.prettyNumber(selectedNode.l / 1000)}k`}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Fragment> : null}
              </Grid>
            </Paper>
          </Popover>
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