/**
 * @leebow 2017/07/16.
 */

module.exports = StateMachine;

function StateMachine() {
    this.__transitions = [];
    this.__states = {};
    this.__stateLen = 0;
    this.__currentStatePos = 0;
    this.__currentState = null;
    this.__maxStatesProcessed = 0;
    this.__loopLimit = 1;
}

/***
 *
 * @param limit The amount of times the states will repeat if in a 'closed loop'
 * @param getStateFunc An async function to retrieve the current state (user-supplied)
 * @param saveStateFunc An async function to save the current state (user-supplied)
 * @param callback Final callback function
 */
StateMachine.prototype.initialise = function (limit, getStateFunc, saveStateFunc, callback) {

    var self = this;

    self.__loopLimit = limit != null
        ? limit
        : self.__loopLimit; // 0 means limitless recursion

    self.__getStateFunc = getStateFunc;
    self.__saveStateFunc = saveStateFunc;

    self.__getStateFunc(function (err, result) {

        if (err)
            return callback(err);

        self.__currentState = result;

        callback();
    });
};

/***
 *
 * @param id
 * @param state
 */
StateMachine.prototype.addState = function (id, state) {
    this.__states[id] = state;
};

/***
 *
 * @param transition
 */
StateMachine.prototype.addTransition = function (transition) {
    this.__transitions.push(transition);
};

/***
 *
 * @param eventId
 * @param callback
 */
StateMachine.prototype.start = function (eventId, callback) {
    console.log('STARTING STATE MACHINE....');

    this.__stateLen = Object.keys(this.__states).length;
    this.__maxStatesProcessed = this.__loopLimit * this.__stateLen; // eg: 2 (how many loops max) * 4 (number of states) = 8

    this.__stop = false;
    this.__trigger(null, eventId, callback);
};

/***
 *
 */
StateMachine.prototype.stop = function () {
    console.log('SENDING STOP SIGNAL TO STATE MACHINE....');
    this.__stop = true;
};

StateMachine.prototype.__trigger = function (previousResult, eventId, callback) {

    var self = this;

    // what transition is being triggered?
    var validTransitions = self.__transitions
        .filter(x => {
            return x.eventId == eventId;
        })
        .filter(y => {
            return y.from.filter(z => {
                    return z == self.__currentState;
                }).length > 0;
        });

    var activeTransition = validTransitions.length > 0 ? validTransitions[0] : null;

    if (activeTransition == null)
        return callback('Transition not found!', null);

    // what's the next state?
    var nextState = activeTransition.to;

    // invoke the next state's do function and call back

    var cb = function (err, doResult) {

        if (err)
            return callback(err);

        // we can now save the current state
        self.__currentState = nextState;

        self.__currentStatePos++;

        // invoke the save state function
        self.__saveStateFunc(self.__currentState, function (err) {
            if (err)
                return callback(err);

            if (self.__stop)
                return callback(null, doResult);

            // initiate the next transition if an output event is specified
            if (self.__states[nextState].outputEvent != null) {

                if (self.__currentStatePos > (self.__maxStatesProcessed - 1))
                    return callback(null, doResult);
                else  // recurse - this allows us to chain transitions
                    return self.__trigger(doResult, self.__states[nextState].outputEvent, callback);

            } else
                return callback(null, doResult);
        });
    };

    var argLen = self.__states[nextState].do.length;

    if (argLen == 1)    // 1 arg: single callback
        self.__states[nextState].do(cb);
    else
        self.__states[nextState].do(previousResult, cb);    // 1st arg: result from the previous state; 2nd arg: callback

};