import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';

import { UndoRounded, RedoRounded } from '@material-ui/icons';

import Logo from 'components/logo';

import styles from './styles';


class Header extends Component {

  render() {
    const { classes } = this.props;
    const { disabledUndo, disabledRedo, onUndo, onRedo, onSave } = this.props;

    return <Grid container spacing={2} justify="center">
      <Grid item xs={12}>
        <Paper className={classes.paper} elevation={3}>
          <Grid container spacing={2} className={classes.noWrap} justify="space-between" alignItems="center">
            <Grid item xs={4}>
              <Logo />
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
                    <Typography style={{ color: '#ffffff' }} variant="body2">Save</Typography>
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