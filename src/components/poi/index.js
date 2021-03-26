
import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { Circle } from 'react-konva';


class POI extends Component {
  constructor() {
    super();

    this.ref = createRef();
  }

  onDragEnd = (e) => {
    const {
      r, onChange,
      boundary: [minX, minY, maxX, maxY],
    } = this.props;
    const safety = r * 2;
    const position = {
      x: Math.max(Math.min(e.target.x(), maxX - safety), minX + safety),
      y: Math.max(Math.min(e.target.y(), maxY - safety), minY + safety),
    }
    console.log(position)
    return onChange(position);
  }

  onCursor = (type) => {
    const types = ['default', 'pointer', 'move'];
    if (!types.includes(type)) type = 'default';
    window.document.body.style.cursor = type;
  }

  onStyles = () => {
    const { theme } = this.props;
    const styles = {
      fill: theme.palette.primary.main,
      shadowColor: theme.palette.primary.main,
      shadowOffsetX: 0,
      shadowOffsetY: 6,
      shadowBlur: 10,
      shadowOpacity: 0.9,
    }
    return styles;
  }

  onEvents = () => {
    const { theme } = this.props;
    const events = {
      onMouseEnter: () => {
        this.ref.current.to({
          shadowOffsetY: 10,
          shadowBlur: 20,
          duration: theme.transitions.duration.shorter / 1000
        });
        return this.onCursor('pointer');
      },
      onMouseLeave: () => {
        this.ref.current.to({
          shadowOffsetY: 6,
          shadowBlur: 10,
          duration: theme.transitions.duration.shorter / 1000
        });
        return this.onCursor('default');
      },
      onMouseDown: () => {
        return this.onCursor('move');
      },
      onMouseUp: () => {
        return this.onCursor('pointer');
      }
    }
    return events;
  }

  render() {
    const { x, y, r } = this.props;

    return <Circle
      ref={this.ref}
      x={x}
      y={y}
      radius={r}
      {...this.onStyles()}
      {...this.onEvents()}
      onDragEnd={this.onDragEnd}
      draggable
    />
  }
}

POI.defaultProps = {
  r: 12,
  x: 0,
  y: 0,
  boundary: [0, 0, window.innerWidth, window.innerHeight],
  onChange: () => { }
}

POI.propTypes = {
  r: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
  boundary: PropTypes.array,
  onChange: PropTypes.func
}

export default POI;