'use strict';

import _ from 'lodash';

export default {
    /**
     * Formats an integer by prepending leading zeros.
     *
     * @param {Number} number
     * Integer number to format.
     *
     * @param {Number} digits
     * Count of digits in formatted string.
     *
     * @returns {String}
     */
    formatInteger: function(number, digits) {
        if (!_.isNumber(number) || number % 1 !== 0) {
            throw new Error('Number must be an integer.');
        }

        if (!_.isNumber(digits) || digits % 1 !== 0) {
            throw new Error('Digits must be an integer.');
        }

        var formatted = '' + number;
        for (var i = 0; i < digits - number.toString().length; i += 1) {
            formatted = '0' + formatted;
        }
        return formatted;
    }
};