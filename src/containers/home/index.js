import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link as RouteLink, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import ListSubheader from '@material-ui/core/ListSubheader';
import Divider from '@material-ui/core/Divider';


import {
  ArrowForwardIosRounded, EditLocationRounded,
} from '@material-ui/icons';


import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getBotInfo, getMapInfo } from 'modules/bot.reducer';


class Home extends Component {
  constructor() {
    super();

    this.state = {
      data: {
        local_maps: [],
        group_maps: []
      },
      plan: ''
    }
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    const { getBotInfo, getMapInfo, setError } = this.props;
    return getBotInfo().then(({ botId }) => {
      return getMapInfo(botId);
    }).then(data => {
      return this.setState({ data });
    }).catch(er => {
      return setError(er);
    });
  }

  onPlan = (e) => {
    const plan = e.target.value || '';
    return this.setState({ plan });
  }

  render() {
    const { classes } = this.props;
    const { data: { local_maps, group_maps }, plan } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" color="primary">Select a plan</Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id="map">Map</InputLabel>
          <Select
            color="primary"
            label="Map"
            labelId="map"
            value={plan}
            onChange={this.onPlan}
          >
            <ListSubheader>Local maps</ListSubheader>
            {local_maps.length ? local_maps.map(({ _id, location, name }) => <MenuItem
              key={_id}
              value={location}
            >{name}</MenuItem>) : <ListSubheader>No data</ListSubheader>}
            <Divider />
            <ListSubheader>Group maps</ListSubheader>
            {group_maps.length ? group_maps.map(({ _id, location, name }) => <MenuItem
              key={_id}
              value={location}
            >{name}</MenuItem>) : <ListSubheader>No data</ListSubheader>}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} className={classes.noWrap} justify="flex-end">
          <Grid item>
            <Button
              color="primary"
              component={RouteLink}
              to={`/editor/${plan}`}
              startIcon={<EditLocationRounded />}
            >
              <Typography>Edit map</Typography>
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={this.loadData}
              endIcon={<ArrowForwardIosRounded />}
            >
              <Typography>Start cleaning</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  bot: state.bot,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getBotInfo, getMapInfo,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Home)));
