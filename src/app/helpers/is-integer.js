define([], function() {
    return function(value) {
        return typeof value === 'number' && value % 1 === 0;
    };
});