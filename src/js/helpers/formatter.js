'use strict';

export default {
    formatInteger(number, digits) {
        var formatted = '' + number;
        for (var i = 0; i < digits - number.toString().length; i += 1) {
            formatted = '0' + formatted;
        }
        return formatted;
    }
};