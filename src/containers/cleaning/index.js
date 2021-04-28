import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import qte from 'quaternion-to-euler';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import { PlayCircleOutlineRounded } from '@material-ui/icons';

import Card from 'components/card';
import Map from 'components/map';
import POI from 'components/poi';
import Point from 'components/point';
import Bot from 'components/bot';

import styles from './styles';
import configs from 'configs';
import ROS from 'helpers/ros';
import PGM from 'helpers/pgm';
import { setError } from 'modules/ui.reducer';
import { getCurrentMap } from 'modules/bot.reducer';


class Cleaning extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      trajectory: [],
      map: {},
      path: {},
      bot: {},
    }
    const { api: { localBot: { rosbridge } } } = configs;
    this.ros = new ROS(rosbridge);
  }

  componentDidMount() {
    this.loadData(this.onRos);
  }

  componentWillUnmount() {
    if (this.unsubscribeBot) this.unsubscribeBot();
  }

  /**
   * Load & watch data
   */
  loadData = (callback = () => { }) => {
    const { getCurrentMap, setError } = this.props;

    let map = null;
    let info = null; // map info
    let path = null;
    return getCurrentMap().then(data => {
      // Assign data
      info = data.info;
      path = data.path;
      // Parse map
      const pgm = new PGM(data.map);
      return pgm.draw();
    }).then(({ width, height, image }) => {
      // Build map object
      map = {
        width, height, image,
        origin: { x: info.origin[0], y: info.origin[1] },
        resolution: info.resolution
      }
      // Parse path
      const { poses, metadata } = path;
      const trajectory = poses.map((pose, i) => {
        let data = { editable: false, time: 0, velocity: 0, light: 0 }
        if (metadata) metadata.forEach(({ index, ...others }) => {
          if (i === index) data = { editable: true, ...others }
        });
        return { ...pose, metadata: data }
      });
      return this.setState({ map, trajectory, path }, callback);
    }).catch(er => {
      return setError(er);
    });
  }

  onRos = () => {
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

  onClean = () => {
    const { setError } = this.props;
    return this.setState({ loading: true }, () => {
      return this.ros.cleaning(true, 0, 0, 1, (er, re) => {
        if (er) return this.setState({ loading: false }, () => {
          return setError(er);
        });
        return this.setState({ loading: false });
      });
    });
  }

  onCancel = () => {
    return this.ros.cleaning(false, 0, 0, 1, (er, re) => {
      return this.setState({ loading: false });
    });
  }

  /**
   * Render
   */
  render() {
    const { classes } = this.props;
    const { ui: { width } } = this.props;
    const { trajectory, map, bot, loading } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={2} className={classes.noWrap} alignItems="center">
          <Grid item className={classes.stretch}>
            <Typography variant="h4">Cleaning Monitor</Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color={loading ? 'default' : 'primary'}
              onClick={loading ? this.onClean : this.onCancel}
              startIcon={loading ? <CircularProgress size={17} /> : <PlayCircleOutlineRounded />}
            >
              <Typography>{loading ? 'Stop' : 'Start Cleaning'}</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Card className={classes.map}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Map map={map}>
                {trajectory.map(({ position: { x, y }, metadata: { editable }, orientation }, index) => {
                  const quaternion = [orientation.x, orientation.y, orientation.z, orientation.w];
                  const [yaw] = qte(quaternion);
                  if (editable) return <POI key={index} x={x} y={y} r={width / 500} />
                  return <Point key={index} x={x} y={y} r={width / 1000} yaw={yaw} />
                })}
                <Bot {...bot} r={width / 250} />
              </Map>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  bot: state.bot,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getCurrentMap,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Cleaning)));