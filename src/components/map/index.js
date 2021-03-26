
import React, { Component, Children, cloneElement, createRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import { Stage, Layer, Image } from 'react-konva';

import { withStyles, withTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import styles from './styles';
import PGM from 'helpers/pgm';
import { setError } from 'modules/ui.reducer';


class Map extends Component {
  constructor() {
    super();

    this.state = {
      ratio: 1,
    }

    this.layer = createRef();
    this.map = createRef();
  }

  componentDidMount() {
    this.onLoadMap();
  }

  componentDidUpdate(prevProps) {
    const { map: prevMap } = prevProps;
    const { map } = this.props;
    if (!isEqual(map, prevMap)) this.onLoadMap();
  }


  onLoadMap = () => {
    const { map } = this.props;
    if (!map) return;
    const pgm = new PGM(map);
    return pgm.draw().then(({ width, height, image }) => {
      const ratio = width / height;
      return this.setState({ ratio }, () => {
        this.map.current.image(image);
      });
    }).catch(er => {
      return setError(er);
    });
  }

  onZoom = (e) => {
    e.evt.preventDefault();
    const layer = this.layer.current;
    if (!layer) return;
    // Old states
    const oldScale = layer.scaleX();
    const oldPosition = layer.position();
    // New scale
    const scaleBy = 1.05;
    let newScale = Math.max(e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy, 1);
    if (newScale < scaleBy) newScale = 1;
    layer.scale({ x: newScale, y: newScale });
    // New position
    let newPosition = oldPosition;
    if (e.evt.deltaY >= 0) {
      if (oldScale !== 1) newPosition = {
        x: oldPosition.x / (oldScale - 1) * (newScale - 1),
        y: oldPosition.y / (oldScale - 1) * (newScale - 1),
      }
      else newPosition = {
        x: oldPosition.x / 2,
        y: oldPosition.y / 2,
      }
      if (newPosition.x < 10 || newPosition.y < 10) newPosition = { x: 0, y: 0 }
    }
    layer.position(newPosition);
    // Render
    layer.batchDraw();
  }

  render() {
    // const { classes } = this.props;
    const { children, theme } = this.props;
    const { ratio } = this.state;

    const container = window.document.getElementById('container') || {};
    const wide = container.offsetWidth - theme.spacing(2);
    const boundary = [0, 0, wide, wide / ratio];

    return <Grid container spacing={2} onScroll={this.onScroll}>
      <Grid item xs={12} id="container">
        <Stage width={wide} height={wide / ratio} onWheel={this.onZoom} >
          <Layer ref={this.layer} draggable>
            <Image ref={this.map} width={wide} height={wide / ratio} />
            {Children.map(children, child => cloneElement(child, { theme, boundary }))}
          </Layer>
        </Stage>
      </Grid>
    </Grid>
  }
}


Map.defaultProps = {
  onChange: () => { }
}

Map.propTypes = {
  map: PropTypes.string.isRequired,
  onChange: PropTypes.func
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
)(withTheme(withStyles(styles)(Map))));