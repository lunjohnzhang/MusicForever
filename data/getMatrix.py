import numpy as np
import scipy as scipy
from scipy.io.wavfile import read as readwav
import scipy.signal
import os
import json
import codecs

# write stringified result object to file
def saveJson(filename, tosave):
    print("saving matrix" + filename + "as json...")
    file_path = "matrix/" + filename + ".json"
    json.dump(tosave, codecs.open(file_path, 'w', encoding='utf-8'), separators=(',', ':'), sort_keys=True, indent=4)  # this saves the array in .json format
    print("saved!\n")


directory_in_str = "wav_music"
directory = os.fsencode(directory_in_str)

for file in os.listdir(directory):
    filename = os.fsdecode(file)
    if filename.split(".")[1] != "wav":
        continue;
    rate, aud_data = readwav("wav_music/" + filename)
    
    # Convert stereo to mono
    aud_data = (aud_data[:, 0] + aud_data[:, 1]) / 2

    # Create the spectrogram for the music
    freqs, times, Sx = scipy.signal.spectrogram(aud_data, fs=rate, scaling='spectrum', mode="magnitude")
    
    print(filename + " extracted")
    saveJson(filename.split(".")[0], Sx.tolist())


