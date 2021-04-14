import React, { Component } from 'react';
import { Link as RouteLink } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Image from 'material-ui-image';


import styles from './styles';
import logo from 'static/images/logo.png';


class Logo extends Component {

  render() {
    const { classes } = this.props;

    return <Grid container spacing={2}>
      <Grid item className={classes.logo} component={RouteLink} to="/home" >
        <Image src={logo} aspectRatio={300 / 177} />
      </Grid>
    </Grid>
  }
}

export default withStyles(styles)(Logo);