import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

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


class Save extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: null
    }
  }

  onOpen = (e) => {
    return this.setState({ anchorEl: e.target });
  }

  onClose = () => {
    return this.setState({ anchorEl: null });
  }

  /**
   * Render
   */
  render() {
    // const { classes } = this.props;
    const { loading, disabled, onSave, onTest, onSaveAndTest } = this.props;
    const { anchorEl } = this.state;

    return <Fragment>
      <ButtonGroup variant="contained" color="primary" disabled={loading || disabled}>
        <Button
          variant="contained"
          color="primary"
          onClick={onSave}
          startIcon={loading ? <CircularProgress size={17} /> : null}
        >
          <Typography>Save</Typography>
        </Button>
        <Button onClick={this.onOpen}>
          <ArrowDropDownRounded />
        </Button>
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
          <ListItem button onClick={onTest} disabled>
            <ListItemIcon>
              <AllInclusiveRounded />
            </ListItemIcon>
            <ListItemText primary="Test Only" />
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
  onSave: () => { },
  onTest: () => { },
  onSaveAndTest: () => { },
}

Save.propTypes = {
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  onSave: PropTypes.func,
  onTest: PropTypes.func,
  onSaveAndTest: PropTypes.func,
}

export default withStyles(styles)(Save);