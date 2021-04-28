import React, { Component, Children, cloneElement, createRef } from 'react';
import isEqual from 'react-fast-compare';
import { Stage, Layer, Image, Arrow } from 'react-konva';

import { withTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';


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
  }

  componentDidUpdate(prevProps) {
    const { map: prevMap } = prevProps;
    const { map } = this.props;
    if (!isEqual(map, prevMap)) this.onLoadMap();

  }

  /**
   * To be passed for children to recalculate their position
   */
  transform = ({ x, y }) => {
    const { map } = this.props;
    const { wide, ratio } = this.state;
    if (!map || !map.width || !wide) return { x: 0, y: 0 }
    const { width, height, origin, resolution } = map;
    return {
      x: ((x - origin.x) * wide) / (resolution * width),
      y: ((resolution * height - y + origin.y) * (wide / ratio)) / (resolution * height)
    }
  }
  inverseTransform = ({ x, y }) => {
    const { map } = this.props;
    const { wide, ratio } = this.state;
    if (!map || !map.width || !wide) return { x: 0, y: 0 }
    const { width, height, origin, resolution } = map;
    return {
      x: x * (resolution * width) / wide + origin.x,
      y: origin.y + (resolution * height) - y * (resolution * height) / (wide / ratio)
    }
  }

  onLoadContainer = () => {
    const { theme } = this.props;
    const container = window.document.getElementById('container');
    const wide = container.offsetWidth - theme.spacing(4);
    return this.setState({ wide }, this.onLoadMap);
  }

  onLoadMap = () => {
    const { map } = this.props;
    const { wide } = this.state;
    if (!map || !map.width || !wide) return;
    const { width, height, image, origin, resolution } = map;
    const ratio = width / height;
    return this.setState({ ratio, origin, resolution }, () => {
      // Prevent blurry map
      const target = this.map.current;
      if (!target) return;
      const nativeCtx = target.getContext()._context;
      nativeCtx.webkitImageSmoothingEnabled = false;
      nativeCtx.mozImageSmoothingEnabled = false;
      nativeCtx.imageSmoothingEnabled = false;
      // Set image
      return target.image(image);
    });
  }

  onZoom = (e) => {
    e.evt.preventDefault();
    const layer = this.layer.current;
    if (!layer) return;
    // Old states
    const oldScale = Math.abs(layer.scaleX());
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
    if (newScale === 1) newCentroid = origin;
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
    return layer.batchDraw();
  }

  onDragEnd = (e) => {
    const { wide, ratio } = this.state;
    const layer = this.layer.current;
    if (!layer) return;
    const scale = layer.scaleX();
    const minX = wide * (1 - scale);
    const minY = wide / ratio * (1 - scale);
    const newPosition = {
      x: Math.min(0, Math.max(minX, layer.x())),
      y: Math.min(0, Math.max(minY, layer.y())),
    }
    return layer.position(newPosition);
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
    const { children: rawChildren, theme } = this.props;
    const { ratio, wide } = this.state;

    const boundary = [0, 0, wide, wide / ratio];
    const children = rawChildren.filter(child => Boolean(child));

    return <Grid container spacing={2}>
      <Grid item xs={12} id="container">
        {wide ? <Stage width={wide} height={wide / ratio} onWheel={this.onZoom} >
          <Layer ref={this.layer} onDragEnd={this.onDragEnd} draggable >
            <Image
              ref={this.map}
              width={wide}
              height={wide / ratio}
              {...this.onStyles()}
            />
            <Arrow
              x={this.transform({ x: 0, y: 0 }).x}
              y={this.transform({ x: 0, y: 0 }).y}
              points={[0, 0, 0, 10]}
              fill={theme.palette.grey[500]}
              pointerLength={1}
              pointerWidth={1}
              stroke={theme.palette.grey[500]}
              strokeWidth={1}
              scaleY={-1}
              lineJoin="round"
            />
            <Arrow
              x={this.transform({ x: 0, y: 0 }).x}
              y={this.transform({ x: 0, y: 0 }).y}
              points={[0, 0, 10, 0]}
              fill={theme.palette.grey[500]}
              pointerLength={1}
              pointerWidth={1}
              stroke={theme.palette.grey[500]}
              strokeWidth={1}
              scaleY={-1}
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

export default withTheme(Map);