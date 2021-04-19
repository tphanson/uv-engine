import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import dcp from 'deepcopy';

import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Switch from '@material-ui/core/Switch';

import {
  SettingsRounded, ExploreRounded, LinearScaleRounded,
  AdbRounded,
} from '@material-ui/icons';

import styles from './styles';


class Settings extends Component {
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

  onSwitch = (e) => {
    const { value, onChange } = this.props;
    const newValue = dcp(value);
    newValue[e.target.name] = e.target.checked;
    return onChange(newValue);
  }

  /**
   * Render
   */
  render() {
    const { classes } = this.props;
    const { value } = this.props;
    const { anchorEl } = this.state;

    return <Fragment>
      <IconButton onClick={this.onOpen}>
        <SettingsRounded />
      </IconButton>
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={this.onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <List>
          <ListItem classes={{ secondaryAction: classes.secondaryAction }}>
            <ListItemIcon>
              <ExploreRounded />
            </ListItemIcon>
            <ListItemText primary="Path Orientation" />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={value.angled}
                color="primary"
                onChange={this.onSwitch}
                name="angled"
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem classes={{ secondaryAction: classes.secondaryAction }}>
            <ListItemIcon>
              <LinearScaleRounded />
            </ListItemIcon>
            <ListItemText primary="Tracing Points" />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={value.trace}
                color="primary"
                onChange={this.onSwitch}
                name="trace"
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem classes={{ secondaryAction: classes.secondaryAction }}>
            <ListItemIcon>
              <AdbRounded />
            </ListItemIcon>
            <ListItemText primary="Bot Position" />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={value.bot}
                color="primary"
                onChange={this.onSwitch}
                name="bot"
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Popover>
    </Fragment>
  }
}

Settings.defaultProps = {
  value: {
    angles: false,
    trace: true,
    bot: false,
  },
  onChange: () => { },
}

Settings.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
}

export default withStyles(styles)(Settings);