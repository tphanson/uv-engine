import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link as RouterLink, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';

import {
  MenuRounded, TimelineRounded, PersonRounded,
  ExitToAppRounded, LockRounded,
} from '@material-ui/icons';

import Card from 'components/card';
import Logo from 'components/logo';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { checkLogin, logout } from 'modules/auth.reducer';


class Header extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: null
    }
  }

  componentDidMount() {
    const { checkLogin } = this.props;
    return checkLogin();
  }

  onOpen = (e) => {
    return this.setState({ anchorEl: e.target });
  }

  onClose = () => {
    return this.setState({ anchorEl: null });
  }

  onAuth = () => {
    const { history } = this.props;
    return history.push('/auth');
  }

  onLogout = () => {
    const { setError, logout, history } = this.props;
    return logout().then(re => {
      return history.push('/auth');
    }).catch(er => {
      return setError(er);
    });
  }

  render() {
    const { classes } = this.props;
    const { auth: { logged, username } } = this.props;
    const { anchorEl } = this.state;

    return <Grid container spacing={2} justify="center">
      <Grid item xs={11} md={10}>
        <Card>
          <Grid container spacing={5} className={classes.noWrap} justify="space-between" alignItems="center">
            <Grid item className={classes.stretch}>
              <Logo />
            </Grid>
            <Grid item>
              <Typography variant="h6" align="center">UV Engine</Typography>
            </Grid>
            {logged ? <Grid item>
              <IconButton size="small" edge="end" color="primary" onClick={this.onOpen}>
                <MenuRounded />
              </IconButton>
              <Popover
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={this.onClose}
                onClick={this.onClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
              >
                <List>
                  <ListItem button component={RouterLink} to={'/home'}>
                    <ListItemIcon>
                      <TimelineRounded />
                    </ListItemIcon>
                    <ListItemText primary="Path Editor" />
                  </ListItem>
                  <Divider />
                  <ListItem classes={{ secondaryAction: classes.secondaryAction }}>
                    <ListItemIcon>
                      <PersonRounded />
                    </ListItemIcon>
                    <ListItemText primary="Account" secondary={username} />
                    <ListItemSecondaryAction>
                      <Button
                        endIcon={<ExitToAppRounded />}
                        onClick={this.onLogout}
                        color="primary"
                      >
                        <Typography>Logout</Typography>
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Popover>
            </Grid> : <Grid item>
              <Button color="primary" startIcon={<LockRounded />} onClick={this.onAuth}>
                <Typography>Login</Typography>
              </Button>
            </Grid>}
          </Grid>
        </Card>
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
  checkLogin, logout,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Header)));
