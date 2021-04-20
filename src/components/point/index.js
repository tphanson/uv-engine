import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Circle, Line } from 'react-konva';


class Point extends Component {

  onCursor = (type) => {
    const types = ['default', 'pointer'];
    if (!types.includes(type)) type = 'default';
    window.document.body.style.cursor = type;
  }

  onStyles = () => {
    const { theme, variant, highlight } = this.props;
    let styles = variant === 'primary' ? {
      fill: theme.palette.secondary.light,
      opacity: 0.75
    } : {
      fill: '#ff9292',
      opacity: 0.5
    }
    if (highlight) styles = { ...styles, fill: 'yellow' }
    return styles;
  }

  onEvents = () => {
    const { onClick } = this.props;
    const events = {
      onMouseEnter: () => {
        return this.onCursor('pointer');
      },
      onMouseLeave: () => {
        return this.onCursor('default');
      },
      onClick: (e) => {
        return onClick(e);
      }
    }
    return events;
  }

  render() {
    const { x, y, transform, r, yaw, theme, angled } = this.props;

    const centroid = transform({ x, y });
    const lineColor = theme.palette.secondary.dark;

    return <Fragment>
      <Circle
        x={centroid.x}
        y={centroid.y}
        radius={r}
        {...this.onStyles()}
        {...this.onEvents()}
      />
      {angled ? <Line
        points={[centroid.x, centroid.y, centroid.x + r * Math.cos(yaw), centroid.y + r * Math.sin(yaw),]}
        stroke={lineColor}
        strokeWidth={r / 10}
        lineCap="round"
        opacity={0.75}
      /> : null}
    </Fragment>
  }
}

Point.defaultProps = {
  variant: "primary",
  r: 10,
  x: 0,
  y: 0,
  yaw: 0,
  onClick: () => { },
  transform: () => ({ x: 0, y: 0 }),
  inverseTransform: () => ({ x: 0, y: 0 }),
  angled: false,
  highlight: false,
}

Point.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary']),
  r: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
  yaw: PropTypes.number,
  onClick: PropTypes.func,
  transform: PropTypes.func,
  inverseTransform: PropTypes.func,
  angled: PropTypes.bool,
  highlight: PropTypes.bool,
}

export default Point;