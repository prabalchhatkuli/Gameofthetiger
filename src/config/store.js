//contain the code that initializes the react-redux store
import {createStore, combineReducers} from 'redux'
import playerReducer from '../components/player/playerreducer'

//saves all the states
const rootReducer = combineReducers({
    player: playerReducer,

})

const store  = createStore(
    rootReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
)

export default store;