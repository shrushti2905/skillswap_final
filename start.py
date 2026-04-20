#!/usr/bin/env python3
"""
SkillSwap Platform - Ultra Simple Setup
Works on any fresh laptop with just Python
"""

import os
import sys
import subprocess
import threading
import time
import platform
import webbrowser
from pathlib import Path

def print_header():
    print("🚀 SkillSwap Platform - Ultra Simple Setup")
    print("=" * 50)
    print()

def run_simple_setup():
    """Fallback simple setup without virtual environment"""
    print("🔄 Running simple setup...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found!")
        return False
    
    os.chdir(backend_dir)
    
    # Install dependencies directly
    print("  → Installing dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements_simple.txt"], 
                      check=True)
    except:
        print("❌ Failed to install dependencies")
        return False
    
    # Setup database
    print("  → Setting up database...")
    try:
        subprocess.run([sys.executable, "manage.py", "migrate"], check=True)
        subprocess.run([sys.executable, "seed_database.py"], check=True)
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        return False
    
    print("✅ Simple setup complete!")
    return sys.executable

def setup_backend():
    """Complete backend setup with virtual environment"""
    print("🔧 Setting up backend...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found!")
        return False
    
    os.chdir(backend_dir)
    
    # Try virtual environment setup first
    try:
        # Create virtual environment
        print("  → Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", "venv"], 
                      check=True, capture_output=True)
        
        # Determine activation script
        if platform.system() == "Windows":
            activate_script = "venv\\Scripts\\python"
        else:
            activate_script = "venv/bin/python"
        
        # Install dependencies
        print("  → Installing dependencies...")
        subprocess.run([activate_script, "-m", "pip", "install", "-r", "requirements_simple.txt"], 
                      check=True, capture_output=True)
        
        # Setup database
        print("  → Setting up database...")
        subprocess.run([activate_script, "manage.py", "migrate"], check=True)
        subprocess.run([activate_script, "seed_database.py"], check=True)
        
        print("✅ Backend setup complete!")
        return activate_script
        
    except Exception as e:
        print(f"⚠️  Virtual environment setup failed: {e}")
        print("🔄 Trying simple setup instead...")
        return run_simple_setup()

def start_servers(python_path):
    """Start both servers"""
    print("🌐 Starting servers...")
    
    # Start backend
    def run_backend():
        try:
            subprocess.run([python_path, "manage.py", "runserver", "8001"], 
                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except:
            pass
    
    # Start frontend
    def run_frontend():
        try:
            subprocess.run([sys.executable, "-m", "http.server", "8000"], 
                          cwd="../frontend", stdout=subprocess.DEVNULL, 
                          stderr=subprocess.DEVNULL)
        except:
            pass
    
    # Start both servers
    threading.Thread(target=run_backend, daemon=True).start()
    threading.Thread(target=run_frontend, daemon=True).start()
    
    print("  → Backend starting on http://127.0.0.1:8001/")
    print("  → Frontend starting on http://localhost:8000/")
    time.sleep(5)
    
    return True

def show_success():
    """Show success info"""
    print("\n" + "=" * 50)
    print("🎉 SkillSwap Platform Ready!")
    print("=" * 50)
    print()
    print("📱 URLs:")
    print("   Frontend:     http://localhost:8000/")
    print("   Backend API:  http://127.0.0.1:8001/api/")
    print("   Django Admin: http://127.0.0.1:8001/admin/")
    print()
    print("👤 Login:")
    print("   Email:    admin@skillswap.com")
    print("   Password: admin123")
    print()
    print("🌐 Opening browser...")
    print("   Press Ctrl+C to stop")
    print("=" * 50)
    
    time.sleep(2)
    try:
        webbrowser.open("http://localhost:8000/")
    except:
        pass

def main():
    """Main function"""
    print_header()
    
    # Check Python
    try:
        version = sys.version_info
        if version.major < 3 or (version.major == 3 and version.minor < 8):
            print("❌ Python 3.8+ required")
            input("Press Enter to exit...")
            return
        print(f"✅ Python {version.major}.{version.minor} detected")
    except:
        print("❌ Python check failed")
        input("Press Enter to exit...")
        return
    
    # Setup backend
    python_path = setup_backend()
    if not python_path:
        print("❌ Setup failed")
        input("Press Enter to exit...")
        return
    
    # Start servers
    start_servers(python_path)
    show_success()
    
    # Keep running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down...")

if __name__ == "__main__":
    main()