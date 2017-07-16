/**
 * Created by leebow on 2017/02/03.
 */

var expect = require('expect.js');

var Mocker = require('mini-mock');
var StateMachine = require('../lib/machine');

describe('unit - state machine', function () {

    this.timeout(30000);

    context('', function () {

        beforeEach('setup', function (done) {

            //var self = this;
            //var mocker = new Mocker();
            done();
        });

        afterEach('stop', function (done) {
            done();
        });

        it('can transition to the next state and execute go function and then exit', function (done) {

            var self = this;

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

            var transition = {
                eventId: 'testEvent',
                from: ['stateA'],
                to: 'stateB'
            };

            var stateMachine = new StateMachine();

            var getStateFunc = function (callback) {
                callback(null, 'stateA');
            };
            var saveStateFunc = function (state, callback) {
                callback();
            };

            stateMachine.initialise(1, getStateFunc, saveStateFunc, function (err) {
                if (err)
                    return done(err);

                stateMachine.addState('stateA', stateA);
                stateMachine.addState('stateB', stateB);
                stateMachine.addTransition(transition);

                // test the event
                stateMachine.__trigger('testEvent', function (err, result) {
                    if (err)
                        return done(err);

                    expect(result).to.equal('OK');
                    done();
                })
            });

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

        stateMachine.initialise(1, getStateFunc, saveStateFunc, function (err) {
            if (err)
                return done(err);

            stateMachine.addState('stateA', stateA);
            stateMachine.addState('stateB', stateB);
            stateMachine.addState('stateC', stateC);
            stateMachine.addTransition(transition);
            stateMachine.addTransition(transition2);
            stateMachine.addTransition(transition3);

            // test the event
            stateMachine.__trigger('testEvent', function (err) {
                if (err)
                    return done(err);

                console.log(self.counter);
                if (self.counter.funcBCount == 1 &&
                    self.counter.funcCCount == 1)
                    done();
            });
        });

    });
});
