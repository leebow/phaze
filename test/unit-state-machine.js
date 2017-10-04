/**
 * Created by leebow on 2017/02/03.
 */

var expect = require('expect.js');

var Mocker = require('mini-mock');
var StateMachine = require('../lib/machine');

describe('unit - state machine', function () {

    this.timeout(30000);

    beforeEach('setup', function (done) {

        //var self = this;
        //var mocker = new Mocker();
        done();
    });

    afterEach('stop', function (done) {
        done();
    });

    it('can transition from one state to the next and execute go function', function (done) {

        var self = this;

        self.__currentState = 'startState';

        var startState = {
            do: function () {
            },
            outputEvent: 'startEvent'
        };

        var stateA = {
            do: function (callback) {
                callback(null, 'Result from stateA');
            },
            outputEvent: 'testEvent'
        };

        var stateB = {
            do: function (callback) {
                callback(null, 'Result from stateB');
            }
        };

        var transition1 = {
            eventId: 'startEvent',
            from: ['startState'],
            to: 'stateA'
        };

        var transition2 = {
            eventId: 'testEvent',
            from: ['stateA'],
            to: 'stateB'
        };

        var stateMachine = new StateMachine();

        var getStateFunc = function (callback) {
            callback(null, self.__currentState);
        };

        var saveStateFunc = function (state, callback) {
            self.__currentState = state;
            callback();
        };

        stateMachine.initialise(1, getStateFunc, saveStateFunc, function (err) {
            if (err)
                return done(err);

            stateMachine.addState('startState', startState);
            stateMachine.addState('stateA', stateA);
            stateMachine.addState('stateB', stateB);
            stateMachine.addTransition(transition1);
            stateMachine.addTransition(transition2);

            // test the event
            stateMachine.start('startEvent', function (err, result) {
                if (err)
                    return done(err);

                expect(result).to.equal('Result from stateB');
                done();
            })
        });

    });

    it('can cycle states when transitions close the loop', function (done) {

        var self = this;
        self.__currentState = 'stateA';

        self.counter = {funcACount: 0, funcBCount: 0, funcCCount: 0};

        var stateA = {
            do: function (callback) {
                self.counter.funcACount += 1;
                callback(null, 'OK1');
            },
            outputEvent: 'testEvent'
        };

        var stateB = {
            do: function (callback) {
                self.counter.funcBCount += 1;
                callback(null, 'OK2');
            },
            outputEvent: 'testEvent2'
        };

        var stateC = {
            do: function (callback) {
                self.counter.funcCCount += 1;
                callback(null, 'OK3');
            },
            outputEvent: 'testEvent3'
        };

        var transition = {
            eventId: 'testEvent',
            from: ['stateA'],
            to: 'stateB'
        };

        var transition2 = {
            eventId: 'testEvent2',
            from: ['stateB'],
            to: 'stateC'
        };

        var transition3 = {
            eventId: 'testEvent3',
            from: ['stateC'],
            to: 'stateA'
        };

        var getStateFunc = function (callback) {
            callback(null, self.__currentState);
        };

        var saveStateFunc = function (state, callback) {
            self.__currentState = state;
            callback();
        };

        var stateMachine = new StateMachine();

        stateMachine.initialise(2, getStateFunc, saveStateFunc, function (err) {
            if (err)
                return done(err);

            stateMachine.addState('stateA', stateA);
            stateMachine.addState('stateB', stateB);
            stateMachine.addState('stateC', stateC);
            stateMachine.addTransition(transition);
            stateMachine.addTransition(transition2);
            stateMachine.addTransition(transition3);

            // test the event
            stateMachine.start('testEvent', function (err) {
                if (err)
                    return done(err);

                if (self.counter.funcBCount == 2 &&
                    self.counter.funcCCount == 2)

                    done();
            });
        });

    });

    it('can nest a state machine inside a state', function (done) {

        var self = this;

        /*
         Outer state machine
         */

        self.__currentState = 'startState';

        var startState = {
            do: function () {
            },
            outputEvent: 'startEvent'
        };

        var stateA = {
            do: function (callback) {

                var __this = this;

                /*
                 Inner state machine
                 */

                __this.__currentState = 'innerStartState';

                var innerStartState = {
                    do: function () {
                    },
                    outputEvent: 'innerStartEvent'
                };

                var innerStateA = {
                    do: function (callback) {
                        callback(null, 'Result from innerStateA');
                    }
                };

                var innerTransition1 = {
                    eventId: 'innerStartEvent',
                    from: ['innerStartState'],
                    to: 'innerStateA'
                };

                var innerGetStateFunc = function (callback) {
                    callback(null, __this.__currentState);
                };

                var innerSaveStateFunc = function (state, callback) {
                    __this.__currentState = state;
                    callback();
                };

                var innerStateMachine = new StateMachine();

                innerStateMachine.initialise(1, innerGetStateFunc, innerSaveStateFunc, function (err) {

                    if (err)
                        return done(err);

                    innerStateMachine.addState('innerStartState', innerStartState);
                    innerStateMachine.addState('innerStateA', innerStateA);
                    innerStateMachine.addTransition(innerTransition1);

                    console.log('Starting inner state machine....');

                    // test the event
                    innerStateMachine.start('innerStartEvent', function (err, result) {

                        if (err)
                            return callback(err);

                        callback(null, 'Result from innerStateA');
                    })
                });
            },
            outputEvent: 'testEvent'
        };

        var stateB = {
            do: function (callback) {
                callback(null, 'Result from stateB');
            }
        };

        var transition1 = {
            eventId: 'startEvent',
            from: ['startState'],
            to: 'stateA'
        };

        var transition2 = {
            eventId: 'testEvent',
            from: ['stateA'],
            to: 'stateB'
        };

        var getStateFunc = function (callback) {
            callback(null, self.__currentState);
        };

        var saveStateFunc = function (state, callback) {
            self.__currentState = state;
            callback();
        };

        var outerStateMachine = new StateMachine();

        outerStateMachine.initialise(1, getStateFunc, saveStateFunc, function (err) {
            if (err)
                return done(err);

            outerStateMachine.addState('startState', startState);
            outerStateMachine.addState('stateA', stateA);
            outerStateMachine.addState('stateB', stateB);
            outerStateMachine.addTransition(transition1);
            outerStateMachine.addTransition(transition2);

            // test the event
            outerStateMachine.start('startEvent', function (err, result) {
                if (err)
                    return done(err);

                expect(result).to.equal('Result from stateB');
                done();
            })
        });

    });
});
