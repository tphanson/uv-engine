import React, { Component, Fragment, createRef } from 'react';
import PropTypes from 'prop-types';
import { Wedge, Circle } from 'react-konva';


class Bot extends Component {
  constructor() {
    super();

    this.ref = createRef();
  }

  componentDidMount() {
    return this.setInfo();
  }

  setInfo = () => {
    const { x, y, r, transform } = this.props;
    this.ref.current.x(transform({ x, y }).x);
    this.ref.current.y(transform({ x, y }).y);
    this.ref.current.radius(r);
  }

  onCursor = (type) => {
    const types = ['default', 'pointer'];
    if (!types.includes(type)) type = 'default';
    window.document.body.style.cursor = type;
  }

  onStyles = () => {
    const { theme } = this.props;
    const styles = {
      fill: theme.palette.secondary.main,
      shadowColor: theme.palette.secondary.main,
      shadowOffsetX: 0,
      shadowOffsetY: 6,
      shadowBlur: 10,
      shadowOpacity: 0.9,
    }
    return styles;
  }

  onEvents = () => {
    const { theme, onClick } = this.props;
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
          duration: theme.transitions.duration.shortest / 1000
        });
        return this.onCursor('default');
      },
      onClick: (e) => {
        return onClick(e);
      }
    }
    return events;
  }

  render() {
    const { x, y, r, yaw, transform, theme } = this.props;

    return <Fragment>
      <Wedge
        x={transform({ x, y }).x}
        y={transform({ x, y }).y}
        radius={r * 3}
        angle={60}
        fill={theme.palette.grey[400]}
        opacity={0.5}
        rotation={180 * yaw / Math.PI - 30}
      />
      <Circle
        ref={this.ref}
        x={transform({ x, y }).x}
        y={transform({ x, y }).y}
        radius={r}
        {...this.onStyles()}
        {...this.onEvents()}
      />
    </Fragment>
  }
}

Bot.defaultProps = {
  r: 10,
  yaw: 0,
  x: 0,
  y: 0,
  onClick: () => { },
  transform: () => ({ x: 0, y: 0 }),
  inverseTransform: () => ({ x: 0, y: 0 }),
}

Bot.propTypes = {
  r: PropTypes.number,
  yaw: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
  onClick: PropTypes.func,
  transform: PropTypes.func,
  inverseTransform: PropTypes.func,
}

export default Bot;