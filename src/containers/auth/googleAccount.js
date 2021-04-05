import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';

import { } from '@material-ui/icons';

import styles from './styles';
import G from 'static/images/g-logo.png';


class GoogleAccount extends Component {

  render() {
    const { classes } = this.props;

    return <Grid container spacing={2} justify="center">
      <Grid item xs={12}>
        <Button
          variant="contained"
          startIcon={<Avatar src={G} className={classes.avatar} />}
          fullWidth
        >
          <Typography>Login with Google</Typography>
        </Button>
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
)(withStyles(styles)(GoogleAccount)));
