function uploadfile(e) {
	let ele = document.getElementById('file');
	sound = document.getElementById('sound');
	sound.src = URL.createObjectURL(ele.files[0]);
	sound.load();
	// don't forget to revoke the blobURI when you don't need it
	sound.onend = function() {
		URL.revokeObjectURL(ele.src);
	}
	$('#filebutton').hide();
	$('#playbutton').show();
	$('#autobutton').show();
}