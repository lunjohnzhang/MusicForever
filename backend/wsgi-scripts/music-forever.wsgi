#!/usr/bin/python3
import sys
sys.path.insert(0, "/var/www/html")
sys.path.append('/usr/lib/python3.5/site-packages')

from MusicForever import app as application
application.debug = True
