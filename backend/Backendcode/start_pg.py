import subprocess
import sys

# Try to find and start PostgreSQL service
service_names = [
    'postgresql-x64-17',
    'postgresql-x64-16', 
    'postgresql-x64-15',
    'postgresql-x64-14',
    'postgresql',
]

# First, list all services containing 'postgres'
print("=== Searching for PostgreSQL services ===")
try:
    result = subprocess.run(
        ['sc', 'query', 'type=', 'service', 'state=', 'all'],
        capture_output=True, text=True, shell=True
    )
    lines = result.stdout.split('\n')
    pg_services = []
    for i, line in enumerate(lines):
        if 'postgres' in line.lower() or 'postgresql' in line.lower():
            pg_services.append(line.strip())
            # Print surrounding lines for context
            for j in range(max(0, i-1), min(len(lines), i+5)):
                print(lines[j].rstrip())
            print("---")
    
    if not pg_services:
        print("No PostgreSQL service found via sc query.")
except Exception as e:
    print(f"Error querying services: {e}")

# Try starting common service names
print("\n=== Attempting to start PostgreSQL ===")
for name in service_names:
    try:
        result = subprocess.run(
            ['net', 'start', name],
            capture_output=True, text=True, shell=True
        )
        print(f"Trying '{name}': {result.stdout.strip()} {result.stderr.strip()}")
        if result.returncode == 0 or 'already been started' in result.stdout:
            print(f"SUCCESS: Service '{name}' is now running!")
            break
    except Exception as e:
        print(f"Error with '{name}': {e}")

# Check if port 5432 is now listening
print("\n=== Checking port 5432 ===")
try:
    result = subprocess.run(
        ['netstat', '-an'],
        capture_output=True, text=True, shell=True
    )
    for line in result.stdout.split('\n'):
        if '5432' in line:
            print(line.strip())
except Exception as e:
    print(f"Error checking port: {e}")
