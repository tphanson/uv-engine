import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { Circle } from 'react-konva';


class POI extends Component {
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

  onDragEnd = (e) => {
    e.evt.preventDefault();
    const { r, onChange, boundary: [minX, minY, maxX, maxY], inverseTransform } = this.props;
    const safety = r * 2;
    const x = Math.max(Math.min(e.target.x(), maxX - safety), minX + safety);
    const y = Math.max(Math.min(e.target.y(), maxY - safety), minY + safety);
    this.ref.current.x(x);
    this.ref.current.y(y);
    const position = {
      x: inverseTransform({ x, y }).x,
      y: inverseTransform({ x, y }).y,
    }
    return onChange(position);
  }

  onCursor = (type) => {
    const types = ['default', 'pointer', 'move'];
    if (!types.includes(type)) type = 'default';
    window.document.body.style.cursor = type;
  }

  onStyles = () => {
    const { theme, highlight } = this.props;
    const styles = {
      fill: highlight ? 'yellow' : theme.palette.primary.main,
      shadowColor: highlight ? 'yellow' : theme.palette.primary.main,
      shadowOffsetX: 0,
      shadowOffsetY: 6,
      shadowBlur: 10,
      shadowOpacity: 0.9,
    }
    return styles;
  }

  onEvents = () => {
    const { theme, onClick, onHold } = this.props;
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
      onMouseDown: () => {
        return this.onCursor('move');
      },
      onMouseUp: () => {
        return this.onCursor('pointer');
      },
      onClick: (e) => {
        const secondaryAction = e.evt.ctrlKey || e.evt.metaKey;
        if (secondaryAction) {
          e.released = false;
          onHold(e);
          return window.addEventListener('mousemove', this.listener);
        }
        else return onClick(e);
      },
      onDragEnd: this.onDragEnd
    }
    return events;
  }

  listener = (e) => {
    const { onHold } = this.props;
    const isHold = e.ctrlKey || e.metaKey;
    if (isHold) return e.released = false;
    window.removeEventListener('mousemove', this.listener);
    e.released = true;
    return onHold(e);
  }

  render() {
    const { x, y, r, transform } = this.props;

    return <Circle
      ref={this.ref}
      x={transform({ x, y }).x}
      y={transform({ x, y }).y}
      radius={r}
      {...this.onStyles()}
      {...this.onEvents()}
      draggable
    />
  }
}

POI.defaultProps = {
  r: 10,
  x: 0,
  y: 0,
  boundary: [0, 0, window.innerWidth, window.innerHeight],
  onClick: () => { },
  onHold: () => { },
  onChange: () => { },
  transform: () => ({ x: 0, y: 0 }),
  inverseTransform: () => ({ x: 0, y: 0 }),
  highlight: false,
}

POI.propTypes = {
  r: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
  boundary: PropTypes.array,
  onClick: PropTypes.func,
  onHold: PropTypes.func,
  onChange: PropTypes.func,
  transform: PropTypes.func,
  inverseTransform: PropTypes.func,
  highlight: PropTypes.bool,
}

export default POI;