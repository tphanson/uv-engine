
import React, { Component, cloneElement, createRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';

import { withStyles, withTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import styles from './styles';
import PGM from 'helpers/pgm';
import { setError } from 'modules/ui.reducer';


class Map extends Component {
  constructor() {
    super();

    this.state = {
      width: 100,
      height: 100,
      hover: false,
      move: true,
    }

    this.layer = createRef();
    this.container = createRef();
    this.stage = createRef();
    this.image = createRef();
  }

  componentDidMount() {
    this.onSize();
    // this.onLoadMap();
  }

  componentDidUpdate(prevProps) {
    const { ui: { width: prevWidth }, map: prevMap } = prevProps;
    const { ui: { width }, map } = this.props;
    if (!isEqual(width, prevWidth)) this.onSize();
    if (!isEqual(map, prevMap)) this.onLoadMap();
  }

  onSize = () => {
    const { theme: { spacing } } = this.props;
    const parent = this.container.current || {};
    const width = parent.offsetWidth - spacing(2) || 0;
    const height = width * 9 / 16;
    return this.setState({ width, height });
  }

  onLoadMap = () => {
    const { map } = this.props;
    const layer = this.layer.current;
    if (!map || !layer) return;
    const pgm = new PGM(map, layer);
    return pgm.draw().then(({ width, height, image }) => {
      const img = this.image.current;
      img.image(image);
    }).catch(er => {
      return setError(er);
    });
  }

  onEvents = () => {
    const events = {
      onMouseEnter: () => {
        return this.setState({ hover: true });
      },
      onMouseLeave: () => {
        return this.setState({ hover: false });
      },
      onMouseDown: () => {
        return this.setState({ move: true });
      },
      onMouseUp: () => {
        return this.setState({ move: false });
      }
    }
    return events;
  }

  onZoom = (e) => {
    e.evt.preventDefault();
    const stage = this.layer.current;
    if (!stage) return;
    // Scale map
    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    stage.scale({ x: newScale, y: newScale });
    stage.batchDraw();
  }

  render() {
    // const { classes } = this.props;
    const { src, children, theme } = this.props;
    const { width, height } = this.state;
    const img = new Image(width, height);
    img.src = src;
    const boundary = [0, 0, width, height];

    this.onLoadMap();

    return <Grid container spacing={2} {...this.onEvents()} onScroll={this.onScroll}>
      <Grid item xs={12} ref={this.container}>
        <Stage width={width} height={height} ref={this.stage} onWheel={this.onZoom} >
          <Layer ref={this.layer}>
            <KonvaImage image={img} ref={this.image}></KonvaImage>
            {cloneElement(children, { theme, boundary })}
          </Layer>
        </Stage>
      </Grid>
    </Grid>
  }
}


Map.defaultProps = {
  src: '',
  onChange: () => { }
}

Map.propTypes = {
  src: PropTypes.string,
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