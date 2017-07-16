# phaze
Phaze is a finite state machine for Node robotics. It is intended to help manage the transitions from one state to the next in a deterministic manner.

## Concepts

Some basics to consider when using a state machine:

- **State** - a discrete, non-transitory situation that a system may be in at any given moment, e.g.:
  - idling
  - moving forward
  - reversing
- **Transition** - the process of moving from one state to another

A stimulus is required to initiate a transition - this can be an event or an explicit call to change state. 

## Design

**Phaze** is designed to allow a function to be invoked once a state has been **entered**. Once this function has completed, an **output event** is fired, which will initiate a transistion change. This transition will then move the system from the current state to the next state, and so on.

Persistent storage of state is achieved through passing save and get functions into the initialise function of the state machine. These functions are used to save or retrieve state using injected logic.

## Usage

```javascript
/***
STATES
***/
var stateA = {
  do: function () {
   },
   outputEvent: 'testEvent'
 };

var stateB = {
  do: function (callback) {
    callback(null, 'OK');
  }
};

/***
TRANSITION
***/
var transition = {
  eventId: 'testEvent',
  from: ['stateA'],
  to: 'stateB'
};

/***
STATE PERSISTENCE FUNCTIONS
***/
var getStateFunc = function (callback) {
  callback(null, 'stateA');
};

var saveStateFunc = function (state, callback) {
  callback();
};

/***
STATE MACHINE
***/
var stateMachine = new StateMachine();

// initialise the state machine
stateMachine.initialise(1, getStateFunc, saveStateFunc, function (err) {
  if (err)
    return done(err);

  stateMachine.addState('stateA', stateA);
  stateMachine.addState('stateB', stateB);
  stateMachine.addTransition(transition);

  // start the machine
  stateMachine.start('testEvent', function (err, result) {
    if (err)
      return done(err);

    expect(result).to.equal('OK');
    done();
  })
});
```





