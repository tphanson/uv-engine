
import React, { Component, cloneElement, createRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import { Stage, Layer } from 'react-konva';

import { withStyles, withTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import Card from 'components/card';

import styles from './styles';

class Map extends Component {
  constructor() {
    super();

    this.state = {
      width: 100,
      height: 100,
      cursor: 'default'
    }
    this.ref = createRef();
  }

  componentDidMount() {
    this.onSize();
  }

  componentDidUpdate(prevProps) {
    const { ui: { width: prevWidth } } = prevProps;
    const { ui: { width } } = this.props;
    if (!isEqual(width, prevWidth)) return this.onSize();
  }

  onSize = () => {
    const { theme: { spacing } } = this.props;
    const parent = this.ref.current || {};
    const width = parent.offsetWidth - spacing(2) || 0;
    const height = width * 9 / 16;
    return this.setState({ width, height });
  }

  onCursor = (cursor = 'default') => {
    const types = ['default', 'pointer', 'move'];
    if (!types.includes(cursor)) cursor = 'default';
    return this.setState({ cursor });
  }

  render() {
    // const { classes } = this.props;
    const { onChange, children, theme } = this.props;
    const { width, height, cursor } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card>
          <Grid container spacing={2}>
            <Grid item xs={12} ref={this.ref}>
              <Stage width={width} height={height} style={{ cursor }}>
                <Layer>
                  {cloneElement(children, { theme, setCursor: this.onCursor })}
                </Layer>
              </Stage>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Grid>
  }
}


Map.defaultProps = {
  onChange: () => { }
}

Map.propTypes = {
  onChange: PropTypes.func
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withTheme(withStyles(styles)(Map))));