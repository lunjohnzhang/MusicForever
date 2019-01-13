from __future__ import print_function
import sys
from aubio import source, notes
import json
import random
from ortools.graph import pywrapgraph

ACCEPTABLE_DIFF = 0.1
MIN_INTERVAL = 0.4
DOUBLE_RATE = 1.02
SUPPLY_RATE = 0.9
LEFT = 1
RIGHT = 2
NODE_SPLIT = 5
SCALE = 10000

def getNote(num, track):
	return num * NODE_SPLIT + track

def chart_generator(rawbeats, samplerate):
	G = pywrapgraph.SimpleMinCostFlow()
	beats = []
	prevbeat = -10
	for i in range(len(rawbeats)):
		t = rawbeats[i]['timing']
		if t - prevbeat >= MIN_INTERVAL / 2:
			beats.append(rawbeats[i])
			prevbeat = t
	n = len(beats)

	prop = [3 for i in range(n)]

	# average
	avg = 0
	for i in range(n):
		avg += beats[i]['note'][1]
	avg /= n

	# property
	for i in range(n-1):
		cur = beats[i]
		nxt = beats[i+1]
		curt = cur['note'][0]
		nxtt = nxt['note'][0]
		if nxtt - curt < MIN_INTERVAL:
			if prop[i] == 3:
				prop[i] -= random.randint(1, 2)
			prop[i+1] = 3 - prop[i]

	sink = getNote(n, 0)
	totsupply = 0
	for i in range(n):
		if cur['note'][1] > avg * DOUBLE_RATE or i == 0:
			G.SetNodeSupply(getNote(i, 0), 2)
			totsupply += 2
			# print('D', end='')
		else:
			G.SetNodeSupply(getNote(i, 0), 1)
			totsupply += 1
			# print('S', end='')
		cost = int(round(random.random() * ACCEPTABLE_DIFF * SCALE / 4))
		if prop[i] & LEFT:
			G.AddArcWithCapacityAndUnitCost(getNote(i, 0), getNote(i, 1), 1, cost // 4)
		else:
			G.AddArcWithCapacityAndUnitCost(getNote(i, 0), getNote(i, 1), 1, cost)
		cost = int(round(random.random() * ACCEPTABLE_DIFF * SCALE / 4))
		if prop[i] & RIGHT:
			G.AddArcWithCapacityAndUnitCost(getNote(i, 0), getNote(i, 3), 1, cost // 4)
		else:
			G.AddArcWithCapacityAndUnitCost(getNote(i, 0), getNote(i, 3), 1, cost)
		G.AddArcWithCapacityAndUnitCost(getNote(i, 1), getNote(i, 2), 1, 0)
		G.AddArcWithCapacityAndUnitCost(getNote(i, 3), getNote(i, 4), 1, 0)
		G.AddArcWithCapacityAndUnitCost(getNote(i, 2), sink, 1, 0)
		G.AddArcWithCapacityAndUnitCost(getNote(i, 4), sink, 1, 0)
		if i > 0:
			prev = beats[i-1]
			cur = beats[i]
			cost = (cur['timing'] - prev['timing'] - prev['note'][2] / samplerate) * (abs(cur['note'][1] - prev['note'][1]) / avg - ACCEPTABLE_DIFF)
			cost = int(round(cost * SCALE))
			G.AddArcWithCapacityAndUnitCost(getNote(i-1, 2), getNote(i, 1), 1, cost)
			G.AddArcWithCapacityAndUnitCost(getNote(i-1, 4), getNote(i, 3), 1, cost)
	totsupply = int(totsupply * SUPPLY_RATE)
	G.SetNodeSupply(sink, -totsupply)
	G.SolveMaxFlowWithMinCost()
	res1 = G.MaximumFlow()
	print('Maximum flow:', res1, 'Expected:', totsupply)
	res2 = G.OptimalCost()
	print('Optimal cost:', res2, 'Sink is:', sink)
	nhead = [None, None]
	ret = []
	cntlong = 0
	centercover = 0
	prevnote = 0
	for i in range(G.NumArcs()):
		# print('%1s -> %1s   %3s  / %3s       %3s' % (
	    #    	G.Tail(i),
    	# 	G.Head(i),
    	# 	G.Flow(i),
        # 	G.Capacity(i),
        # 	G.UnitCost(i)))
		if G.Flow(i) != 1:
			continue
		head = G.Tail(i)
		tail = G.Head(i)
		ahead = head // NODE_SPLIT
		atail = tail // NODE_SPLIT
		chead = head % NODE_SPLIT
		ctail = tail % NODE_SPLIT
		track = 'R'
		cur = None
		if ahead < n:
			cur = beats[ahead]
		if chead == 1 or chead == 2 or ctail == 1 or ctail == 2:
			track = 'L'
		# print('(', ahead, chead, ') -> (', atail, ctail, ')')
		if chead == 0:
			if track == 'L':
				nhead[0] = beats[ahead]
			else:
				nhead[1] = beats[ahead]
			# print('Startbeat: ' + str(ahead) + ' (' + track + ')')
		# if (chead == 2 or chead == 4) and (ctail == 1 or ctail  == 3):
		# 	print(str(ahead) + ' -> ' + str(ahead+1) + ' (' + track + ')')
		if tail == sink:
			length = 0
			atrack = None
			tmp = {}
			if track == 'L':
				length = cur['timing'] - nhead[0]['timing']
				tmp['s'] = nhead[0]['timing']
				atrack = random.randint(0, 4)
				nhead[0] = None
			else:
				length = cur['timing'] - nhead[1]['timing']
				tmp['s'] = nhead[1]['timing']
				atrack = random.randint(4, 8)
				nhead[1] = None
			if length >= MIN_INTERVAL:
				tmp['l'] = round(length * 1000) / 1000
				cntlong += 1
			tmp['track'] = atrack
			tmp['s'] = round(tmp['s'] * 1000) / 1000
			
			prevnote = cur['timing']
			if atrack == 4:
				if tmp['s'] - centercover < MIN_INTERVAL or 'l' in tmp:
					if track == 'L':
						tmp['track'] = random.randint(0, 3)
					else:
						tmp['track'] = random.randint(5, 8)
				centercover = prevnote
			ret.append(tmp)
			# print('Endbeat: ' + str(ahead) + ' (' + track + ')')
	print('long: ', cntlong, '/', len(ret))
	return ret

def gen(filename):
	downsample = 1
	samplerate = 0 // downsample
	win_s = 512 // downsample # fft size
	hop_s = 256 // downsample # hop size

	s = source(filename, samplerate, hop_s)
	samplerate = s.samplerate

	notes_o = notes("default", win_s, hop_s, samplerate)

	# print("%8s" % "time","[ start","vel","last ]")

	# total number of frames read
	total_frames = 0
	data = []
	while True:
		samples, read = s()
		new_note = notes_o(samples)
		if (new_note[0] != 0):
			# print("%.6f" % (total_frames/float(samplerate)), new_note)
			tmp = {}
			tmp['timing'] = total_frames / float(samplerate)
			tmp['note'] = new_note.tolist()
			data.append(tmp)
		total_frames += read
		if read < hop_s:
			break
	return chart_generator(data, float(samplerate))