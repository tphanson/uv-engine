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
  }
}