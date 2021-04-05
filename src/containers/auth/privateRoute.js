import React from 'react';
import { useStore } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const store = useStore();
  const { auth: { logged } } = store.getState();
  return <Route {...rest} render={props => logged ? <Component {...props} />
    : <Redirect to={{ pathname: '/auth', state: { from: props.location } }} />}
  />
}

export default PrivateRoute;