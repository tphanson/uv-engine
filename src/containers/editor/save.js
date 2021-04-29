import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Popover from '@material-ui/core/Popover';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import {
  ArrowDropDownRounded, SaveRounded, FlightTakeoffRounded,
  AllInclusiveRounded,
} from '@material-ui/icons';

import styles from './styles';
import utils from 'helpers/utils';


class Save extends Component {
  constructor() {
    super();

    this.state = {
      timer: 0,
      anchorEl: null
    }
  }

  componentDidMount() {
    this.startTimer();
  }

  componentDidUpdate(prevProps) {
    const { loading: prevLoading } = prevProps;
    const { loading } = this.props;
    if (!isEqual(prevLoading, loading)) {
      return this.startTimer();
    }
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  onOpen = (e) => {
    return this.setState({ anchorEl: e.target });
  }

  onClose = () => {
    return this.setState({ anchorEl: null });
  }

  onCancel = () => {
    const { onCancel } = this.props;
    return this.setState({ timer: 0 }, onCancel);
  }

  startTimer = () => {
    this.stopTimer();
    const { loading } = this.props;
    if (loading) this.timer = setInterval(() => {
      const { timer } = this.state;
      return this.setState({ timer: timer + 1 });
    }, 1000);
  }

  stopTimer = () => {
    if (this.timer) return clearInterval(this.timer);
  }

  /**
   * Render
   */
  render() {
    // const { classes } = this.props;
    const {
      loading, disabled,
      onSave, onTest, onSaveAndTest
    } = this.props;
    const { anchorEl, timer } = this.state;

    return <Fragment>
      <ButtonGroup variant="contained" color="primary" disabled={disabled}>
        <Button
          variant="contained"
          color={loading ? 'default' : 'primary'}
          onClick={loading ? this.onCancel : onSave}
          startIcon={loading ? <CircularProgress size={17} /> : <SaveRounded />}
        >
          <Typography>{loading ? `Cancel (${utils.prettySeconds(timer)})` : 'Save'}</Typography>
        </Button>
        {loading ? null : <Button onClick={this.onOpen} >
          <ArrowDropDownRounded />
        </Button>}
      </ButtonGroup>
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={this.onClose}
        onClick={this.onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <List>
          <ListItem button onClick={onSave}>
            <ListItemIcon>
              <SaveRounded />
            </ListItemIcon>
            <ListItemText primary="Save Only" secondary="Default" />
          </ListItem>
          <ListItem button onClick={onTest}>
            <ListItemIcon>
              <AllInclusiveRounded />
            </ListItemIcon>
            <ListItemText primary="Test Only" secondary={<Fragment>
              <Typography style={{ fontSize: 10 }}>Hold ctrl (or cmd on Mac) and click to choose Start/Stop POI.</Typography>
              <Typography style={{ fontSize: 10 }}>Press Esc to cancel.</Typography>
            </Fragment>} />
          </ListItem>
          <ListItem button onClick={onSaveAndTest}>
            <ListItemIcon>
              <FlightTakeoffRounded />
            </ListItemIcon>
            <ListItemText primary="Save & Test" />
          </ListItem>
        </List>
      </Popover>
    </Fragment>
  }
}

Save.defaultProps = {
  loading: false,
  disabled: false,
  onCancel: () => { },
  onSave: () => { },
  onTest: () => { },
  onSaveAndTest: () => { },
}

Save.propTypes = {
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  onCancel: PropTypes.func,
  onSave: PropTypes.func,
  onTest: PropTypes.func,
  onSaveAndTest: PropTypes.func,
}

export default withStyles(styles)(Save);