import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { } from '@material-ui/icons';

import Map from 'components/map';
import POI from 'components/poi';

import styles from './styles';


class Home extends Component {
  constructor() {
    super();

    this.state = {
      x: 50,
      y: 50
    }
  }

  onChange = ({ x, y }) => {
    return this.setState({ x, y });
  }

  render() {
    // const { classes } = this.props;
    const { x, y } = this.state;

    return <Grid container spacing={2} justify="center">
      <Grid item xs={11} md={10}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h4">
              <strong>Path Editor</strong>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Map>
              <POI x={x} y={y} onChange={this.onChange} />
            </Map>
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
)(withStyles(styles)(Home)));