import {createStore} from 'redux';
import allReducers from './reducers';

//this function enables the google chrome plugin for react-redux devtools plugin
const store = createStore(
    allReducers,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;