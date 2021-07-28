import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  column: {
    backgroundColor: '#F4F6FF',
    minWidth: 400,
    marginLeft: 10,
    marginRight: 10,
  },
  columnTitle: {
    fontWeight: 'bolder',
  },
  task: {
    marginTop: 10,
    marginBottom: 10,
  },
}));

export default useStyles;
