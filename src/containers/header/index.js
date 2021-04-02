import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import { MenuRounded } from '@material-ui/icons';

import Card from 'components/card';
import Logo from 'components/logo';

import styles from './styles';


class Header extends Component {

  render() {
    const { classes } = this.props;

    return <Grid container spacing={2} justify="center">
      <Grid item xs={11}>
        <Card>
          <Grid container spacing={5} className={classes.noWrap} justify="space-between" alignItems="center">
            <Grid item className={classes.stretch}>
              <Logo />
            </Grid>
            <Grid item>
              <Typography variant="h6" align="center">UV Engine</Typography>
            </Grid>
            <Grid item>
              <IconButton size="small" edge="end" color="primary">
                <MenuRounded />
              </IconButton>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Header)));
