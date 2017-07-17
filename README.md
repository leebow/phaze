![npm](https://badge.fury.io/js/phaze.svg)
[![travis](https://travis-ci.org/leebow/phaze.svg?branch=master)](https://travis-ci.org/leebow/phaze)

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

### States

- **Phaze** is designed to allow an optional callback function to be triggered once a state has been **entered**.
- Once this function has completed, an **output event** is fired, which will initiate a transition change.

### Transitions

- A transition moves the system from the current state to the next state. A transition is triggered by the output event of a previous state.
- A transition has a many-to-one relationship between states, i.e.: a transition can have **multiple "from" states** but **ONLY one "to" state**.

### Persistence

- Persistent storage of state is achieved through passing save and get functions into the initialise function of the state machine. 
- These functions are used to save or retrieve state using injected logic.

### Nesting

- A state machine can be nested within the state of an outer state machine.
- Construction and initialisation of the inner state machine is done within the **"do"** function of a state.
  ​

## Usage

```javascript
/***************
STATES
***************/
var startState = {
  do: function () {
   },
   outputEvent: 'startEvent'
 };

var walkingState = {
  do: function (callback) {
    callback(null, 'Walking...');
  },
  outputEvent: 'walkEvent'
};

// no outputEvent will cause the state machine to exit the loop
var runningState = {
  do: function (callback) {
    callback(null, 'Running...');
  }
};

/***************
TRANSITIONS
***************/
var transition1 = {
  eventId: 'startEvent',
  from: ['startState'],
  to: 'walkingState'
};

var transition2 = {
  eventId: 'walkEvent',
  from: ['walkingState'],
  to: 'runningState'
};

/***************
STATE PERSISTENCE FUNCTIONS (these can wrap database calls etc.)
***************/
var getStateFunc = function (callback) {
  callback(null, 'startState');
};

var saveStateFunc = function (state, callback) {
  callback();
};

/***
STATE MACHINE
***/
var stateMachine = new StateMachine();

// initialise - first argument is the number of times the machine will loop (0 = infinite)
stateMachine.initialise(1, getStateFunc, saveStateFunc, function (err) {
  if (err)
    return done(err);

  stateMachine.addState('startState', startState);
  stateMachine.addState('walkingState', walkingState);
  stateMachine.addState('runningState', runningState);
  stateMachine.addTransition(transition1);
  stateMachine.addTransition(transition2);

  // start the machine and confirm the final result
  stateMachine.start('startEvent', function (err, result) {
    if (err)
      return done(err);

    expect(result).to.equal('Running...');
    done();
  })
});
```





