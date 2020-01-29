//This code, which simulates Fire Emblem Heroes' summoning mechanics, was originally written in Python by igfod13
//Translated into JavaScript by me
//Version 0.1
//2019

'use strict';

const math = require('mathjs'); //yo look up mathjs browser integration
const mymath = require('./math');

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Edit this section for preset information
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
let random_pool = [[36, 23, 19, 15],//5* exclusive
[4, 4, 1, 3],  //4-5*
[28, 24, 18, 25]]; //3-4*
let start_percent = [0.03, 0.03, 0.58, 0.36];
let focus = ([1, 1, 1, 1]); // R, B, G, C
let free_pull = false;
let num_wanted = 1; // for 5*, 11 for 5*+10 
let desired_color = 1; //R=0, B=1, G=2, C=3
let num_trials = 100000;


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Retrieve inputs from user, comment out to use preset info
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// let banner_type = window.prompt("Banner type (reg/leg/hf):", "<banner goes here>");
// if (banner_type == "reg") {
//     start_percent = ([0.03, 0.03, 0.58, 0.36]);
// }
// else if (banner_type == "leg") {
//     start_percent = ([0.08, 0.00, 0.58, 0.34]);
// }
// else if (banner_type == "hf") {
//     start_percent = ([0.05, 0.03, 0.58, 0.34]);
// }
// else {
//     console.log("Error! Invalid banner type");
// }

// let r = window.prompt("Number of reds on banner:", "<number goes here>");
// let b = window.prompt("Number of blues on banner:", "<number goes here>");
// let g = window.prompt("Number of greens on banner:", "<number goes here>");
// let c = window.prompt("Number of colorless on banner:", "<number goes here>");

// focus = [pasrseInt(r), parseInt(b), parseInt(g), parseInt(c)];
// all_focus = r + b + g + c;
// let num = window.prompt("Number of units wanted", "<number goes here>");
// num_wanted = parseInt(num);


// let color = window.prompt("Desired color(r/b/g/c): ", "<color goes here>");
// if (color == 'r') {
//     desired_color = 0;
// }
// else if (color == 'b') {
//     desired_color = 1;
// }
// else if (color == 'g') {
//     desired_color = 2;
// }
// else if (color == 'c') {
//     desired_color = 3;
// }
// else {
//     console.log("Error! Invalid color");
// }

// let num = window.prompt("Number of trials to run:", "<number goes here>");

// num_trials = trials;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Performs a summoning trial, returns numbers of orbs spent for N units
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function summon(desired_color, num_wanted, free_pull, start_percent, focus, random_pool) {

    let five_star_units = mymath.array.add(random_pool[0], random_pool[1]);
    let four_star_units = mymath.array.add(random_pool[1], random_pool[2]);
    let num_per_rarity = [focus, five_star_units, four_star_units, random_pool[2]];

    let ratio_in_rarity = mymath.matrix.ratio(num_per_rarity);

    let num_pulled = 0;
    let pity_count = 0;
    let summoned = false;
    let orbs_spent = 0;
    let pity_breakers = 0;
    while (!summoned) {
        // Generate 5 random numbers to simulate 5 stones
        let pull = [Math.random(), Math.random(), Math.random(), Math.random(), Math.random()];
        // Get current pity rate
        let pity_increase = Math.floor(pity_count / 5);
        // Current summon percentages
        let curr_percent = ([start_percent[0] + pity_increase * .005 * start_percent[0] / (start_percent[0] + start_percent[1]),
        start_percent[1] + pity_increase * .005 * start_percent[1] / (start_percent[0] + start_percent[1]),
        start_percent[2] - pity_increase * .005 * start_percent[2] / (start_percent[2] + start_percent[3]),
        start_percent[3] - pity_increase * .005 * start_percent[3] / (start_percent[2] + start_percent[3])]);
        // Probability of drawing a specific color and rarity in a matrix
        let prob_of_draw = mymath.matrix.multiply(ratio_in_rarity, curr_percent);
        // Probability of specific color
        let color_prob = mymath.matrix.columnSum(prob_of_draw);

        // Cutoffs to determine what color and rarity is pulled
        let color_cutoff = mymath.array.accumulate(color_prob);
        color_cutoff.unshift(0);
        // Generate color of orbs
        let stone_color = [0, 0, 0, 0, 0];
        let stone_remainder = [0, 0, 0, 0, 0];
        for (let i = 0; i < 5; i++) {
            if (pull[i] < color_cutoff[1]) {
                stone_color[i] = 0;
            }
            else if (pull[i] < color_cutoff[2]) {
                stone_color[i] = 1;
            }
            else if (pull[i] < color_cutoff[3]) {
                stone_color[i] = 2;
            }
            else if (pull[i] < color_cutoff[4]) {
                stone_color[i] = 3;
            }
            else {
                console.log("Error! Color cutoffs inaccurately caclulated.");
            }
            stone_remainder[i] = pull[i] - color_cutoff[stone_color[i]];
        }
        // Number of stones present for desired color
        let wanted_stones = 0;
        for (let i = 0; i < 5; i++) {
            if (stone_color[i] == desired_color) {
                wanted_stones++;
            }
        }

        if (wanted_stones > 0) { // Pull desired color
            let cost_index = 1;
            let pity_broken = false;
            for (let i = 0; i < 5; i++) {
                if (stone_color[i] == desired_color) {
                    if (!free_pull) {
                        orbs_spent += 5 - Math.floor((cost_index + 1) / 3);
                    }
                    else {
                        free_pull = false;
                    }
                    pity_count += 1;
                    cost_index += 1;
                    // Determine if pull was desired unit or pity broken
                    if (stone_remainder[i] < (prob_of_draw[0][stone_color[i]] / num_per_rarity[0][stone_color[i]])) {
                        num_pulled += 1;
                        if (num_pulled == num_wanted) {
                            summoned = true;  // Completely stop summoning when desired unit pulled
                            break;
                        }
                        pity_broken = true;
                    }
                    else if (stone_remainder[i] < prob_of_draw[0][stone_color[i]] + prob_of_draw[1][stone_color[i]]) {
                        pity_breakers += 1;
                        pity_broken = true;
                    }
                }
            }
            if (pity_broken)
                pity_count = 0;
        }
        else { // Pull alternative color because desired color not present
            let color_present = [false, false, false, false];
            for (let i = 0; i < 5; i++) {
                color_present[stone_color[i]] = true;
            }
            let break_prob = mymath.array.add(prob_of_draw[0], prob_of_draw[1]);
            //math.chain(break_prob).di, color_prob);
            let alt_color = -1;
            let min_break_prob = 1;
            for (let i = 0; i < 4; i++) {
                if (break_prob[i] < min_break_prob) {
                    if (color_present[i]) {
                        alt_color = i;
                        min_break_prob = break_prob[i];
                    }
                }
            }
            for (let i = 0; i < 5; i++) {
                if (stone_color[i] == alt_color) {
                    if (!free_pull)
                        orbs_spent += 5
                    else
                        free_pull = false
                pity_count += 1
                // Pity break if 5* summoned
                if (stone_remainder[i] < (prob_of_draw[0][stone_color[i]] + prob_of_draw[1][stone_color[i]])) {
                    pity_breakers += 1;
                    pity_count = 0;
                }
                break;
                }
            }
        }
    }
    return orbs_spent;
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Run N trials and post process
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
let orbs = [];
//keep track of how many trials in each range of orbs
let buckets = new Array(17).fill(0);
for (let i = 0; i < num_trials; i++) {
    orbs.push(summon(desired_color, num_wanted, free_pull, start_percent, focus, random_pool));
    //this needs to be cleaned and bucket[0] doesn't work 100% accurately with free pulls
    if (orbs[i] == 5 || orbs[i] == 0) {
        buckets[0]++;
    }
    if (orbs[i] < 50) {
        buckets[1]++;
    } else if (orbs[i] < 100) {
        buckets[2]++;
    } else if (orbs[i] < 150) {
        buckets[3]++;
    } else if (orbs[i] < 200) {
        buckets[4]++;
    } else if (orbs[i] < 250) {
        buckets[5]++;
    } else if (orbs[i] < 300) {
        buckets[6]++;
    } else if (orbs[i] < 350) {
        buckets[7]++;
    } else {
        buckets[16]++; //needs to be reordered to between 7 and 8
    }
    if (orbs[i] < 500) {
        buckets[8]++;
    } else if (orbs[i] < 1000) {
        buckets[9]++;
    } else if (orbs[i] < 1500) {
        buckets[10]++;
    } else if (orbs[i] < 2000) {
        buckets[11]++;
    } else if (orbs[i] < 2500) {
        buckets[12]++;
    } else if (orbs[i] < 3000) {
        buckets[13]++;
    } else if (orbs[i] < 3500) {
        buckets[14]++;
    } else {
        buckets[15]++;
    }
    if (i % 1000 == 0)
        console.log("Trials finished: " + i);
}

console.log("Trials finished: " + num_trials);
let np_orbs = orbs; //delete in clean up
console.log("Num. Trials: " + num_trials);

if (num_wanted > 5) {
    console.log("0-499: " + ((buckets[8]) / num_trials));
    console.log("500-999: " + ((buckets[9]) / num_trials));
    console.log("1000-1499: " + ((buckets[10]) / num_trials));
    console.log("1500-1999: " + ((buckets[11]) / num_trials));
    console.log("2000-2499: " + ((buckets[12]) / num_trials));
    console.log("2500-2999: " + ((buckets[13]) / num_trials));
    console.log("3000-3499: " + ((buckets[14]) / num_trials));
    console.log("3500+: " + ((buckets[15]) / num_trials));
}
else {
    console.log("First pull: " + ((buckets[0]) / num_trials) * 100);
    /*console.log("0-49: " + ((buckets[1]) / num_trials));
    console.log("50-99: " + ((buckets[2]) / num_trials));
    console.log("100-149: " + ((buckets[3]) / num_trials));
    console.log("150-199: " + ((buckets[4]) / num_trials));
    console.log("200-249: " + ((buckets[5]) / num_trials));
    console.log("250-299: " + ((buckets[6]) / num_trials));
    console.log("300-349: " + ((buckets[7]) / num_trials));
    console.log("350+: " + ((buckets[16]) / num_trials));*/
}
//function for finding percentile from "philippe" on StackOverflow
function Quartile(data, q) {
    data = Array_Sort_Numbers(data);
    let pos = ((data.length) - 1) * q;
    let base = Math.floor(pos);
    let rest = pos - base;
    if ((data[base + 1] !== undefined)) {
        return data[base] + rest * (data[base + 1] - data[base]);
    } else {
        return data[base];
    }
}

function Array_Sort_Numbers(inputarray) {
    return inputarray.sort(function (a, b) {
        return a - b;
    });
}

console.log("Mean: " + math.mean(np_orbs));
console.log("Std. Dev.: " + math.std(np_orbs));
console.log("Median: " + math.median(np_orbs));
console.log("90th percentile: " + Quartile(np_orbs, .9));
console.log("Max (from this set of trials): " + Math.max(...np_orbs));
