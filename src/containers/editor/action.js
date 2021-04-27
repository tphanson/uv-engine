import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';

import { SettingsRounded, CloseRounded } from '@material-ui/icons';

import Drain from 'components/drain';

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

const MAX_TIME = 120000;
const MAX_VELOCITY = 3;
const MAX_LIGHT = 10000;

class Action extends Component {

  onEditable = (e) => {
    const editable = e.target.checked || false;
    return this.props.onEditable(editable);
  }

  onTime = (e) => {
    const time = parseFloat(e.target.value) || 0;
    return this.props.onTime(time);
  }

  onVelocity = (e) => {
    const velocity = parseFloat(e.target.value) || 0;
    return this.props.onVelocity(velocity);
  }

  onLightAmptitude = (e) => {
    const light = parseFloat(e.target.value) || 0;
    return this.props.onVelocity(light);
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
                  onChange={this.onEditable}
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
              <TextField
                variant="outlined"
                label={`Time (Max. ${utils.prettyNumber(MAX_TIME)} miliseconds)`}
                value={time}
                onChange={this.onTime}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                label={`Velocity (Max. ${MAX_VELOCITY} m/s)`}
                value={velocity}
                onChange={this.onVelocity}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                label={`Light Amptitude (Max. ${utils.prettyNumber(MAX_LIGHT)} units)`}
                value={light}
                onChange={this.onLightAmptitude}
                size="small"
                fullWidth
              />
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
  onEditable: () => { },
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
  onEditable: PropTypes.func,
  onTime: PropTypes.func,
  onVelocity: PropTypes.func,
  onLightAmptitude: PropTypes.func,
}

export default withStyles(styles)(Action);