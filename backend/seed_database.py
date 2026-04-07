import os
import django
import random
from faker import Faker

# IMPORTANT: correct project name
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "skillswap.settings")

django.setup()

from accounts.models import User
from django.contrib.auth import get_user_model

User = get_user_model()
fake = Faker("en_IN")

skills_list = [
    "Python", "JavaScript", "React", "Node.js", "Django", "Flask", "HTML/CSS", "UI/UX Design",
    "Graphic Design", "Video Editing", "Digital Marketing", "Content Writing", "Data Analysis",
    "Machine Learning", "Public Speaking", "Spanish", "French", "Guitar", "Piano", "Photography",
    "Cooking", "Yoga", "Fitness Training", "SEO", "Social Media", "Project Management"
]

availability_options = [
    "Weekends",
    "Evenings", 
    "Weekdays",
    "Flexible"
]

locations = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow"]

# Create admin users first
admin_users = [
    {
        "username": "shrushtipatil",
        "email": os.getenv("SEED_ADMIN_1_EMAIL", "admin1@example.com"),
        "password": os.getenv("SEED_ADMIN_PASSWORD", "ChangeMe@123"),
        "first_name": "Shrushti",
        "last_name": "Patil",
        "role": "admin"
    },
    {
        "username": "roshni",
        "email": os.getenv("SEED_ADMIN_2_EMAIL", "admin2@example.com"),
        "password": os.getenv("SEED_ADMIN_PASSWORD", "ChangeMe@123"),
        "first_name": "Roshni",
        "last_name": "",
        "role": "admin"
    }
]

for admin_data in admin_users:
    if not User.objects.filter(email=admin_data["email"]).exists():
        User.objects.create_user(
            username=admin_data["username"],
            email=admin_data["email"],
            password=admin_data["password"],
            first_name=admin_data["first_name"],
            last_name=admin_data.get("last_name", ""),
            role=admin_data["role"],
            is_staff=True,
            is_superuser=True,
            location="Mumbai",
            bio="Platform Administrator",
            skills_offered=["Platform Management", "User Support"],
            skills_wanted=["Community Feedback", "Feature Ideas"],
            availability=["Weekdays"],
            rating=5.0,
            rating_count=10,
            is_public=True
        )
        print(f"✅ Admin user created: {admin_data['email']}")

# Create regular users
created = 0
while created < 50:
    username = fake.user_name()
    email = fake.email()
    
    if not User.objects.filter(username=username).exists() and not User.objects.filter(email=email).exists():
        num_offered = random.randint(1, 4)
        num_wanted = random.randint(1, 3)
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password="Test@123",
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            location=random.choice(locations),
            bio=fake.text(max_nb_chars=200),
            skills_offered=random.sample(skills_list, num_offered),
            skills_wanted=random.sample(skills_list, num_wanted),
            availability=[random.choice(availability_options)],
            rating=round(random.uniform(3.5, 5.0), 1),
            rating_count=random.randint(1, 30),
            is_public=random.choice([True, True, True, False]),  # 75% public
            role="user"
        )
        
        created += 1
        if created % 10 == 0:
            print(f"✅ Created {created} users...")

print(f"\n🎉 Successfully created {created} users + 2 admin users")
print("Total users in database:", User.objects.count())