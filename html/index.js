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
	note: [],
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
	$('input[type=file]').on('change', uploadfile);
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