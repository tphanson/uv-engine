import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';

import { LockRounded } from '@material-ui/icons';

import Card from 'components/card';
import Drain from 'components/drain';
import PrivateRoute from './privateRoute';
import GoogleAccount from './googleAccount';
import OhmnilabsAccount from './ohmnilabsAccount';

import styles from './styles';


class Auth extends Component {

  render() {
    const { classes } = this.props;

    return <Grid container spacing={2} justify="center">
      <Grid item xs={11} md={10}>
        <Grid container spacing={2} justify="center">
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <Grid container spacing={2} justify="center">
                <Grid item xs={12}>
                  <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
                    <Grid item>
                      <IconButton size="small">
                        <LockRounded />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <Typography variant="h4">Login</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Drain small />
                </Grid>
                <Grid item xs={12}>
                  <GoogleAccount />
                </Grid>
                <Grid item xs={12} >
                  <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
                    <Grid item className={classes.stretch}>
                      <Divider />
                    </Grid>
                    <Grid item>
                      <Typography variant="h6">Or</Typography>
                    </Grid>
                    <Grid item className={classes.stretch}>
                      <Divider />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <OhmnilabsAccount />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
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
)(withStyles(styles)(Auth)));


export { PrivateRoute };