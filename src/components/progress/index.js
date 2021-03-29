import React from 'react';
import PropTypes from 'prop-types';

import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

function CircularProgressWithLabel(props) {
  const { label, onChange, ...others } = props;

  const onWheel = (e) => {
    const { value, onChange } = props;
    const direction = e.deltaY / Math.abs(e.deltaY);
    const delta = 2;
    const newValue = Math.min(100, Math.max(0, value + direction * delta));
    return onChange(newValue);
  }

  return (
    <Box position="relative" display="inline-flex" onWheel={onWheel}>
      <CircularProgress variant="determinate" {...others} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="caption" align="center">{label}</Typography>
      </Box>
    </Box>
  );
}

CircularProgressWithLabel.defaultProps = {
  value: 0,
  label: '',
  onChange: () => { },
}

CircularProgressWithLabel.propTypes = {
  value: PropTypes.number,
  label: PropTypes.string,
  onChange: PropTypes.func,
};

export default CircularProgressWithLabel;