function uploadfile(e) {
	let ele = document.getElementById('file');
	sound = document.getElementById('sound');
	sound.src = URL.createObjectURL(e.target.files[0]);
	sound.load();
	// don't forget to revoke the blobURI when you don't need it
	sound.onend = function() {
		URL.revokeObjectURL(sound.src);
	}
	$('#filebutton').addClass('disabled');
	$('#filebutton').unbind('click');
	$('#filebutton').text('Loading...');
	let fd = new FormData($('#form')[0]);    
	$.ajax({
		type: 'post',
		url: 'http://sbhacks.revuestarlight.club/run',
		data: fd,
		contentType: false,
        enctype: 'multipart/form-data',
        processData: false,
        cache: false
	})
	.done(function (resp) {
		let obj = JSON.parse(resp);
		if (obj.error) {
			alert(obj.error);
			return;
		}
		game.note = obj;
		$('#filebutton').hide();
		$('#playbutton').show();
		$('#autobutton').show();
	})
	.fail(function(resp) {
		alert(resp);
	});
}