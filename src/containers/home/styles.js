export default function styles(theme) {
  return {
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
    logo:{
      width: theme.spacing(12),
      padding: 0,
      margin: -theme.spacing(1)
    }
  }
}