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

import Card from 'components/card';
import Map from 'components/map';
import POI from 'components/poi';
import Point from 'components/point';
import Bot from 'components/bot';

import styles from './styles';
import configs from 'configs';
import utils from 'helpers/utils';
import ROS from 'helpers/ros';
import { drawToCanvas, canvas2Image } from 'helpers/pgm';
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
    if (this.unsubscribeMap) this.unsubscribeMap();
    if (this.unsubscribeBot) this.unsubscribeBot();
  }

  /**
   * Load & watch data
   */
  loadData = (callback = () => { }) => {
    const { getCurrentMap, setError } = this.props;
    return getCurrentMap().then(({ loaded, path }) => {
      if (!loaded) return setError('Cannot load the desired map. The system will try to use the current map on Ohmni\'s local.');
      const { poses, metadata } = path;
      const trajectory = utils.smoothPath(poses).map((pose, i) => {
        let data = { editable: false, time: 0, velocity: 0, light: 0 }
        if (metadata) metadata.forEach(({ index, ...others }) => {
          if (i === index) data = { editable: true, ...others }
        });
        return { ...pose, metadata: data }
      });
      return this.setState({ trajectory, path }, callback);
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
    return this.setState({ loading: true }, () => {
      return this.ros.startCleaning(re => {
        return this.setState({ loading: false });
      });
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
              color="primary"
              onClick={this.onClean}
              startIcon={loading ? <CircularProgress size={17} /> : null}
              disabled={loading}
            >
              <Typography style={{ color: '#ffffff' }} variant="body2">{loading ? 'Cleaning' : 'Start'}</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Card className={classes.map}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Map map={map}>
                {trajectory.map(({ position: { x, y }, metadata: { editable } }, index) => {
                  if (editable) return <POI key={index} x={x} y={y} r={width / 500} />
                  return <Point key={index} x={x} y={y} r={width / 1000} />
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