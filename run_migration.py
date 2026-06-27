"""
Run this script to apply the session_id migration.
Execute from the project root:
  Double-click run_migration.bat
"""
import os
import sys
import subprocess

# Set paths
project_root = os.path.dirname(os.path.abspath(__file__))
venv_python = os.path.join(project_root, "backend", ".venv", "Scripts", "python.exe")
manage_py = os.path.join(project_root, "backend", "Backendcode", "manage.py")

if not os.path.exists(venv_python):
    print(f"ERROR: Python not found at {venv_python}")
    sys.exit(1)

if not os.path.exists(manage_py):
    print(f"ERROR: manage.py not found at {manage_py}")
    sys.exit(1)

print("=" * 50)
print("Running makemigrations...")
print("=" * 50)
result1 = subprocess.run([venv_python, manage_py, "makemigrations", "orders"], capture_output=True, text=True)
print(result1.stdout)
if result1.stderr:
    print("STDERR:", result1.stderr)

print("=" * 50)
print("Running migrate...")
print("=" * 50)
result2 = subprocess.run([venv_python, manage_py, "migrate"], capture_output=True, text=True)
print(result2.stdout)
if result2.stderr:
    print("STDERR:", result2.stderr)

print("=" * 50)
print("Done!")
print("=" * 50)
