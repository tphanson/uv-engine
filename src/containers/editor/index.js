import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import dcp from 'deepcopy';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import { UndoRounded, RedoRounded, GestureRounded } from '@material-ui/icons';

import Card from 'components/card';
import Map from 'components/map';
import POI from 'components/poi';
import Point from 'components/point';
import Action, { virtualEl } from './action';

import styles from './styles';
import configs from 'configs';
import utils from 'helpers/utils';
import History from 'helpers/history';
import ROS from 'helpers/ros';
import { drawToCanvas, canvas2Image } from 'helpers/pgm';
import { setError } from 'modules/ui.reducer';
import { getMap, savePath } from 'modules/bot.reducer';


const EMPTY_NODE = { orientation: {}, position: {}, metadata: {} }

class Editor extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: virtualEl(),
      loading: false,
      selected: -1,
      trajectory: [],
      map: {},
      path: {},
      disabled: {
        disabledUndo: true,
        disabledRedo: true,
      }
    }

    // ROS
    const { api: { localBot: { rosbridge } } } = configs;
    this.ros = new ROS(rosbridge);
  }

  componentDidMount() {
    this.loadData(this.onRos);
  }

  componentWillUnmount() {
    if (this.unsubscribeMap) this.unsubscribeMap();
    // if (this.unsubscribeMap) this.unsubscribePath();
  }

  /**
   * Load & watch data
   */

  parseParams = () => {
    const { match: { params: { botId, mapId, pathId } } } = this.props;
    return {
      botId: decodeURIComponent(botId),
      mapId: decodeURIComponent(mapId),
      pathId: decodeURIComponent(pathId)
    };
  }

  loadData = (callback = () => { }) => {
    const { getMap, setError } = this.props;
    const { botId, mapId, pathId } = this.parseParams();
    return getMap(botId, mapId, pathId).then(({ loaded, path }) => {
      if (!loaded) return setError('Cannot load the desired map. The system will try to use the current map on Ohmni\'s local.');
      const { poses, metadata } = path;
      const trajectory = poses.map((pose, i) => {
        let data = { editable: false, time: 0, velocity: 0, light: 0 }
        // Make sure always there is one segment at least
        if (i === 0) data = { editable: true, time: 0, velocity: 0.018, light: 2000 }
        if (i === poses.length - 1) data = { editable: true, time: 0, velocity: 0.018, light: 2000 }
        // Load saved segments
        if (metadata) metadata.forEach(({ index, ...others }) => {
          if (i === index) data = { editable: true, ...others }
        });
        return { ...pose, metadata: data }
      });
      return this.setState({ trajectory, path }, () => {
        // Editing History
        this.history = new History(trajectory);
        this.history.watch(disabled => {
          return this.setState({ disabled });
        });
        // Callback
        return callback();
      });
    }).catch(er => {
      return setError(er);
    });
  }

  onRos = () => {
    // Map
    this.unsubscribeMap = this.ros.map(msg => {
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
    // Path
    // this.unsubscribePath = this.ros.path(msg => {
    //   const { poses } = msg;
    //   const trajectory = poses.map(pose => {
    //     const metadata = { editable: false, time: 0, velocity: 0, light: 0 }
    //     return { ...pose, metadata }
    //   }).filter((pose, index) => (index % 2 === 0)); // Reduce density
    //   return this.setState({ trajectory });
    // });
  }

  /**
   * History iteraction
   */

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

  /**
   * Map iteraction
   */

  onSmooth = () => {
    const { trajectory } = this.state;
    const newTrajectory = utils.smoothPath(trajectory);
    return this.setState({ trajectory: newTrajectory }, this.onHistory);
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

  onTime = (time) => {
    const { trajectory, selected } = this.state;
    const newTrajectory = [...trajectory];
    newTrajectory[selected].metadata = { ...newTrajectory[selected].metadata, time }
    return this.setState({ trajectory: newTrajectory }, this.onHistory);
  }

  onVelocity = (velocity) => {
    const { trajectory, selected } = this.state;
    const newTrajectory = [...trajectory];
    newTrajectory[selected].metadata = { ...newTrajectory[selected].metadata, velocity }
    return this.setState({ trajectory: newTrajectory }, this.onHistory);
  }

  onLightAmptitude = (light) => {
    const { trajectory, selected } = this.state;
    const newTrajectory = [...trajectory];
    newTrajectory[selected].metadata = { ...newTrajectory[selected].metadata, light }
    return this.setState({ trajectory: newTrajectory }, this.onHistory);
  }

  onSave = () => {
    const { savePath, setError } = this.props;
    const { path, trajectory } = this.state;
    const metadata = trajectory.map((point, index) => {
      const data = dcp(point.metadata);
      data.index = index;
      return data;
    }).filter(data => data.editable).map(re => {
      const data = dcp(re);
      delete data.editable;
      return data;
    });
    const newPath = dcp(path);
    newPath.poses = trajectory;
    newPath.metadata = metadata;
    const { mapId } = this.parseParams();
    return this.setState({ loading: true }, () => {
      return savePath(mapId, newPath).then(re => {
        return this.loadData(() => {
          return this.setState({ loading: false });
        });
      }).catch(er => {
        return this.setState({ loading: false }, () => {
          return setError(er);
        });
      });
    });
  }

  /**
   * Render
   */
  render() {
    const { classes } = this.props;
    const { ui: { width } } = this.props;
    const { loading, path, trajectory, map, anchorEl, selected, disabled } = this.state;

    const selectedNode = trajectory[selected] || { ...EMPTY_NODE }
    const poses = path.poses || []

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={2} className={classes.noWrap} alignItems="center">
          <Grid item className={classes.stretch}>
            <Typography variant="h4">Path Editor</Typography>
          </Grid>
          <Grid item>
            <Grid container spacing={2} alignItems="center" className={classes.noWrap} justify="flex-end">
              <Grid item>
                <Button variant="outlined" onClick={this.onSmooth} startIcon={<GestureRounded />} >
                  <Typography>Smooth Path</Typography>
                </Button>
              </Grid>
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
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.onSave}
                  startIcon={loading ? <CircularProgress size={17} /> : null}
                  disabled={loading}
                >
                  <Typography style={{ color: '#ffffff' }} variant="body2">Save</Typography>
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Card className={classes.map}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Map map={map}>
                {poses.map(({ position: { x, y } }, index) => <Point
                  key={index}
                  variant="secondary"
                  x={x}
                  y={y}
                  r={width / 2000}
                />)}
                {trajectory.map(({
                  position: { x, y },
                  metadata: { editable }
                }, index) => {
                  if (editable) return <POI
                    key={index}
                    x={x}
                    y={y}
                    r={width / 500}
                    onClick={(e) => this.onClick(e, index)}
                    onChange={pos => this.onChange(index, pos)}
                  />
                  return <Point
                    key={index}
                    x={x}
                    y={y}
                    r={width / 1000}
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
        time={selectedNode.metadata.time}
        velocity={selectedNode.metadata.velocity}
        light={selectedNode.metadata.light}
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
  bot: state.bot,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getMap, savePath,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Editor)));