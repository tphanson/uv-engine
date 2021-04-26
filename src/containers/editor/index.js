import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import dcp from 'deepcopy';
import qte from 'quaternion-to-euler';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';

import { UndoRounded, RedoRounded, GestureRounded } from '@material-ui/icons';

import Card from 'components/card';
import Map from 'components/map';
import POI from 'components/poi';
import Point from 'components/point';
import Bot from 'components/bot';
import Action, { virtualEl } from './action';
import Save from './save';
import Settings from './settings';

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
      bot: {},
      disabled: {
        disabledUndo: true,
        disabledRedo: true,
      },
      settings: {
        angled: true,
        trace: true,
        bot: true
      },
      segment: [0, 0]
    }

    // ROS
    const { api: { localBot: { rosbridge } } } = configs;
    this.ros = new ROS(rosbridge);
  }

  componentDidMount() {
    this.loadData(this.onRos);
  }

  componentWillUnmount() {
    this.unsubscribeAll();
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

  unsubscribeAll = () => {
    if (this.unsubscribeMap) this.unsubscribeMap();
    if (this.unsubscribeBot) this.unsubscribeBot();
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
        // Saving path for the first time
        if (!metadata) return this.onSave();
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
    // Unsubcribe all pre-events
    this.unsubscribeAll();
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
    // Bot
    this.unsubscribeBot = this.ros.bot(msg => {
      const { pose: { position: { x, y }, orientation } } = msg;
      // Compute bot rotation
      const quaternion = [orientation.x, orientation.y, orientation.z, orientation.w];
      const [yaw] = qte(quaternion);
      // Normalize bot position
      const bot = { x, y, yaw }
      return this.setState({ bot });
    });
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

  onSettings = (settings) => {
    return this.setState({ settings });
  }

  /**
   * Map iteraction
   */

  onSmooth = () => {
    const { trajectory } = this.state;
    const newTrajectory = utils.smoothPosition(trajectory);
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

  onEditable = (editable) => {
    const { trajectory, selected } = this.state;
    const newTrajectory = [...trajectory];
    newTrajectory[selected].metadata = { ...newTrajectory[selected].metadata, editable }
    return this.setState({ trajectory: newTrajectory }, this.onHistory);
  }

  onHighlight = (highlight) => {
    const { trajectory, selected } = this.state;
    let start = 0;
    let stop = 0;
    let passed = false;
    if (!highlight) return this.setState({ segment: [start, stop] });
    trajectory.forEach(({ metadata }, index) => {
      if (start >= stop && metadata.editable) {
        if (passed) stop = index;
        else start = index;
      }
      if (index >= selected) passed = true;
    });
    return this.setState({ segment: [start, stop] });
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

  onSave = (callback) => {
    if (typeof callback !== 'function') callback = () => { }
    const { savePath, setError } = this.props;
    const { path, trajectory } = this.state;
    // Extract metadata
    const metadata = trajectory.map((point, index) => {
      const data = dcp(point.metadata);
      data.index = index;
      return data;
    }).filter(data => data.editable).map(re => {
      const data = dcp(re);
      delete data.editable;
      return data;
    });
    // Build new path
    const newPath = dcp(path);
    newPath.poses = trajectory.map(({ metadata, ...others }) => ({ ...others }));
    newPath.metadata = metadata;
    const { mapId } = this.parseParams();
    // Save
    return this.setState({ loading: true }, () => {
      return savePath(mapId, newPath).then(re => {
        // Reload data
        return this.loadData(() => {
          return this.setState({ loading: false }, callback);
        });
      }).catch(er => {
        return this.setState({ loading: false }, () => {
          return setError(er);
        });
      });
    });
  }

  onTest = () => {
    const { setError } = this.props;
    const { segment: [start, stop] } = this.state;
    return this.setState({ loading: true }, () => {
      return this.ros.cleaning(true, start, stop, 1, (er, re) => {
        return this.setState({ loading: false }, () => {
          if (er) return setError(er);
        });
      });
    });
  }

  onCancel = () => {
    const { setError } = this.props;
    return this.ros.cleaning(false, 0, 0, 1, (er, re) => {
      return this.setState({ loading: false }, () => {
        if (er) return setError(er);
      });
    });
  }

  /**
   * Render
   */
  render() {
    const { classes } = this.props;
    const { ui: { width } } = this.props;
    const {
      loading, path, trajectory, map, settings,
      anchorEl, selected, disabled, bot, segment: [start, stop]
    } = this.state;

    const selectedNode = trajectory[selected] || { ...EMPTY_NODE }
    const poses = path.poses || [];

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={2} className={classes.noWrap} alignItems="center">
          <Grid item className={classes.stretch}>
            <Typography variant="h4">Path Editor</Typography>
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={this.onSmooth} startIcon={<GestureRounded />} >
              <Typography>Smooth Path</Typography>
            </Button>
          </Grid>
          <Grid item>
            <ButtonGroup >
              <Button disabled={disabled.disabledUndo} onClick={this.undo} startIcon={<UndoRounded />}>
                <Typography>Undo</Typography>
              </Button>
              <Button disabled={disabled.disabledRedo} onClick={this.redo} startIcon={<RedoRounded />}>
                <Typography>Redo</Typography>
              </Button>
            </ButtonGroup>
          </Grid>
          <Grid item>
            <Save
              loading={loading}
              onCancel={this.onCancel}
              onSave={this.onSave}
              onTest={this.onTest}
              onSaveAndTest={() => this.onSave(this.onTest)}
            />
          </Grid>
          <Grid item>
            <Settings
              value={settings}
              onChange={this.onSettings}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Card className={classes.map}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Map map={map}>
                {/* Tracing points */}
                {settings.trace ? poses.map(({ position: { x, y } }, index) => <Point
                  key={index}
                  variant="secondary"
                  x={x}
                  y={y}
                  r={width / 2000}
                />) : null}
                {/* Bot */}
                {settings.bot ? <Bot {...bot} r={width / 250} /> : null}
                {/* Current path */}
                {trajectory.map(({
                  position: { x, y },
                  metadata: { editable },
                  orientation,
                }, index) => {
                  const quaternion = [orientation.x, orientation.y, orientation.z, orientation.w];
                  const [yaw] = qte(quaternion);
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
                    yaw={yaw}
                    r={width / 1000}
                    onClick={(e) => this.onClick(e, index)}
                    angled={settings.angled}
                    highlight={start <= index && index < stop}
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
        highlight={start <= selected && selected < stop}
        onClose={this.onClose}
        onEditable={this.onEditable}
        onHighlight={this.onHighlight}
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