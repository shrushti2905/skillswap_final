#!/usr/bin/env python3
"""
SkillSwap Platform - Backend Setup
Simplified setup for backend only
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def setup_and_run():
    """Setup database and run server"""
    print("🔧 SkillSwap Backend Setup")
    print("=" * 30)
    
    # Determine Python executable
    if platform.system() == "Windows":
        if Path("venv/Scripts/python.exe").exists():
            python_cmd = "venv\\Scripts\\python"
        else:
            python_cmd = sys.executable
    else:
        if Path("venv/bin/python").exists():
            python_cmd = "venv/bin/python"
        else:
            python_cmd = sys.executable
    
    # Setup database
    print("📊 Setting up database...")
    try:
        subprocess.run([python_cmd, "manage.py", "migrate"], check=True)
        subprocess.run([python_cmd, "seed_database.py"], check=True)
        print("✅ Database ready!")
    except:
        print("❌ Database setup failed")
        return False
    
    # Start server
    print("🚀 Starting backend server...")
    print("   Backend API: http://127.0.0.1:8001/api/")
    print("   Django Admin: http://127.0.0.1:8001/admin/")
    print("   Login: admin@skillswap.com / admin123")
    print()
    print("Press Ctrl+C to stop server")
    
    try:
        subprocess.run([python_cmd, "manage.py", "runserver", "8001"])
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    
    return True

if __name__ == "__main__":
    setup_and_run()