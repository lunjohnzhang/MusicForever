import numpy as np
import scipy as scipy
from scipy.io.wavfile import read as readwav
import scipy.signal
import os
import json
import codecs

directory_in_str = "wav_music"
directory = os.fsencode(directory_in_str)
result = {} # store all of the resulting matrix

for file in os.listdir(directory):
    filename = os.fsdecode(file)
    if filename.split(".")[1] != "wav":
        continue;
    rate, aud_data = readwav("wav_music/" + filename)
    
    # Convert stereo to mono
    aud_data = (aud_data[:, 0] + aud_data[:, 1]) / 2

    # Create the spectrogram for the music
    freqs, times, Sx = scipy.signal.spectrogram(aud_data, fs=rate, scaling='spectrum', mode="magnitude")
    # print(Sx)
    print(filename + " extracted")
    result[filename.split(".")[0]] = Sx.tolist()

# write stringified result object to file
print("saving matrixes as json...")
file_path = "matrix.json"
json.dump(result, codecs.open(file_path, 'w', encoding='utf-8'), separators=(',', ':'), sort_keys=True, indent=4)  # this saves the array in .json format
print("saved!")

