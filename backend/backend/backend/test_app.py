#!/usr/bin/env python
import sys
sys.path.insert(0, '.')

print("=" * 60)
print("DIAGNOSTIC TEST FOR APP")
print("=" * 60)

try:
    from app import app
    print("\n✓ Successfully imported app")
except Exception as e:
    print(f"\n✗ FAILED to import app: {e}")
    sys.exit(1)

print(f"\nApp routes registered: {len(list(app.url_map.iter_rules()))}")
print("\nAll routes:")
for rule in sorted(app.url_map.iter_rules(), key=lambda r: str(r)):
    print(f"  {rule.rule:30} -> {rule.endpoint}")

print("\n" + "=" * 60)
print("TESTING ROUTES WITH TEST CLIENT")
print("=" * 60)

client = app.test_client()

# Test home
print("\n1. Testing GET /")
resp = client.get('/')
print(f"   Status: {resp.status_code}")
print(f"   Response: {resp.data.decode()}")

# Test register
print("\n2. Testing POST /register")
resp = client.post('/register', json={"name": "Test", "email": "test@test.com", "password": "test123"})
print(f"   Status: {resp.status_code}")
print(f"   Response: {resp.data.decode()}")

# Test test route
print("\n3. Testing GET /test")
resp = client.get('/test')
print(f"   Status: {resp.status_code}")
print(f"   Response: {resp.data.decode()}")

print("\n" + "=" * 60)
