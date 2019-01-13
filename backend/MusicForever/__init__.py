import os
import sys
import requests
from flask import Flask, request, render_template, redirect
from pydub import AudioSegment
import random
import string
import json
from genchart import gen

app = Flask(__name__, static_url_path='', static_folder='/var/www/html/web')

html = '''
	<!DOCTYPE html>
	<title>Music Forever</title>
	<h1>Hello World!</h1>
	<form method = 'POST' action = '/run' enctype='multipart/form-data'>
	    <input type = 'file' name = 'file'/>
	    <input type = 'submit'>
	</form>
'''

UPLOAD_FOLDER = '/var/www/html/MusicForever/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def randomString(l):
    ret = ''
    for i in range(l):
        ret += random.choice(string.ascii_letters)
    return ret

@app.route('/', methods=['GET', 'POST'])
def home():
    return redirect('index.html')

@app.route('/run', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files['file']
        if file:
            filename = randomString(20)
            filepath = os.path.join(UPLOAD_FOLDER, filename + '.mp3')
            file.save(filepath)
            outputpath = os.path.join(UPLOAD_FOLDER, filename + '.wav')
            sound = AudioSegment.from_mp3(filepath)
            sound.export(outputpath, format="wav")
            # analyze
            ret = gen(outputpath)
            os.remove(filepath)
            os.remove(outputpath)
            return json.dumps(ret)
    return '{"error": "Unable to convert chart."}'

if __name__ == '__main__':
    app.run(debug=True)
