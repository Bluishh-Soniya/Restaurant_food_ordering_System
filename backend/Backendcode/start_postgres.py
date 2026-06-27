"""
Script to start PostgreSQL 18 and verify it's running.
Run this from your terminal: python start_postgres.py
If it says 'Access denied', run your terminal as Administrator first.
"""
import subprocess
import sys
import os
import time

PG_BIN = r"C:\Program Files\PostgreSQL\18\bin"
PG_DATA = r"C:\Program Files\PostgreSQL\18\data"
PID_FILE = os.path.join(PG_DATA, "postmaster.pid")

print("=" * 50)
print("  PostgreSQL 18 Startup Script")
print("=" * 50)

# Step 1: Check if already running
print("\n[1/4] Checking if PostgreSQL is already running...")
result = subprocess.run(
    [os.path.join(PG_BIN, "pg_isready.exe"), "-h", "localhost", "-p", "5432"],
    capture_output=True, text=True
)
print(f"  Result: {result.stdout.strip()}")
if result.returncode == 0:
    print("\n✅ PostgreSQL is ALREADY running! You're good to go.")
    print("   Run: python manage.py migrate")
    sys.exit(0)

# Step 2: Remove stale PID file
print("\n[2/4] Removing stale postmaster.pid if present...")
if os.path.exists(PID_FILE):
    try:
        os.remove(PID_FILE)
        print("  ✅ Removed stale PID file.")
    except PermissionError:
        print("  ⚠️  Cannot remove PID file - run as Administrator!")
else:
    print("  No stale PID file found.")

# Step 3: Start PostgreSQL using pg_ctl
print("\n[3/4] Starting PostgreSQL server...")
pg_ctl = os.path.join(PG_BIN, "pg_ctl.exe")

# Try pg_ctl start first
result = subprocess.run(
    [pg_ctl, "start", "-D", PG_DATA, "-l", os.path.join(PG_DATA, "log", "startup.log")],
    capture_output=True, text=True,
    cwd=PG_BIN
)
print(f"  stdout: {result.stdout.strip()}")
if result.stderr.strip():
    print(f"  stderr: {result.stderr.strip()}")

# Step 4: Wait and verify
print("\n[4/4] Waiting for PostgreSQL to be ready...")
for i in range(10):
    time.sleep(2)
    result = subprocess.run(
        [os.path.join(PG_BIN, "pg_isready.exe"), "-h", "localhost", "-p", "5432"],
        capture_output=True, text=True
    )
    status = result.stdout.strip()
    print(f"  Attempt {i+1}/10: {status}")
    if result.returncode == 0:
        print("\n" + "=" * 50)
        print("  ✅ PostgreSQL is RUNNING!")
        print("  Now run: python manage.py migrate")
        print("=" * 50)
        sys.exit(0)

# If we get here, it didn't start
print("\n" + "=" * 50)
print("  ❌ PostgreSQL failed to start.")
print("  Try these steps:")
print("  1. Open terminal as ADMINISTRATOR")
print("  2. Run: python start_postgres.py")
print("  OR")
print("  1. Press Win+R, type: services.msc")
print("  2. Find 'postgresql-x64-18', right-click → Start")
print("=" * 50)

# Show recent log
log_file = os.path.join(PG_DATA, "log", "startup.log")
if os.path.exists(log_file):
    print("\nRecent log output:")
    with open(log_file, 'r') as f:
        lines = f.readlines()
        for line in lines[-10:]:
            print(f"  {line.rstrip()}")
