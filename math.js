const math = require('mathjs');
const array = {}
const matrix = {}

function arrayApply(left, right, operation) {
    const result = [];
    if (left.length !== right.length) return;
    for (let i = 0; i < left.length; ++i) {
        result.push(operation(left[i], right[i]));
    }
    return result;
}

array.add = function (left, right) {
    if (typeof right === "number") {
        return left.map(e => e + right);
    }
    else if (Array.isArray(right)) {
        return arrayApply(left, right, (a, b) => a + b);
    }
}

array.sum = function (target) {
    return target.reduce((acc, cur) => acc + cur, 0);
}

matrix.columnSum = function (target) {
    let res = [];
    for(var i=0; i < target.length; i++){
        for(var j=0; j < target[i].length; j++){
         res[j] = (res[j] || 0) + target[i][j];
        }
       }
       
       
    return res;
}

array.divide = function (left, right) {
    if (typeof right === "number") {
        return left.map(e => e / right);
    } else if (Array.isArray(right)) {
        return arrayApply(left, right, (a, b) => a / b);
    }
}

array.multiply = function (left, right) {
    // right is a number
    if (typeof right === "number") {
        return left.map(e => e * right);
    }
}

array.accumulate = function (target) {
    let acc = 0;
    let res = [];
    return target.map(element => {
        acc += element;
        return acc;
    });
}

matrix.multiply = function (left, right) {
    // matrix*number
    if (typeof right === "number") {
        return left.map(row => array.multiply(row, right));
    } else if (Array.isArray(right)) {
        // matrix*array
        return left.map((row, index) => array.multiply(row, right[index]));
    }
}

matrix.sum = function (target, mode) {

    if (mode === 'all') return target.reduce((acc, cur) => acc + array.sum(cur), 0);
    return target.map(row => array.sum(row));
}

matrix.ratio = function (target) {
    return target.map(row => array.divide(row, array.sum(row)));
}

module.exports = Object.freeze({
    matrix,
    array
});
