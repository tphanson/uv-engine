import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';

import { PersonRounded, VpnKeyRounded } from '@material-ui/icons';

import styles from './styles';
import O from 'static/images/o-logo.png';
import { setError } from 'modules/ui.reducer';
import { loginOhmnilabs } from 'modules/auth.reducer';


class OhmnilabsAccount extends Component {
  constructor() {
    super();

    this.state = {
      username: '',
      password: ''
    }
  }

  onUsername = (e) => {
    const username = e.target.value || '';
    return this.setState({ username });
  }

  onPassword = (e) => {
    const password = e.target.value || '';
    return this.setState({ password });
  }

  login = () => {
    const { setError, loginOhmnilabs, history } = this.props;
    const { username, password } = this.state;
    return loginOhmnilabs(username, password).then(re => {
      const { location: { state } } = this.props;
      const { from: { pathname } } = state || { from: { pathname: '/home' } }
      return history.push(pathname);
    }).catch(er => {
      return setError(er);
    });
  }

  render() {
    const { classes } = this.props;
    const { username, password } = this.state;

    return <Grid container spacing={2} justify="center">
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          size="small"
          color="primary"
          label="Username"
          onChange={this.onUsername}
          value={username}
          InputProps={{
            startAdornment: <IconButton edge="start">
              <PersonRounded />
            </IconButton>
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          size="small"
          color="primary"
          label="Password"
          type="password"
          onChange={this.onPassword}
          value={password}
          InputProps={{
            startAdornment: <IconButton edge="start">
              <VpnKeyRounded />
            </IconButton>
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="contained"
          startIcon={<Avatar src={O} className={classes.avatar} />}
          onClick={this.login}
          fullWidth
        >
          <Typography>Login with Ohmnilabs</Typography>
        </Button>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  auth: state.auth,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  loginOhmnilabs,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(OhmnilabsAccount)));
