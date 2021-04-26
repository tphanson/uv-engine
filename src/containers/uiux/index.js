import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

import { } from '@material-ui/icons';

import styles from './styles';
import { setScreen, setScroll, unsetError } from 'modules/ui.reducer';


class UiUx extends Component {

  componentDidMount() {
    this.scrollToHash();
    this.listenResizeEvents();
  }

  componentDidUpdate(prevProps) {
    const { location: { hash } } = this.props;
    const { location: { hash: prevHash } } = prevProps;
    if (!isEqual(prevHash, hash)) this.scrollToHash();
  }

  listenResizeEvents = () => {
    const { setScreen } = this.props;
    setScreen(window.innerWidth); // Init
    return window.onresize = () => {
      return setScreen(window.innerWidth);
    }
  }

  scrollToTop = () => {
    return window.scrollTo(0, 0);
  }

  scrollToHash = () => {
    const { location: { hash } } = this.props;
    if (!hash) return console.warn('Invalid hashtag');
    const id = hash.replace('#', '');
    const ele = window.document.getElementById(id);
    if (!ele) return console.error('Invalid component');
    return setTimeout(() => ele.scrollIntoView(), 300);
  }

  render() {
    // const { classes } = this.props;
    const { ui: { error, visible }, unsetError } = this.props;

    return <Grid container spacing={2}>
      {/* Error dialog */}
      <Grid item xs={12}>
        <Snackbar open={visible} onClose={unsetError} autoHideDuration={6000}>
          <Alert severity="error" onClose={unsetError} >
            <Typography>{error}</Typography>
          </Alert>
        </Snackbar>
      </Grid>
    </Grid >
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setScreen, setScroll, unsetError
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(UiUx)));