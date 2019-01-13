// user input
function PressOn(track) {
	let head = game.judgehead[track];
	trackMesh[track].material.diffuseColor = color.white;
	let queue = game.track[track];
	if (head >= queue.length)
		return;
	if (queue[head].tail)
		return;
	let cur = queue[head];
	let dif = Math.abs(cur.s - sound.currentTime - DefaultOffset);
	for (let i in NoteRange) {
		if (dif <= NoteRange[i]) {
			if (cur.l != undefined && cur.l != null) {
				judgeNote(cur, 0, i);
				cur.tail = cur.s + cur.l;
			} else {
				judgeNote(cur, 1, i);
			}
			return;
		}
	}
}

function PressOff(track) {
	let head = game.judgehead[track];
	let queue = game.track[track];
	trackMesh[track].material.diffuseColor = color.track;
	if (head >= queue.length)
		return;
	if (queue[head].tail == undefined || queue[head].tail == null)
		return;
	let cur = queue[head];
	let dif = Math.abs(cur.tail - sound.currentTime - DefaultOffset);
	for (let i in NoteRange) {
		if (dif <= NoteRange[i]) {
			judgeNote(cur, 1, i);
			return;
		}
	}
	judgeNote(cur, 1, 4);
}

// update judge
function updateJudge(cur) {
	let body = cur.body;
	body.position.z -= JudgeText.SPEED;
	body.color.a -= 0.04;
	if (body.color.a <= 0)
		removeObject(cur);
}

// init
function analyzeNotes() {
	let note = game.note;
	game.track = [];
	game.head = [];
	game.judgehead = [];
	for (let i=0; i<NumTracks; i++) {
		game.track.push([]);
		game.head.push(0);
		game.judgehead.push(0);
	}
	game.notecnt = note.length;
	for (let i=0; i<note.length; i++) {
		note[i].t = 0;
		if (note[i].l != undefined && note[i].l != null) {
			note[i].t |= NoteType.HOLD;
			game.notecnt++;
		}
		for (let j=0; j<note.length; j++) {
			if (j == i) continue;
			if (Math.abs(note[i].s - note[j].s) <= eps) {
				note[i].t |= NoteType.MULTI;
				break;
			}
		}
		game.track[note[i].track].push(note[i]);
	}
	for (let i=0; i<NumTracks; i++) {
		game.track[i].sort((a, b) => {return a.s - b.s;});
	}
}

// Update each frame
function noteGenerator() {
	for (let i=0; i<NumTracks; i++) {
		let n = game.track[i].length;
		while (game.head[i] < n) {
			let cur = game.track[i][game.head[i]];
			if (cur.s > game.time + NoteLifeTime)
				break;
			newNote(cur, game.head[i]);
			game.head[i]++;
		}
	}
}

// judge
function judgeNote(note, remove, result) {
	// debug(NoteJudge[result] + ': ' + remove);
	if (remove) {
		game.judgehead[note.track]++;
		removeObject(note);
	}
	let text = new BABYLON.Sprite(NoteJudge[result], sprite[result]);
	text.position = new BABYLON.Vector3(0, -1, JudgeText.DISTANCE);
	text.height = 2;
	text.width = sprite[result].cellWidth / sprite[result].cellHeight * text.height;
	objects.push({
		body: text,
		update: updateJudge
	});
	if (result <= 2) {
		game.combo++;
		document.getElementById('combo').innerText = 'COMBO x ' + game.combo;
	} else {
		game.combo = 0;
		document.getElementById('combo').innerText = '';
	}
	game.score += NoteScore[result];
	let score = Math.round(TotScore * game.score / game.notecnt);
	score = score.toString();
	while (score.length < 6)
		score = '0' + score;
	document.getElementById('score').innerText = 'SCORE: ' + score;

	// play se
	if (result < se.length)
		se[result].play();
}