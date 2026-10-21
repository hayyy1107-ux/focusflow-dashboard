#!/usr/bin/env python3
"""
FocusFlow - Development HTTP Server
Runs a lightweight local web server with proper MIME types and auto port detection.
"""

import http.server
import socketserver
import os
import sys

DEFAULT_PORT = 3000

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and caching headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    port = DEFAULT_PORT

    for attempt in range(10):
        try:
            with socketserver.TCPServer(("", port), Handler) as httpd:
                print("=" * 60)
                print(f"  🚀 FocusFlow Student Dashboard is running!")
                print(f"  👉 Local URL: http://localhost:{port}")
                print(f"  Press Ctrl+C to stop the server.")
                print("=" * 60)
                sys.stdout.flush()
                httpd.serve_forever()
                break
        except OSError as e:
            if "Address already in use" in str(e) or e.errno == 10048 or attempt < 9:
                port += 1
            else:
                raise

if __name__ == '__main__':
    main()
