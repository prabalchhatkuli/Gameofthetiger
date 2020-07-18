//action is a function that returns an object
//reducer takes care of all the action

//reducer also does the same
//reducer takes in the initial state and action as parameters
//to execute the action we need dispatch

const loggedReducer =(state = false, action)=>{
    switch(action.type){

        case 'SIGNIN':
            return !state;
        default:
            return state;
    }
}
export default loggedReducer;