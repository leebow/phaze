/**
 * Created by leebow on 2017/02/03.
 */

var expect = require('expect.js');
var path = require('path');

var Mocker = require('mini-mock');
var StateMachine = require('../lib/machine');

describe('unit - state machine', function () {

    this.timeout(30000);

    context('', function () {

        beforeEach('setup', function (done) {

            var self = this;
            var mocker = new Mocker();
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
});
