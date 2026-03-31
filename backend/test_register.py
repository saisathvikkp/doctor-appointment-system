import json
import urllib.request

url = 'http://127.0.0.1:5000/register'

data = json.dumps({
    'name': 'test',
    'email': 'test@example.com',
    'password': 'pass'
}).encode('utf-8')

req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

print(urllib.request.urlopen(req).read().decode())
