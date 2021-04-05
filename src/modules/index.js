import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import ui from './ui.reducer';
// eslint-disable-next-line
export default (history) => combineReducers({
	router: connectRouter(history),
	ui,
});