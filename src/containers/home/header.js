import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import Image from 'material-ui-image';

import { UndoRounded, RedoRounded } from '@material-ui/icons';

import styles from './styles';
import logo from 'static/images/logo.png';


class Header extends Component {

  render() {
    const { classes } = this.props;
    const { disabledUndo, disabledRedo, onUndo, onRedo, onSave } = this.props;

    return <Grid container spacing={2} justify="center">
      <Grid item xs={12}>
        <Paper className={classes.paper} elevation={3}>
          <Grid container spacing={2} className={classes.noWrap} justify="space-between" alignItems="center">
            <Grid item xs={4}>
              <Grid container spacing={2}>
                <Grid item className={classes.logo} >
                  <Image src={logo} aspectRatio={300 / 177} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h6" align="center">UV Engine</Typography>
            </Grid>
            <Grid item xs={4}>
              <Grid container spacing={2} alignItems="center" className={classes.noWrap} justify="flex-end">
                <Grid item>
                  <ButtonGroup size="small" >
                    <Button disabled={disabledUndo} onClick={onUndo} startIcon={<UndoRounded />}>
                      <Typography>Undo</Typography>
                    </Button>
                    <Button disabled={disabledRedo} onClick={onRedo} startIcon={<RedoRounded />}>
                      <Typography>Redo</Typography>
                    </Button>
                  </ButtonGroup>
                </Grid>
                <Grid item>
                  <Button variant="contained" color="primary" onClick={onSave}>
                    <Typography>Save</Typography>
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  }
}

Header.defaultProps = {
  disabledUndo: false,
  disabledRedo: false,
  onUndo: () => { },
  onRedo: () => { },
  onSave: () => { }
}

Header.propTypes = {
  disabledUndo: PropTypes.bool,
  disabledRedo: PropTypes.bool,
  onUndo: PropTypes.func,
  onRedo: PropTypes.func,
  onSave: PropTypes.func,
}

export default withStyles(styles)(Header);