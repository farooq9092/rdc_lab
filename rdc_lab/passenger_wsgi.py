import sys
import os

# Set up the path to your application
sys.path.insert(0, os.path.dirname(__file__))

# Import your Flask app instance
from app import app as application

# Passenger expects the object to be named 'application'
