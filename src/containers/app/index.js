import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import Drain from 'components/drain';

// Static component
import Header from 'containers/header';
import Auth, { PrivateRoute } from 'containers/auth';
import Home from 'containers/home';
import Editor from 'containers/editor';
import UiUx from 'containers/uiux';
import NotFound from 'containers/404';

// CSS
import theme from 'static/styles/theme';
import 'static/styles/index.css';
import styles from './styles';


class App extends Component {

  render() {
    const { classes } = this.props;
    return <ThemeProvider theme={theme}>
      <Grid container spacing={2} justify="center">
        <Grid item xs={12} className={classes.safe} /> {/* Safe space */}
        <Grid item xs={11} md={10}>
          <Header />
        </Grid>
        <Grid item xs={12}>
          <Drain />
        </Grid>
        <Grid item xs={11} md={10}>
          <Switch>
            <Redirect exact from="/" to="/home" />
            <Route exact path='/auth' component={Auth} />
            <PrivateRoute exact path='/home' component={Home} />
            <PrivateRoute exact path='/editor' component={Editor} />
            <Route path='*' component={NotFound} />
          </Switch>
        </Grid>
        {/* Application */}
        <Grid item xs={12} >
          <UiUx />
        </Grid>
        <Grid item xs={12}>
          <Drain small />
        </Grid>
      </Grid>
    </ThemeProvider >
  }
}

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(App)));