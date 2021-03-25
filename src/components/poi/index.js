
import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { Circle } from 'react-konva';


class POI extends Component {
  constructor() {
    super();

    this.state = {
      isDragging: false,
    }
    this.ref = createRef();
  }

  onDragStart = () => {
    return this.setState({ isDragging: true });
  }

  onDragEnd = (e) => {
    const { onChange } = this.props;
    return this.setState({ isDragging: false }, () => {
      return onChange({ x: e.target.x(), y: e.target.y() });
    });
  }

  onStyles = () => {
    const { theme } = this.props;
    const styles = {
      fill: theme.palette.primary.main,
      shadowColor: theme.palette.primary.main,
      shadowOffsetX: 0,
      shadowOffsetY: 7,
      shadowBlur: 10,
      shadowOpacity: 0.9,
    }
    return styles;
  }

  onEvents = () => {
    const { theme, setCursor } = this.props;
    const events = {
      onMouseEnter: () => {
        setCursor('pointer');
        return this.ref.current.to({
          shadowOffsetY: 10,
          shadowBlur: 20,
          duration: theme.transitions.duration.shorter / 1000
        });
      },
      onMouseLeave: () => {
        setCursor('default');
        return this.ref.current.to({
          shadowOffsetY: 7,
          shadowBlur: 10,
          duration: theme.transitions.duration.shorter / 1000
        });
      },
      onMouseDown: () => {
        setCursor('move');
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
      draggable
    />
  }
}

POI.defaultProps = {
  r: 12,
  x: 0,
  y: 0,
  onChange: () => { }
}

POI.propTypes = {
  r: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
  onChange: PropTypes.func
}

export default POI;