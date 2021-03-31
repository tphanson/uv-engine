
import React, { Component, Children, cloneElement, createRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import { Stage, Layer, Image, Arrow } from 'react-konva';

import { withStyles, withTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import styles from './styles';
import { setError } from 'modules/ui.reducer';


class Map extends Component {
  constructor() {
    super();

    this.state = {
      wide: 0,
      ratio: 1,
      origin: {},
      resolution: 0.5
    }

    this.layer = createRef();
    this.map = createRef();
  }

  componentDidMount() {
    this.onLoadContainer();
    this.onLoadMap();
  }

  componentDidUpdate(prevProps) {
    const { map: prevMap } = prevProps;
    const { map } = this.props;
    if (!isEqual(map, prevMap)) this.onLoadMap();
  }

  transform = ({ x, y }) => {
    const { map } = this.props;
    const { wide, ratio } = this.state;
    if (!map || !map.width || !wide) return { x: 0, y: 0 }
    const { width, height, origin, resolution } = map;
    return {
      x: ((x - origin.x) * wide) / (resolution * width),
      y: ((y - origin.y) * wide) / (resolution * height * ratio)
    }
  }

  inverseTransform = ({ x, y }) => {
    const { map } = this.props;
    const { wide, ratio } = this.state;
    if (!map || !map.width || !wide) return { x: 0, y: 0 }
    const { width, height, origin, resolution } = map;
    return {
      x: x * resolution * width / wide + origin.x,
      y: y * resolution * height * ratio / wide + origin.y
    }
  }

  onLoadContainer = () => {
    const { theme } = this.props;
    const container = window.document.getElementById('container');
    const wide = container.offsetWidth - theme.spacing(2);
    return this.setState({ wide }, this.onLoadMap);
  }

  onLoadMap = () => {
    const { map } = this.props;
    const { wide } = this.state;
    if (!map || !map.width || !wide) return;
    const { width, height, image, origin, resolution } = map;
    const ratio = width / height;
    return this.setState({ ratio, origin, resolution }, () => {
      this.map.current.image(image);
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
    const { wide, ratio } = this.state;
    const origin = { x: wide / 2, y: wide / ratio / 2 }
    const oldCentroid = {
      x: wide * oldScale / 2 + oldPosition.x,
      y: wide / ratio * oldScale / 2 + oldPosition.y
    }
    let newCentroid = oldCentroid;
    if (newScale === 1) {
      newCentroid = origin;
    }
    if (oldScale !== 1) {
      const deltaX = (oldCentroid.x - origin.x) / (oldScale - 1);
      const deltaY = (oldCentroid.y - origin.y) / (oldScale - 1);
      newCentroid = {
        x: deltaX * (newScale - 1) + origin.x,
        y: deltaY * (newScale - 1) + origin.y
      }
    }
    const boundaryX = (newScale - 1) * wide / 2;
    const boundaryY = (newScale - 1) * wide / ratio / 2;
    newCentroid.x = Math.max(origin.x - boundaryX, Math.min(origin.x + boundaryX, newCentroid.x));
    newCentroid.y = Math.max(origin.y - boundaryY, Math.min(origin.y + boundaryY, newCentroid.y));
    const newPosition = {
      x: newCentroid.x - wide * newScale / 2,
      y: newCentroid.y - wide / ratio * newScale / 2,
    }
    layer.position(newPosition);
    // Render
    layer.batchDraw();
  }

  onDragEnd = (e) => {
    const { wide, ratio } = this.state;
    const scale = this.layer.current.scaleX();
    const minX = wide * (1 - scale);
    const minY = wide / ratio * (1 - scale);
    const newPosition = {
      x: Math.min(0, Math.max(minX, this.layer.current.x())),
      y: Math.min(0, Math.max(minY, this.layer.current.y())),
    }
    this.layer.current.position(newPosition);
  }

  onStyles = () => {
    const { theme } = this.props;
    const styles = {
      shadowColor: theme.palette.grey[400],
      shadowOffsetX: 0,
      shadowOffsetY: 6,
      shadowBlur: 10,
      shadowOpacity: 0.9,
    }
    return styles;
  }

  render() {
    // const { classes } = this.props;
    const { children, theme } = this.props;
    const { ratio, wide } = this.state;
    const boundary = [0, 0, wide, wide / ratio];

    return <Grid container spacing={2} onScroll={this.onScroll}>
      <Grid item xs={12} id="container">
        {wide ? <Stage width={wide} height={wide / ratio} onWheel={this.onZoom} >
          <Layer ref={this.layer} draggable onDragEnd={this.onDragEnd}>
            <Image
              ref={this.map}
              width={wide}
              height={wide / ratio}
              {...this.onStyles()}
            />
            <Arrow
              x={this.transform({ x: 0, y: 0 }).x}
              y={this.transform({ x: 0, y: 0 }).y}
              points={[0, 0, 0, 20]}
              fill={theme.palette.grey[400]}
              pointerLength={2}
              pointerWidth={2}
              stroke={theme.palette.grey[400]}
              strokeWidth={2}
              lineJoin="round"
            />
            <Arrow
              x={this.transform({ x: 0, y: 0 }).x}
              y={this.transform({ x: 0, y: 0 }).y}
              points={[0, 0, 20, 0]}
              fill={theme.palette.grey[400]}
              pointerLength={2}
              pointerWidth={2}
              stroke={theme.palette.grey[400]}
              strokeWidth={2}
              lineJoin="round"
            />
            {Children.map(children, child => cloneElement(child, {
              theme,
              boundary,
              transform: this.transform,
              inverseTransform: this.inverseTransform
            }))}
          </Layer>
        </Stage> : null}
      </Grid>
    </Grid>
  }
}


Map.defaultProps = {
  onChange: () => { }
}

Map.propTypes = {
  map: PropTypes.object.isRequired,
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