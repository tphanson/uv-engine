// eslint-disable-next-line
export default theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  popover: {
    padding: theme.spacing(2),
    maxWidth: theme.spacing(40)
  },
  paper: {
    padding: theme.spacing(2),
    transition: theme.transitions.create(),
    '&:hover': {
      boxShadow: theme.shadows[6],
    },
  },
  map: {
    // background: theme.palette.grey['A700']
  },
});