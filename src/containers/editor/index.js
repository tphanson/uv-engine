import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import qte from 'quaternion-to-euler';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';

import { UndoRounded, RedoRounded } from '@material-ui/icons';

import Card from 'components/card';
import Map from 'components/map';
import POI from 'components/poi';
import Point from 'components/point';
import Bot from 'components/bot';
import Action, { virtualEl } from './action';

import styles from './styles';
import History from 'helpers/history';
import ROS from 'helpers/ros';
import { drawToCanvas, canvas2Image } from 'helpers/pgm';
import { setError } from 'modules/ui.reducer';


const EMPTY_NODE = { orientation: {}, position: {}, metadata: {} }

class Editor extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: virtualEl(),
      selected: -1,
      trajectory: [],
      map: {},
      bot: {},
      disabled: {
        disabledUndo: true,
        disabledRedo: true,
      }
    }

    this.history = new History([]);
  }

  componentDidMount() {
    this.history.watch(disabled => {
      return this.setState({ disabled });
    });

    const ros = new ROS('ws://192.168.123.30:9090');
    // Map
    this.unsubscribeMap = ros.map(msg => {
      const {
        data,
        info: { width, height, resolution, origin: { position: { x, y } } }
      } = msg;
      const origin = { x, y }
      const canvas = drawToCanvas(width, height, 100, data);
      const image = canvas2Image(canvas);
      const map = { width, height, image, origin, resolution }
      return this.setState({ map });
    });
    // Bot
    this.unsubscribeBot = ros.bot(msg => {
      const { pose: { position: { x, y }, orientation } } = msg;
      // Compute bot rotation
      const quaternion = [orientation.x, orientation.y, orientation.z, orientation.w];
      const [yaw] = qte(quaternion);
      // Normalize bot position
      const bot = { x, y, yaw }
      return this.setState({ bot });
    });
    // Path
    this.unsubscribePath = ros.path(msg => {
      const { poses } = msg;
      const trajectory = poses.map(pose => {
        const metadata = { editable: false, t: 0, v: 0, l: 0 }
        return { ...pose, metadata }
      }).filter((pose, index) => (index % 2 === 0)); // Reduce density
      return this.setState({ trajectory });
    });
  }

  componentWillUnmount() {
    this.unsubscribeMap();
    this.unsubscribeBot();
    this.unsubscribePath();
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
    newTrajectory[index].position = { ...newTrajectory[index].position, ...pos }
    return this.setState({ trajectory: newTrajectory }, this.onHistory);
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
    newTrajectory[selected].metadata = { ...newTrajectory[selected].metadata, editable }
    return this.setState({ trajectory: newTrajectory }, this.onHistory);
  }

  onTime = (t) => {
    const { trajectory, selected } = this.state;
    const newTrajectory = [...trajectory];
    newTrajectory[selected].metadata = { ...newTrajectory[selected].metadata, t }
    return this.setState({ trajectory: newTrajectory }, this.onHistory);
  }

  onVelocity = (v) => {
    const { trajectory, selected } = this.state;
    const newTrajectory = [...trajectory];
    newTrajectory[selected].metadata = { ...newTrajectory[selected].metadata, v }
    return this.setState({ trajectory: newTrajectory }, this.onHistory);
  }

  onLightAmptitude = (l) => {
    const { trajectory, selected } = this.state;
    const newTrajectory = [...trajectory];
    newTrajectory[selected].metadata = { ...newTrajectory[selected].metadata, l }
    return this.setState({ trajectory: newTrajectory }, this.onHistory);
  }

  onSave = () => {
    const { trajectory } = this.state;
    console.log(trajectory);
  }

  render() {
    const { classes } = this.props;
    const { ui: { width } } = this.props;
    const { trajectory, map, bot, anchorEl, selected, disabled } = this.state;

    const selectedNode = trajectory[selected] || { ...EMPTY_NODE }

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card className={classes.map}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container spacing={2} alignItems="center" className={classes.noWrap} justify="flex-end">
                <Grid item>
                  <ButtonGroup size="small" >
                    <Button disabled={disabled.disabledUndo} onClick={this.undo} startIcon={<UndoRounded />}>
                      <Typography>Undo</Typography>
                    </Button>
                    <Button disabled={disabled.disabledRedo} onClick={this.redo} startIcon={<RedoRounded />}>
                      <Typography>Redo</Typography>
                    </Button>
                  </ButtonGroup>
                </Grid>
                <Grid item>
                  <Button variant="contained" color="primary" onClick={this.onSave}>
                    <Typography style={{ color: '#ffffff' }} variant="body2">Save</Typography>
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Map map={map} flipped>
                <Bot {...bot} r={width / 150} />
                {trajectory.map(({
                  position: { x, y },
                  metadata: { editable }
                }, index) => {
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
                    r={width / 500}
                    onClick={(e) => this.onClick(e, index)}
                  />
                })}
              </Map>
            </Grid>
          </Grid>
        </Card>
      </Grid>
      <Action
        anchorEl={anchorEl}
        editable={selectedNode.metadata.editable}
        x={selectedNode.position.x}
        y={selectedNode.position.y}
        time={selectedNode.metadata.t}
        velocity={selectedNode.metadata.v}
        light={selectedNode.metadata.l}
        onClose={this.onClose}
        onSwitch={this.onSwitch}
        onTime={this.onTime}
        onVelocity={this.onVelocity}
        onLightAmptitude={this.onLightAmptitude}
      />
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
)(withStyles(styles)(Editor)));