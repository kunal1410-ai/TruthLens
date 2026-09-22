import os
import sys

# Ensure truthlens/backend is in the Python module search path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "..", "truthlens", "backend")
sys.path.insert(0, os.path.abspath(backend_dir))

from app.main import app
