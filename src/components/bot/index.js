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
    const { x, y, r, rotation, theme } = this.props;

    return <Fragment>
      <Wedge
        x={x}
        y={y}
        radius={r * 3}
        angle={60}
        fill={theme.palette.grey[200]}
        rotation={rotation - 30}
      />
      <Circle
        ref={this.ref}
        x={x}
        y={y}
        radius={r}
        {...this.onStyles()}
        {...this.onEvents()}
      />
    </Fragment>
  }
}

Bot.defaultProps = {
  r: 10,
  rotation: 0,
  x: 0,
  y: 0,
  onClick: () => { }
}

Bot.propTypes = {
  r: PropTypes.number,
  rotation: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
  onClick: PropTypes.func,
}

export default Bot;