#***
# output: [[start-time, end-time, is_long, which_key], [], ...]
#***
import json
import os
import codecs
import wave
import contextlib

def getDuration(live_name):
    fname = "wav_music/" + live_name + ".wav"
    with contextlib.closing(wave.open(fname, 'r')) as f:
        frames = f.getnframes()
        rate = f.getframerate()
        duration = frames / float(rate)
        return duration



directory_in_str = "data"
directory = os.fsencode(directory_in_str)
result = {} # dic of matrix to store data

for file in os.listdir(directory):
    song_matrix = []
    music_name = os.fsdecode(file) # music
    if music_name.find("origin") != -1:
        duration = getDuration(music_name.split(".")[0])  # duration of the music
        ob = json.load(codecs.open("data/" + music_name, 'r', 'utf-8-sig'))
        for node in ob["notes_list"]:
            # if the node is long type
            if node["effect"] == 3:
                is_long = 1
                which_key = node["position"]
                start_time = node["timing_sec"] / duration
                end_time = (node["timing_sec"] + node["effect_value"]) / duration
            # short type
            else:
                is_long = 0
                which_key = node["position"]
                start_time = node["timing_sec"] /duration
                end_time = node["timing_sec"] /duration
            line = [start_time, end_time, is_long, which_key]
            song_matrix.append(line)
        result[music_name.split(".")[0]] = song_matrix
# print(result)
# write result to json file
print("saving charts as json...")
file_path = "charts.json"
json.dump(result, codecs.open(file_path, 'w', encoding='utf-8'), separators=(',', ':'), sort_keys=True, indent=4)  # this saves the array in .json format
print("saved!")
