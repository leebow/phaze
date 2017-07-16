/**
 * @leebow 2017/07/09.
 */

module.exports = TransitionBuilder;

function TransitionBuilder() {
    this.__from = [];
}

TransitionBuilder.prototype.withEventId = function (eventId) {
    this.__eventId = eventId;
    return this;
};

TransitionBuilder.prototype.withFromState = function (fromState) {
    this.__from.push(fromState);
    return this;
};

TransitionBuilder.prototype.withToState = function (toState) {
    this.__to = toState;
    return this;
};

TransitionBuilder.prototype.clear = function () {
    this.__eventId = null;
    this.__from = [];
    this.__to = null;
};

TransitionBuilder.prototype.build = function () {
    var self = this;

    var result = JSON.parse(JSON.stringify({
        eventId: self.__eventId,
        from: self.__from,
        to: self.__to
    }));

    self.clear();

    return result;
};