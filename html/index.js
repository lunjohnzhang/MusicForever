let canvas;
let engine;
let scene;
let camera;
let manager;
let objects = [];
let trackMesh = [];
let sound;
let se = [
	new Howl({src: 'se/perfect.mp3'}),
	new Howl({src: 'se/great.mp3'}),
	new Howl({src: 'se/good.mp3'}),
	new Howl({src: 'se/bad.mp3'})
];
const MaxDepth = 50;
const MinDepth = -2;
const NoteLifeTime = 2;
const TrackRadius = 5.5;
const NoteType = {
	MULTI: 1,
	HOLD: 2
};
const eps = 1e-6;
const NumTracks = 9;
const NoteRange = [0.05, 0.1, 0.2, 0.3];
const NoteJudge = ['PERFECT', 'GREAT', 'GOOD', 'BAD', 'MISS'];
const NoteScore = [1, 0.8, 0.6, 0.4, 0];
const JudgeText = {
	DISTANCE: 20,
	SPEED: 0.6
};
const TotScore = 1000000;
let Auto = false;
const DefaultOffset = 0.1;

function debug(info) {
	document.getElementById('text').innerText += info + '\n';
}

// materials
let material = {};
let meshes = {};
let sprite = [];
let color;
let game = {
	time: 0,
	note: [{"s": 2.102, "track": 7}, {"s": 2.102, "track": 0}, {"s": 2.317, "track": 8}, {"s": 2.317, "track": 1}, {"s": 2.533, "track": 4}, {"s": 2.749, "track": 4}, {"s": 2.965, "track": 4}, {"s": 3.181, "track": 5}, {"s": 3.289, "track": 2}, {"s": 3.504, "track": 3}, {"s": 3.612, "track": 6}, {"s": 3.828, "track": 1}, {"s": 3.828, "track": 8}, {"s": 4.044, "track": 7}, {"s": 4.044, "track": 0}, {"s": 4.26, "track": 4}, {"s": 4.476, "track": 4}, {"s": 4.692, "track": 4}, {"s": 4.907, "track": 3}, {"s": 5.015, "track": 6}, {"s": 5.231, "track": 5}, {"s": 5.339, "track": 2}, {"s": 5.555, "track": 3}, {"s": 5.555, "track": 5}, {"s": 5.771, "track": 2}, {"s": 5.771, "track": 6}, {"s": 5.987, "track": 4}, {"s": 6.202, "track": 4}, {"s": 6.418, "track": 4}, {"s": 6.634, "track": 6}, {"s": 6.742, "track": 2}, {"s": 6.958, "track": 3}, {"s": 7.066, "track": 5}, {"s": 7.281, "track": 2}, {"s": 7.281, "track": 6}, {"s": 7.713, "track": 8}, {"s": 7.929, "track": 0}, {"s": 8.145, "track": 1}, {"s": 8.145, "track": 7}, {"s": 8.576, "track": 2}, {"s": 8.684, "track": 5}, {"s": 8.792, "track": 3}, {"s": 8.9, "track": 6}, {"s": 9.008, "track": 1}, {"s": 9.44, "track": 0}, {"s": 9.44, "track": 8}, {"s": 9.656, "track": 6}, {"s": 9.763, "track": 2}, {"s": 9.871, "track": 6}, {"s": 10.303, "track": 3}, {"s": 10.303, "track": 5}, {"s": 10.735, "track": 7}, {"s": 11.166, "track": 8}, {"s": 11.166, "track": 0}, {"s": 11.382, "track": 2}, {"s": 11.49, "track": 6}, {"s": 11.598, "track": 2}, {"s": 12.03, "track": 7}, {"s": 12.03, "track": 1}, {"s": 12.245, "track": 0}, {"s": 12.245, "track": 8}, {"s": 12.461, "track": 4}, {"s": 12.893, "track": 3}, {"s": 12.893, "track": 5}, {"s": 13.325, "track": 6}, {"s": 13.433, "track": 1}, {"s": 13.54, "track": 6}, {"s": 13.756, "track": 2}, {"s": 13.864, "track": 7}, {"s": 13.972, "track": 2}, {"s": 14.188, "track": 0}, {"s": 14.188, "track": 8}, {"s": 14.404, "track": 0}, {"s": 14.404, "track": 8}, {"s": 14.62, "track": 3}, {"s": 14.62, "track": 5}, {"s": 14.835, "track": 3}, {"s": 14.835, "track": 5}, {"s": 15.051, "track": 2}, {"s": 15.051, "track": 6}, {"s": 15.267, "track": 7}, {"s": 15.375, "track": 1}, {"s": 15.483, "track": 7}, {"s": 15.915, "track": 0, "l": 0.432}, {"s": 16.13, "track": 6}, {"s": 16.346, "track": 8}, {"s": 16.778, "track": 2, "l": 0.432}, {"s": 16.994, "track": 8}, {"s": 17.21, "track": 6}, {"s": 17.641, "track": 1, "l": 0.432}, {"s": 17.857, "track": 5}, {"s": 18.073, "track": 7}, {"s": 18.504, "track": 2}, {"s": 18.612, "track": 6}, {"s": 18.828, "track": 6}, {"s": 18.936, "track": 2}, {"s": 19.152, "track": 7}, {"s": 19.368, "track": 8, "l": 0.432}, {"s": 19.584, "track": 2}, {"s": 19.799, "track": 0}, {"s": 20.231, "track": 6, "l": 0.432}, {"s": 20.447, "track": 0}, {"s": 20.663, "track": 2}, {"s": 21.094, "track": 7, "l": 0.432}, {"s": 21.31, "track": 3}, {"s": 21.526, "track": 1}, {"s": 21.958, "track": 6}, {"s": 22.066, "track": 2}, {"s": 22.281, "track": 2}, {"s": 22.389, "track": 6}, {"s": 22.605, "track": 1}, {"s": 22.821, "track": 0, "l": 0.432}, {"s": 23.253, "track": 6}, {"s": 23.684, "track": 3}, {"s": 23.684, "track": 5}, {"s": 24.008, "track": 2}, {"s": 24.008, "track": 6}, {"s": 24.332, "track": 1}, {"s": 24.332, "track": 7}, {"s": 24.548, "track": 8, "l": 0.432}, {"s": 24.979, "track": 2}, {"s": 25.411, "track": 3}, {"s": 25.411, "track": 5}, {"s": 25.735, "track": 2}, {"s": 25.735, "track": 6}, {"s": 26.058, "track": 1}, {"s": 26.058, "track": 7}, {"s": 26.274, "track": 0}, {"s": 26.418, "track": 6}, {"s": 26.562, "track": 2}, {"s": 26.706, "track": 8}, {"s": 26.85, "track": 1}, {"s": 26.994, "track": 7}, {"s": 27.138, "track": 0}, {"s": 27.569, "track": 2}, {"s": 27.569, "track": 6}, {"s": 28.001, "track": 1}, {"s": 28.001, "track": 7}, {"s": 28.433, "track": 2}, {"s": 28.433, "track": 6}, {"s": 28.864, "track": 3}, {"s": 28.864, "track": 5}, {"s": 29.296, "track": 1}, {"s": 29.404, "track": 7}, {"s": 29.512, "track": 1}, {"s": 29.727, "track": 8, "l": 0.432}, {"s": 29.943, "track": 2}, {"s": 30.159, "track": 0}, {"s": 30.591, "track": 6, "l": 0.432}, {"s": 30.807, "track": 0}, {"s": 31.022, "track": 2}, {"s": 31.454, "track": 7, "l": 0.432}, {"s": 31.67, "track": 3}, {"s": 31.886, "track": 1}, {"s": 32.317, "track": 6}, {"s": 32.425, "track": 2}, {"s": 32.641, "track": 2}, {"s": 32.749, "track": 6}, {"s": 32.965, "track": 1}, {"s": 33.181, "track": 0, "l": 0.432}, {"s": 33.397, "track": 6}, {"s": 33.612, "track": 8}, {"s": 34.044, "track": 2, "l": 0.432}, {"s": 34.26, "track": 8}, {"s": 34.476, "track": 6}, {"s": 34.907, "track": 1, "l": 0.432}, {"s": 35.123, "track": 5}, {"s": 35.339, "track": 7}, {"s": 35.771, "track": 2}, {"s": 35.879, "track": 6}, {"s": 36.094, "track": 6}, {"s": 36.202, "track": 2}, {"s": 36.418, "track": 7}, {"s": 36.634, "track": 8, "l": 0.432}, {"s": 37.066, "track": 0}, {"s": 37.497, "track": 6}, {"s": 37.605, "track": 2}, {"s": 37.821, "track": 2}, {"s": 37.929, "track": 6}, {"s": 38.145, "track": 1}, {"s": 38.361, "track": 0, "l": 0.432}, {"s": 38.792, "track": 8}, {"s": 39.224, "track": 6}, {"s": 39.332, "track": 2}, {"s": 39.548, "track": 3}, {"s": 39.656, "track": 5}, {"s": 39.871, "track": 1}, {"s": 40.087, "track": 8}, {"s": 40.231, "track": 2}, {"s": 40.375, "track": 6}, {"s": 40.519, "track": 0}, {"s": 40.663, "track": 7}, {"s": 40.807, "track": 1}, {"s": 40.95, "track": 8}, {"s": 41.382, "track": 2}, {"s": 41.382, "track": 6}, {"s": 41.814, "track": 1}, {"s": 41.814, "track": 7}, {"s": 42.245, "track": 2}, {"s": 42.245, "track": 6}, {"s": 42.677, "track": 3}, {"s": 42.677, "track": 5}, {"s": 43.109, "track": 5}, {"s": 43.217, "track": 3}, {"s": 43.325, "track": 5}, {"s": 43.54, "track": 2}, {"s": 43.54, "track": 6}, {"s": 43.756, "track": 0}, {"s": 43.864, "track": 8}, {"s": 44.404, "track": 2}, {"s": 44.404, "track": 6}, {"s": 44.62, "track": 8}, {"s": 44.727, "track": 0}, {"s": 45.267, "track": 7}, {"s": 45.699, "track": 3}, {"s": 45.699, "track": 5}, {"s": 45.914, "track": 1}, {"s": 46.022, "track": 7}, {"s": 46.13, "track": 1}, {"s": 46.562, "track": 3}, {"s": 46.562, "track": 5}, {"s": 46.994, "track": 1}, {"s": 46.994, "track": 7}, {"s": 47.209, "track": 5}, {"s": 47.317, "track": 3}, {"s": 47.533, "track": 3}, {"s": 47.641, "track": 5}, {"s": 47.857, "track": 1}, {"s": 47.857, "track": 7}, {"s": 48.073, "track": 3}, {"s": 48.181, "track": 5}, {"s": 48.397, "track": 5}, {"s": 48.504, "track": 3}, {"s": 48.72, "track": 6}, {"s": 48.936, "track": 0}, {"s": 49.152, "track": 8}, {"s": 49.368, "track": 2}, {"s": 49.584, "track": 7}, {"s": 49.691, "track": 1}, {"s": 49.799, "track": 7}, {"s": 50.015, "track": 5}, {"s": 50.123, "track": 3}, {"s": 50.231, "track": 5}, {"s": 50.447, "track": 1, "l": 1.295}, {"s": 50.663, "track": 5}, {"s": 50.879, "track": 6}, {"s": 51.094, "track": 7}, {"s": 51.31, "track": 8}, {"s": 51.526, "track": 7}, {"s": 51.742, "track": 6}, {"s": 52.173, "track": 7, "l": 1.295}, {"s": 52.389, "track": 3}, {"s": 52.605, "track": 2}, {"s": 52.821, "track": 1}, {"s": 53.037, "track": 0}, {"s": 53.253, "track": 1}, {"s": 53.468, "track": 2}, {"s": 53.9, "track": 5}, {"s": 54.044, "track": 2}, {"s": 54.188, "track": 6}, {"s": 54.332, "track": 6}, {"s": 54.763, "track": 3}, {"s": 54.907, "track": 6}, {"s": 55.051, "track": 2}, {"s": 55.195, "track": 2}, {"s": 55.627, "track": 7, "l": 0.432}, {"s": 56.058, "track": 1, "l": 0.432}, {"s": 56.49, "track": 8, "l": 0.432}, {"s": 56.922, "track": 0, "l": 0.432}, {"s": 57.353, "track": 6, "l": 0.863}, {"s": 58.001, "track": 2}, {"s": 58.217, "track": 2}, {"s": 58.648, "track": 6}, {"s": 58.864, "track": 6}, {"s": 59.08, "track": 1, "l": 0.432}, {"s": 59.512, "track": 7, "l": 0.432}, {"s": 59.943, "track": 0, "l": 1.727}, {"s": 60.807, "track": 8, "l": 0.863}, {"s": 61.994, "track": 2}, {"s": 61.994, "track": 6}, {"s": 62.317, "track": 1}, {"s": 62.317, "track": 7}, {"s": 62.533, "track": 0}, {"s": 62.965, "track": 2}, {"s": 62.965, "track": 6}, {"s": 63.396, "track": 5}, {"s": 63.504, "track": 1}, {"s": 63.612, "track": 7}, {"s": 63.72, "track": 3}, {"s": 63.828, "track": 6, "l": 0.432}, {"s": 64.26, "track": 0}, {"s": 64.691, "track": 1}, {"s": 64.691, "track": 7}, {"s": 65.123, "track": 2}, {"s": 65.231, "track": 8}, {"s": 65.339, "track": 0}, {"s": 65.447, "track": 6}, {"s": 65.555, "track": 1, "l": 0.432}, {"s": 65.986, "track": 5}, {"s": 66.418, "track": 2}, {"s": 66.418, "track": 6}, {"s": 66.85, "track": 3}, {"s": 67.066, "track": 2}, {"s": 67.281, "track": 1}, {"s": 67.281, "track": 7}, {"s": 67.713, "track": 8}, {"s": 68.145, "track": 2}, {"s": 68.145, "track": 6}, {"s": 68.576, "track": 1}, {"s": 68.684, "track": 7}, {"s": 68.792, "track": 1}, {"s": 69.008, "track": 3}, {"s": 69.008, "track": 5}, {"s": 69.44, "track": 4}, {"s": 69.871, "track": 2}, {"s": 69.871, "track": 6}, {"s": 70.303, "track": 5}, {"s": 70.411, "track": 1}, {"s": 70.519, "track": 7}, {"s": 70.627, "track": 3}, {"s": 70.735, "track": 6, "l": 0.432}, {"s": 71.166, "track": 2}, {"s": 71.598, "track": 2}, {"s": 71.598, "track": 6}, {"s": 72.03, "track": 3}, {"s": 72.137, "track": 7}, {"s": 72.245, "track": 1}, {"s": 72.353, "track": 5}, {"s": 72.461, "track": 2, "l": 0.432}, {"s": 72.893, "track": 6}, {"s": 73.109, "track": 7}, {"s": 73.325, "track": 8}, {"s": 73.325, "track": 0}, {"s": 73.756, "track": 2}, {"s": 73.972, "track": 1}, {"s": 74.188, "track": 0}, {"s": 74.188, "track": 8}, {"s": 74.619, "track": 7}, {"s": 74.835, "track": 6}, {"s": 75.051, "track": 5}, {"s": 75.051, "track": 3}, {"s": 75.267, "track": 0}, {"s": 75.267, "track": 8}, {"s": 75.699, "track": 2}, {"s": 75.699, "track": 6}, {"s": 76.13, "track": 1}, {"s": 76.13, "track": 7}, {"s": 76.346, "track": 8}, {"s": 76.778, "track": 2}, {"s": 76.778, "track": 6}, {"s": 77.209, "track": 3}, {"s": 77.317, "track": 7}, {"s": 77.425, "track": 1}, {"s": 77.533, "track": 5}, {"s": 77.641, "track": 2, "l": 0.432}, {"s": 78.073, "track": 8}, {"s": 78.504, "track": 1}, {"s": 78.504, "track": 7}, {"s": 78.936, "track": 6}, {"s": 79.044, "track": 0}, {"s": 79.152, "track": 8}, {"s": 79.26, "track": 2}, {"s": 79.368, "track": 7, "l": 0.432}, {"s": 79.799, "track": 3}, {"s": 80.231, "track": 2}, {"s": 80.231, "track": 6}, {"s": 80.663, "track": 3}, {"s": 80.663, "track": 5}, {"s": 80.986, "track": 1}, {"s": 80.986, "track": 7}, {"s": 81.31, "track": 0}, {"s": 81.31, "track": 8}, {"s": 81.526, "track": 0}, {"s": 81.526, "track": 8}, {"s": 81.85, "track": 6}, {"s": 81.85, "track": 1}, {"s": 82.173, "track": 7}, {"s": 82.173, "track": 2}, {"s": 82.389, "track": 0}, {"s": 82.389, "track": 8}, {"s": 82.713, "track": 2}, {"s": 82.713, "track": 7}, {"s": 83.037, "track": 1}, {"s": 83.037, "track": 6}, {"s": 83.253, "track": 3}, {"s": 83.36, "track": 5}, {"s": 83.468, "track": 3}, {"s": 83.576, "track": 5}, {"s": 83.684, "track": 2, "l": 0.432}, {"s": 84.116, "track": 6}, {"s": 84.44, "track": 3}, {"s": 84.44, "track": 5}, {"s": 84.763, "track": 1}, {"s": 84.763, "track": 7}, {"s": 84.979, "track": 1}, {"s": 84.979, "track": 7}, {"s": 85.411, "track": 0}, {"s": 85.411, "track": 8}, {"s": 85.842, "track": 1}, {"s": 85.95, "track": 6}, {"s": 86.058, "track": 1}, {"s": 86.274, "track": 2}, {"s": 86.382, "track": 7}, {"s": 86.49, "track": 2}, {"s": 86.706, "track": 5}, {"s": 86.922, "track": 7}, {"s": 87.137, "track": 6}, {"s": 87.353, "track": 7}, {"s": 87.569, "track": 8}, {"s": 87.785, "track": 7}, {"s": 88.001, "track": 2}, {"s": 88.001, "track": 6}, {"s": 88.432, "track": 3}, {"s": 88.648, "track": 1}, {"s": 88.864, "track": 2}, {"s": 89.08, "track": 1}, {"s": 89.296, "track": 0}, {"s": 89.512, "track": 1}, {"s": 89.727, "track": 2}, {"s": 89.727, "track": 6}, {"s": 90.159, "track": 8, "l": 0.647}, {"s": 90.375, "track": 2}, {"s": 90.591, "track": 1}, {"s": 90.807, "track": 0, "l": 0.647}, {"s": 91.022, "track": 6}, {"s": 91.238, "track": 7}, {"s": 91.454, "track": 8}, {"s": 91.886, "track": 3, "l": 0.432}, {"s": 92.317, "track": 6, "l": 0.432}, {"s": 92.749, "track": 2, "l": 0.432}, {"s": 93.181, "track": 5, "l": 0.432}, {"s": 93.612, "track": 1, "l": 0.216}, {"s": 93.828, "track": 8, "l": 0.216}, {"s": 94.044, "track": 0, "l": 0.216}, {"s": 94.26, "track": 7, "l": 0.216}, {"s": 94.476, "track": 0, "l": 0.863}, {"s": 94.907, "track": 8, "l": 0.432}, {"s": 96.202, "track": 2}, {"s": 96.202, "track": 6}, {"s": 96.526, "track": 3}, {"s": 96.526, "track": 5}, {"s": 96.85, "track": 1}, {"s": 96.85, "track": 7}, {"s": 97.065, "track": 0}, {"s": 97.497, "track": 1}, {"s": 97.497, "track": 6}, {"s": 97.929, "track": 1}, {"s": 98.037, "track": 6}, {"s": 98.145, "track": 2}, {"s": 98.253, "track": 7}, {"s": 98.36, "track": 0, "l": 0.432}, {"s": 98.792, "track": 8}, {"s": 99.224, "track": 7}, {"s": 99.224, "track": 2}, {"s": 99.655, "track": 7}, {"s": 99.763, "track": 2}, {"s": 99.871, "track": 6}, {"s": 99.979, "track": 1}, {"s": 100.087, "track": 8, "l": 0.432}, {"s": 100.519, "track": 0}, {"s": 100.95, "track": 3}, {"s": 100.95, "track": 5}, {"s": 101.382, "track": 2}, {"s": 101.382, "track": 6}, {"s": 101.814, "track": 1}, {"s": 101.814, "track": 7}, {"s": 102.245, "track": 0}, {"s": 102.245, "track": 8}, {"s": 102.569, "track": 2}, {"s": 102.569, "track": 6}, {"s": 102.893, "track": 1}, {"s": 102.893, "track": 7}, {"s": 103.109, "track": 5}, {"s": 103.217, "track": 3}, {"s": 103.324, "track": 5}, {"s": 103.54, "track": 1}, {"s": 103.54, "track": 7}, {"s": 103.972, "track": 0}, {"s": 104.188, "track": 6}, {"s": 104.404, "track": 2}, {"s": 104.619, "track": 8}, {"s": 104.835, "track": 1}, {"s": 105.051, "track": 7}, {"s": 105.267, "track": 3}, {"s": 105.267, "track": 5}, {"s": 105.699, "track": 6}, {"s": 105.914, "track": 7}, {"s": 106.13, "track": 8}, {"s": 106.13, "track": 0}, {"s": 106.562, "track": 2}, {"s": 106.778, "track": 1}, {"s": 106.778, "track": 7}, {"s": 106.994, "track": 0}, {"s": 106.994, "track": 8}, {"s": 107.425, "track": 2, "l": 0.863}, {"s": 107.641, "track": 5}, {"s": 107.857, "track": 6}, {"s": 108.073, "track": 7}, {"s": 108.288, "track": 8, "l": 0.863}, {"s": 108.504, "track": 0}, {"s": 108.72, "track": 1}, {"s": 108.936, "track": 2}, {"s": 109.152, "track": 3}, {"s": 109.368, "track": 6}, {"s": 109.583, "track": 2}, {"s": 109.799, "track": 5}, {"s": 110.015, "track": 0}, {"s": 110.123, "track": 8}, {"s": 110.231, "track": 1}, {"s": 110.339, "track": 7}, {"s": 110.447, "track": 2}, {"s": 110.555, "track": 6}, {"s": 110.663, "track": 3}, {"s": 110.771, "track": 5}, {"s": 110.878, "track": 3, "l": 0.432}, {"s": 111.094, "track": 7}, {"s": 111.31, "track": 6}, {"s": 111.526, "track": 5, "l": 0.432}, {"s": 111.742, "track": 1}, {"s": 111.958, "track": 2}, {"s": 112.173, "track": 3, "l": 0.216}, {"s": 112.389, "track": 8, "l": 0.216}, {"s": 112.605, "track": 0, "l": 0.216}, {"s": 112.821, "track": 5, "l": 0.216}, {"s": 113.037, "track": 2, "l": 0.216}, {"s": 113.253, "track": 6, "l": 0.216}, {"s": 113.468, "track": 1}, {"s": 113.684, "track": 0}, {"s": 113.684, "track": 8}, {"s": 113.9, "track": 2}, {"s": 113.9, "track": 6}, {"s": 114.116, "track": 7}, {"s": 114.332, "track": 2}, {"s": 114.332, "track": 6}, {"s": 114.547, "track": 3}, {"s": 114.547, "track": 5}, {"s": 114.763, "track": 3, "l": 2.59}, {"s": 117.353, "track": 5}, {"s": 117.569, "track": 2}, {"s": 117.569, "track": 6}, {"s": 118.001, "track": 1}, {"s": 118.001, "track": 7}, {"s": 118.432, "track": 0}, {"s": 118.432, "track": 8}],
	combo: 0,
	score: 0
};

function update() {
	for (let i = 0; i < objects.length; i++) {
		if (objects[i].removed) {
			objects.splice(i, 1);
			i--;
		}
	}
	for (let i in objects) {
		let cur = objects[i];
		if (cur.update != undefined && cur.update) {
			cur.update(cur);
		}
	}
}

function copyMaterial(dest, src) {
	dest.alpha = src.alpha;
	dest.diffuseColor = src.diffuseColor;
}

function newNote(cur, id) {
	let track = cur.track;
	let rad = track * Math.PI / (NumTracks-1) - Math.PI;
	let x = Math.cos(rad);
	let y = Math.sin(rad);
	let body;
	if (cur.t & NoteType.HOLD) {
		let depth = 1 + (MaxDepth - MinDepth) * cur.l / NoteLifeTime;
		body = new BABYLON.MeshBuilder.CreateBox('note' + id, {
			width: 1.6, height: 0.5, depth: depth
		}, scene);
		cur.depth = depth;
		if (cur.t & NoteType.MULTI) {
			body.material = material.purple;
		} else {
			body.material = material.green;
		}
	} else if (cur.t & NoteType.MULTI) {
		body = meshes.multinote.createInstance();
	} else {
		body = meshes.note.createInstance();
	}
	body.position = new BABYLON.Vector3(x*(TrackRadius-0.5), y*(TrackRadius-0.5), MaxDepth);
	body.rotation = new BABYLON.Vector3(0, 0, rad - Math.PI / 2);
	body.isPickable = false;
	cur.body = body;
	cur.id = id;
	cur.update = updateNote;
	objects.push(cur);
}

function removeObject(obj) {
	obj.removed = true;
	if (obj.body) {
		obj.body.dispose();
	}
}

function updateNote(note) {
	let start = note.s;
	let body = note.body;
	let diff = start - game.time;
	let ratio = diff / NoteLifeTime;
	if (note.tail == undefined || note.tail == null) {
		if (Auto && diff <= NoteRange[0] / 2) {
			PressOn(note.track);
			if (note.l == undefined || note.l == null) {
				setTimeout(() => {
					PressOff(note.track);
				}, 50);
			}
		}
		if (diff < -NoteRange[NoteRange.length - 1]) {
			judgeNote(note, 1, 4);
		}
	} else {
		diff = note.tail - game.time;
		if (Auto && diff <= NoteRange[0] / 2) {
			PressOff(note.track);
		}
		if (diff < -NoteRange[NoteRange.length - 1]) {
			judgeNote(note, 1, 4);
		}
	}
	if (note.l == undefined || note.l == null) {
		body.position.z = ratio * (MaxDepth - MinDepth) + MinDepth;
	} else {
		body.position.z = ratio * (MaxDepth - MinDepth) + MinDepth + (note.depth-1)/2;
	}
}

function createScene() {
	// Create a basic BJS Scene object
	scene = new BABYLON.Scene(engine);
    manager = new BABYLON.GUI.GUI3DManager(scene);
	// Create a FreeCamera, and set its position to {x: 0, y: 5, z: -10}
	camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 1, -10), scene);
	// Target the camera to scene origin
	camera.setTarget(new BABYLON.Vector3(0, -3, 0));
	// Attach the camera to the canvas
	// camera.attachControl(canvas, false);
	// Create two lights
	//	let light1 = new BABYLON.SpotLight('light1', new BABYLON.Vector3(0, 10, -10), new BABYLON.Vector3(0, 0, 1), Math.PI, 0, scene);
	let light1 = new BABYLON.PointLight('light1', new BABYLON.Vector3(0, 0, -5), scene);
	light1.intensity = 1.5;
	// Create colors
	color = {
		track: new BABYLON.Color3(1, 0.6, 0.8),
		red: new BABYLON.Color3(1, 0, 0),
		green: new BABYLON.Color3(0, 1, 0.9),
		white: new BABYLON.Color3(1, 1, 1),
		black: new BABYLON.Color3(0, 0, 0),
		blue: new BABYLON.Color3(0, 0, 1),
		purple: new BABYLON.Color3(1, 0, 1)
	};
	// Create materials
	material.track = new BABYLON.StandardMaterial(scene);
	material.track.alpha = 1;
	material.track.diffuseColor = color.track;
	material.red = new BABYLON.StandardMaterial(scene);
	material.red.alpha = 0.5;
	material.red.diffuseColor = color.red;
	material.red.specularColor = color.black;
	material.green = new BABYLON.StandardMaterial(scene);
	material.green.alpha = 1;
	material.green.diffuseColor = color.green;
	material.purple = new BABYLON.StandardMaterial(scene);
	material.purple.alpha = 1;
	material.purple.diffuseColor = color.purple;
	for (let i in material) {
		material[i].freeze();
	}
	// Create meshes
	meshes.block = BABYLON.MeshBuilder.CreateBox('block', {
		width: 1.6, height: 0.51, depth: 1
	}, scene);
	meshes.block.material = material.red;
	meshes.note = BABYLON.MeshBuilder.CreateBox('note', {
		width: 1.6, height: 0.5, depth: 1
	}, scene);
	meshes.note.material = material.green;
	meshes.multinote = BABYLON.MeshBuilder.CreateBox('multinote', {
		width: 1.6, height: 0.5, depth: 1
	}, scene);
	meshes.multinote.material = material.purple;
	for (let i in meshes) {
		meshes[i].setEnabled(false);
	}
	// Load sprites
	sprite.push(new BABYLON.SpriteManager("PERFECT", "img/perfect.png", 20, {width: 196, height: 33}, scene));
	sprite.push(new BABYLON.SpriteManager("GREAT", "img/great.png", 20, {width: 147, height: 33}, scene));
	sprite.push(new BABYLON.SpriteManager("GOOD", "img/good.png", 20, {width: 127, height: 33}, scene));
	sprite.push(new BABYLON.SpriteManager("BAD", "img/bad.png", 20, {width: 82, height: 31}, scene));
	sprite.push(new BABYLON.SpriteManager("MISS", "img/miss.png", 20, {width: 93, height: 30}, scene));
	for (let i in sprite)
		sprite[i].isPickable = false;
	// Create tracks
	for (let i=0; i<NumTracks; i++) {
		let rad = i * Math.PI / (NumTracks-1) - Math.PI;
		let x = Math.cos(rad);
		let y = Math.sin(rad);

		// track
		let track = BABYLON.MeshBuilder.CreateBox('track', {
			width: 2, height: 0.01, depth: MaxDepth * 2.5
		}, scene);
		track.material = new BABYLON.StandardMaterial(scene);
		copyMaterial(track.material, material.track);
		track.position = new BABYLON.Vector3(x*TrackRadius, y*TrackRadius, -5);
		track.rotation = new BABYLON.Vector3(0, 0, rad + Math.PI / 2);
		track.freezeWorldMatrix();
		trackMesh.push(track);

		// block
		let block = meshes.block.createInstance();
		block.position = new BABYLON.Vector3(x*(TrackRadius-0.51), y*(TrackRadius-0.51), MinDepth);
		block.rotation = new BABYLON.Vector3(0, 0, rad - Math.PI / 2);
		block.isPickable = false;
		block.freezeWorldMatrix();
		
		// track: actions
		let button = new BABYLON.GUI.MeshButton3D(track, 'trackbutton' + i);
		button.onPointerDownObservable.add(function() {
			PressOn(i);
		});
		button.onPointerUpObservable.add(function() {
			PressOff(i);
		});
		if (!Auto)
			manager.addControl(button);
	}
}

$(document).ready(() => {
	$('#filebutton').click(() => {
		$('#file').trigger('click');
	});
	$('#playbutton').hide();
	$('#playbutton').click(() => {
		Auto = false;
		startGame();
		sound.play();
	});
	$('#autobutton').hide();
	$('#autobutton').click(() => {
		Auto = true;
		startGame();
		sound.play();
	});
});

function startGame() {
	$('form').css('display', 'none');
	$('.game').css('display', 'block');
	// Get the canvas DOM element
	canvas = document.getElementById('gamecanvas');
	// Load the 3D engine
	engine = new BABYLON.Engine(canvas, true);
	createScene();
	analyzeNotes();
	// run the render loop
	engine.runRenderLoop(function(){
		game.time = sound.currentTime + DefaultOffset;
		noteGenerator();
		update();
		scene.render();
	});
	// the canvas/window resize event handler
	window.addEventListener('resize', function(){
		engine.resize();
	});
}