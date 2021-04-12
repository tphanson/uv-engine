import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import IconButton from '@material-ui/core/IconButton';

import { SettingsRounded, CloseRounded } from '@material-ui/icons';

import Drain from 'components/drain';
import CircularProgressWithLabel from 'components/progress';

import styles from './styles';
import utils from 'helpers/utils';


export function virtualEl(x = 0, y = 0) {
  return {
    open: Boolean(x || y),
    clientWidth: 0, clientHeight: 0,
    getBoundingClientRect: () => ({
      width: 400, height: 400,
      top: y, right: x, bottom: y, left: x
    }),
  }
}

const MAX_TIME = 600000;
const MAX_VELOCITY = 3;
const MAX_LIGHT = 10000;

class Action extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: virtualEl(),
      selected: -1,
    }
  }


  onClick = (e, index) => {
    return this.setState({
      anchorEl: virtualEl(e.evt.clientX, e.evt.clientY),
      selected: index
    });
  }

  onSwitch = (e) => {
    const editable = e.target.checked || false;
    return this.props.onSwitch(editable);
  }

  onTime = (value) => {
    const time = MAX_TIME * value / 100;
    return this.props.onTime(time);
  }

  onVelocity = (value) => {
    const velocity = MAX_VELOCITY * value / 100;
    return this.props.onVelocity(velocity);
  }

  onLightAmptitude = (value) => {
    const light = MAX_LIGHT * value / 100;
    return this.props.onLightAmptitude(light);
  }

  onClose = () => {
    const { onClose } = this.props;
    window.document.body.style.overflowY = 'auto';
    return onClose();
  }

  render() {
    const { classes } = this.props;
    const { anchorEl, editable, x, y, time, velocity, light } = this.props;

    return <Popper
      open={anchorEl.open}
      anchorEl={anchorEl}
      popperOptions={{
        onCreate: () => { window.document.body.style.overflowY = 'hidden' }
      }}
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
              <Grid item className={classes.stretch}>
                <Typography variant="body2"><strong>Settings</strong></Typography>
              </Grid>
              <Grid item>
                <IconButton onClick={this.onClose} size="small" edge="end">
                  <CloseRounded />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Drain small />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2} className={classes.noWrap} alignItems="center">
              <Grid item className={classes.stretch}>
                <Typography>Editable</Typography>
              </Grid>
              <Grid item>
                <Switch
                  checked={editable}
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
                <Typography>({utils.prettyNumber(x)}, {utils.prettyNumber(y)})</Typography>
              </Grid>
            </Grid>
          </Grid>
          {editable ? <Fragment>
            <Grid item xs={12}>
              <Grid container spacing={2} className={classes.noWrap} alignItems="center">
                <Grid item className={classes.stretch}>
                  <Typography>Time (Max. 10 minutes)</Typography>
                </Grid>
                <Grid item>
                  <CircularProgressWithLabel
                    variant="determinate"
                    onChange={this.onTime}
                    value={time * 100 / MAX_TIME}
                    label={`${utils.prettyNumber(time / 60000)}'`}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2} className={classes.noWrap} alignItems="center">
                <Grid item className={classes.stretch}>
                  <Typography>{`Velocity (Max. ${MAX_VELOCITY} m/s)`}</Typography>
                </Grid>
                <Grid item>
                  <CircularProgressWithLabel
                    variant="determinate"
                    onChange={this.onVelocity}
                    value={velocity * 100 / MAX_VELOCITY}
                    label={`${utils.prettyNumber(velocity)} m/s`}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2} className={classes.noWrap} alignItems="center">
                <Grid item className={classes.stretch}>
                  <Typography>{`Light Amptitude (Max ${MAX_LIGHT})`}</Typography>
                </Grid>
                <Grid item>
                  <CircularProgressWithLabel
                    variant="determinate"
                    onChange={this.onLightAmptitude}
                    value={light * 100 / MAX_LIGHT}
                    label={`${utils.prettyNumber(light / 1000)}k`}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Fragment> : null}
        </Grid>
      </Paper>
    </Popper>
  }
}

Action.defaultProps = {
  anchorEl: null,
  editable: false,
  x: 0,
  y: 0,
  time: 0,
  velocity: 0,
  light: 0,
  onClose: () => { },
  onSwitch: () => { },
  onTime: () => { },
  onVelocity: () => { },
  onLightAmptitude: () => { },
}

Action.propTypes = {
  anchorEl: PropTypes.object,
  editable: PropTypes.bool,
  x: PropTypes.number,
  y: PropTypes.number,
  time: PropTypes.number,
  velocity: PropTypes.number,
  light: PropTypes.number,
  onClose: PropTypes.func,
  onSwitch: PropTypes.func,
  onTime: PropTypes.func,
  onVelocity: PropTypes.func,
  onLightAmptitude: PropTypes.func,
}

export default withStyles(styles)(Action);