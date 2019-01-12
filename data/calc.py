import json
from pprint import pprint
import os

directory_in_str = "matrix"
directory = os.fsencode(directory_in_str)
sizes = []
for file in os.listdir(directory):
    filename = os.fsdecode(file)
    print(filename)
    if filename.split(".")[1] != "json":
        continue
    with open("matrix/" + filename)as matrix_data:
        matrix = json.load(matrix_data)
        sizes.append((len(matrix[0]), len(matrix)))

maxM = 0
maxN = 0
for size in sizes:
    if maxM < size[0]:
        maxM = size[0]
    if maxN < size[1]:
        maxN = size[1]
print(str(maxM) + " " + str(maxN))