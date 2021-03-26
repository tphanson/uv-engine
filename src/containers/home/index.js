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
import api from 'helpers/api';
import KOLVN from 'static/images/kolvn_office.pgm';
import { setError } from 'modules/ui.reducer';


class Home extends Component {
  constructor() {
    super();

    this.state = {
      trajectory: [{ x: 50, y: 50 }, { x: 50, y: 50 }],
      map: ''
    }
  }

  componentDidMount() {
    this.onData();
  }

  onChange = (index, pos) => {
    const { trajectory } = this.state;
    const newTrajectory = [...trajectory];
    newTrajectory[index] = pos
    return this.setState({ trajectory: newTrajectory });
  }

  onData = () => {
    const { setError } = this.props;
    return api.get(KOLVN).then(data => {
      return this.setState({ map: data });
    }).catch(er => {
      return setError(er);
    });
  }

  render() {
    // const { classes } = this.props;
    const { trajectory, map } = this.state;

    return <Grid container spacing={2} justify="center">
      <Grid item xs={11} md={10}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h4">
              <strong>Path Editor</strong>
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Map map={map}>
              {trajectory.map(({ x, y }, index) => <POI
                key={index}
                x={x}
                y={y}
                onChange={pos => this.onChange(index, pos)}
              />)}
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
  setError,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Home)));