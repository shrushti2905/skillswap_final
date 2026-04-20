import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "skillswap.settings")
django.setup()

from accounts.models import User
from django.contrib.auth import get_user_model

User = get_user_model()

# Default admin credentials (consistent for all clones)
ADMIN_EMAIL = "admin@skillswap.com"
ADMIN_PASSWORD = "admin123"

def create_admin_user():
    """Create default admin user"""
    if not User.objects.filter(email=ADMIN_EMAIL).exists():
        User.objects.create_user(
            username=ADMIN_EMAIL,
            email=ADMIN_EMAIL,
            password=ADMIN_PASSWORD,
            first_name="Admin",
            last_name="User",
            role="admin",
            is_staff=True,
            is_superuser=True,
            location="Global",
            bio="Platform Administrator - Default Account",
            skills_offered=["Platform Management", "User Support"],
            skills_wanted=["Community Feedback"],
            availability=["24/7"],
            rating=5.0,
            rating_count=1,
            is_public=True
        )
        print(f"✅ Admin user created: {ADMIN_EMAIL}")
        print(f"   Password: {ADMIN_PASSWORD}")
        return True
    else:
        print(f"⏭️  Admin user already exists: {ADMIN_EMAIL}")
        return False

def create_sample_users():
    """Create sample users for demo"""
    sample_users = [
        {
            "email": "john.doe@example.com",
            "username": "john.doe@example.com", 
            "first_name": "John",
            "last_name": "Doe",
            "password": "demo123",
            "bio": "Full-stack developer passionate about learning new technologies",
            "location": "San Francisco, CA",
            "skills_offered": ["JavaScript", "React", "Node.js"],
            "skills_wanted": ["Python", "Machine Learning"],
            "availability": ["Weekends", "Evenings"]
        },
        {
            "email": "sarah.wilson@example.com",
            "username": "sarah.wilson@example.com",
            "first_name": "Sarah", 
            "last_name": "Wilson",
            "password": "demo123",
            "bio": "Data scientist with expertise in Python and ML",
            "location": "New York, NY",
            "skills_offered": ["Python", "Machine Learning", "Data Analysis"],
            "skills_wanted": ["React", "Web Development"],
            "availability": ["Weekdays", "Mornings"]
        },
        {
            "email": "mike.chen@example.com",
            "username": "mike.chen@example.com",
            "first_name": "Mike",
            "last_name": "Chen", 
            "password": "demo123",
            "bio": "Mobile app developer specializing in React Native",
            "location": "Austin, TX",
            "skills_offered": ["React Native", "iOS Development", "Flutter"],
            "skills_wanted": ["Backend Development", "DevOps"],
            "availability": ["Flexible", "Weekends"]
        }
    ]
    
    created_count = 0
    for user_data in sample_users:
        if not User.objects.filter(email=user_data["email"]).exists():
            User.objects.create_user(**user_data)
            created_count += 1
    
    if created_count > 0:
        print(f"✅ Created {created_count} sample users")
    else:
        print("⏭️  Sample users already exist")

def main():
    """Main seeding function"""
    print("🌱 Seeding database...")
    
    # Create admin user
    create_admin_user()
    
    # Create sample users
    create_sample_users()
    
    # Print summary
    total_users = User.objects.count()
    print(f"\n📊 Database Summary:")
    print(f"   Total users: {total_users}")
    print(f"   Admin users: {User.objects.filter(role='admin').count()}")
    print(f"   Regular users: {User.objects.filter(role='user').count()}")
    
    print(f"\n🔐 Access Information:")
    print(f"   Django Admin: http://localhost:8001/admin/")
    print(f"   Frontend: http://localhost:8000/")
    print(f"   Login: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")

if __name__ == "__main__":
    main()
