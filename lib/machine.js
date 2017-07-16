/**
 * @leebow 2017/07/16.
 */

module.exports = StateMachine;

function StateMachine() {
    this.__transitions = [];
    this.__states = {};
    this.__currentState = null;
    this.__recurseLimit = 1;
    this.__recurseCount = 0;
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

    self.__recurseLimit = limit != null
        ? limit
        : self.__recurseLimit; // 0 means limitless recursion

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
    this.__stop = false;
    this.__trigger(eventId, callback);
};

/***
 *
 */
StateMachine.prototype.stop = function () {
    console.log('SENDING STOP SIGNAL TO STATE MACHINE....');
    this.__stop = true;
};

StateMachine.prototype.__trigger = function (eventId, callback) {

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
    self.__states[nextState].do(function (err, doResult) {

        if (err)
            return callback(err);

        // we can now save the current state
        self.__currentState = nextState;

        // invoke the save state function
        self.__saveStateFunc(self.__currentState, function (err) {
            if (err)
                return callback(err);

            if (self.__stop)
                return callback(null, doResult);

            self.__recurseCount++;

            // initiate the next transition if an output event is specified
            // recurse - this allows us to chain transitions
            if (self.__states[nextState].outputEvent != null) {
                if (self.__recurseLimit > 0) {
                    if (self.__recurseCount > self.__recurseLimit)
                        return callback(null, doResult);
                    else
                        return self.__trigger(self.__states[nextState].outputEvent, callback);
                }
                else
                    return self.__trigger(self.__states[nextState].outputEvent, callback);
            } else
                return callback(null, doResult);
        });
    });
};