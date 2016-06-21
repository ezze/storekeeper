'use strict';

export default function(value) {
    return typeof value === 'number' && value % 1 === 0;
}