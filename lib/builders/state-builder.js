/**
 * @leebow 2017/07/09.
 */

module.exports = StateBuilder;

function StateBuilder() {
}

StateBuilder.prototype.withOutputEvent = function (eventId) {
    this.__outputEvent = eventId;
    return this;
};

StateBuilder.prototype.withDoFunc = function (func) {
    this.__doFunc = func;
    return this;
};

StateBuilder.prototype.clear = function () {
    this.__doFunc = null;
    this.__outputEvent = null;
};

StateBuilder.prototype.build = function () {
    var self = this;

    var result = {
        do: self.__doFunc,
        outputEvent: self.__outputEvent
    };

    self.clear();

    return result;

};