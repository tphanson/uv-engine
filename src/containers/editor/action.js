import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';

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

  onEditable = (e) => {
    const editable = e.target.checked || false;
    return this.props.onEditable(editable);
  }

  onHighlight = (e) => {
    const highlight = e.target.checked || false;
    return this.props.onHighlight(highlight);
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
    const { anchorEl, editable, highlight, x, y, velocity, light } = this.props;

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
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2} className={classes.noWrap} alignItems="center">
              <Grid item className={classes.stretch}>
                <Typography>Select the segment</Typography>
              </Grid>
              <Grid item>
                <Switch
                  checked={highlight}
                  onChange={this.onHighlight}
                  size="small"
                  color="primary"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Popper>
  }
}

Action.defaultProps = {
  anchorEl: null,
  editable: false,
  highlight: false,
  x: 0,
  y: 0,
  velocity: 0,
  light: 0,
  onClose: () => { },
  onEditable: () => { },
  onHighlight: () => { },
  onTime: () => { },
  onVelocity: () => { },
  onLightAmptitude: () => { },
}

Action.propTypes = {
  anchorEl: PropTypes.object,
  editable: PropTypes.bool,
  highlight: PropTypes.bool,
  x: PropTypes.number,
  y: PropTypes.number,
  velocity: PropTypes.number,
  light: PropTypes.number,
  onClose: PropTypes.func,
  onEditable: PropTypes.func,
  onHighlight: PropTypes.func,
  onVelocity: PropTypes.func,
  onLightAmptitude: PropTypes.func,
}

export default withStyles(styles)(Action);