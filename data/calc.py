import json
from pprint import pprint

with open("charts.json") as charts_data:
    charts = json.load(charts_data)
    print(len(charts))


with open("matrix.json") as matrix_data:
    matrix = json.load(matrix_data)
    print(len(matrix))
