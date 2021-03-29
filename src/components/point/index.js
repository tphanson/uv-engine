import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { Circle } from 'react-konva';


class Point extends Component {
  constructor() {
    super();

    this.ref = createRef();
  }

  componentDidMount() {
    return this.setInfo();
  }

  componentDidUpdate(prevProps) {
    const { x: prevX, y: prevY, r: prevR } = prevProps;
    const { x, y, r } = this.props;
    if (x !== prevX || y !== prevY || r !== prevR) this.setInfo();
  }

  setInfo = () => {
    const { x, y, r } = this.props;
    this.ref.current.x(x);
    this.ref.current.y(y);
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
      fill: theme.palette.secondary.light,
    }
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
    const { x, y, r } = this.props;

    return <Circle
      ref={this.ref}
      x={x}
      y={y}
      radius={r}
      {...this.onStyles()}
      {...this.onEvents()}
    />
  }
}

Point.defaultProps = {
  r: 10,
  x: 0,
  y: 0,
  onClick: () => { }
}

Point.propTypes = {
  r: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
  onClick: PropTypes.func,
}

export default Point;