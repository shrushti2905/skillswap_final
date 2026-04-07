from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import Avg, Count
from .serializers import SignupSerializer, LoginSerializer, UserSerializer, ProfileUpdateSerializer, SkillSerializer
from .authentication import generate_token

User = get_user_model()


def _blocked_response(request):
    if getattr(request.user, 'is_blocked', False):
        return Response({
            'error': 'Forbidden',
            'message': 'Your account is blocked.'
        }, status=status.HTTP_403_FORBIDDEN)
    return None

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        data = serializer.validated_data
        
        user = User.objects.create_user(
            username=data['email'],
            email=data['email'],
            first_name=data['name'],
            password=data['password'],
            role='user'
        )
        
        token = generate_token(user)
        user_serializer = UserSerializer(user)
        
        return Response({
            'token': token,
            'user': user_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'error': 'Bad Request',
        'message': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token = generate_token(user)
        user_serializer = UserSerializer(user)
        
        return Response({
            'token': token,
            'user': user_serializer.data
        })
    
    return Response({
        'error': 'Unauthorized',
        'message': serializer.errors.get('non_field_errors', ['Invalid credentials'])[0]
    }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def me(request):
    blocked = _blocked_response(request)
    if blocked:
        return blocked
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
def list_users(request):
    blocked = _blocked_response(request)
    if blocked:
        return blocked

    search = request.GET.get('search')
    skill = request.GET.get('skill')
    sort = request.GET.get('sort')
    availability = request.GET.get('availability')
    location = request.GET.get('location')
    try:
        page = max(int(request.GET.get('page', 1)), 1)
        limit = max(min(int(request.GET.get('limit', 20)), 100), 1)
    except (TypeError, ValueError):
        return Response({
            'error': 'Bad Request',
            'message': 'Invalid pagination values'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    users = User.objects.filter(is_blocked=False, is_public=True)
    if request.user.is_authenticated and request.user.is_public:
        users = users | User.objects.filter(id=request.user.id)
    
    if search:
        users = users.filter(
            models.Q(first_name__icontains=search) | 
            models.Q(location__icontains=search)
        )
    
    if skill:
        users = users.filter(
            models.Q(skills_offered__contains=skill) | 
            models.Q(skills_wanted__contains=skill)
        )

    if location:
        users = users.filter(location__icontains=location)
        
    if availability:
        users = users.filter(availability__icontains=availability)

    if sort == 'highest_rated':
        users = users.order_by('-rating', '-rating_count')
    elif sort == 'online_now':
        pass # mock online, just leave as is
    elif sort == 'new_members':
        users = users.order_by('-id')
    
    total = users.count()
    start = (page - 1) * limit
    end = start + limit
    
    users = users[start:end]
    serializer = UserSerializer(users, many=True)
    
    return Response({
        'users': serializer.data,
        'total': total,
        'page': page,
        'limit': limit
    })

@api_view(['GET', 'PUT'])
def get_profile(request):
    blocked = _blocked_response(request)
    if blocked:
        return blocked

    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    serializer = ProfileUpdateSerializer(data=request.data)
    if serializer.is_valid():
        data = serializer.validated_data
        if 'name' in data:
            request.user.first_name = data['name']
        if 'bio' in data:
            request.user.bio = data['bio']
        if 'location' in data:
            request.user.location = data['location']
        if 'profile_image' in data:
            request.user.profile_image = data['profile_image']
        if 'availability' in data:
            request.user.availability = data['availability']
        if 'is_public' in data:
            request.user.is_public = data['is_public']
        request.user.save()
        return Response(UserSerializer(request.user).data)
    return Response({
        'error': 'Bad Request',
        'message': 'No fields to update'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_profile(request):
    blocked = _blocked_response(request)
    if blocked:
        return blocked

    serializer = ProfileUpdateSerializer(data=request.data)
    if serializer.is_valid():
        data = serializer.validated_data
        if 'name' in data:
            request.user.first_name = data['name']
        if 'bio' in data:
            request.user.bio = data['bio']
        if 'location' in data:
            request.user.location = data['location']
        if 'profile_image' in data:
            request.user.profile_image = data['profile_image']
        if 'availability' in data:
            request.user.availability = data['availability']
        if 'is_public' in data:
            request.user.is_public = data['is_public']
        request.user.save()
        return Response(UserSerializer(request.user).data)
    return Response({
        'error': 'Bad Request',
        'message': 'No fields to update'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST', 'DELETE'])
def add_skill_offered(request):
    blocked = _blocked_response(request)
    if blocked:
        return blocked

    if request.method == 'DELETE':
        serializer = SkillSerializer(data=request.data)
        if serializer.is_valid():
            skill = serializer.validated_data['skill']
            if skill in request.user.skills_offered:
                request.user.skills_offered.remove(skill)
                request.user.save()
            return Response(UserSerializer(request.user).data)
        return Response({
            'error': 'Bad Request',
            'message': 'Skill is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    serializer = SkillSerializer(data=request.data)
    if serializer.is_valid():
        skill = serializer.validated_data['skill']
        if skill in request.user.skills_offered:
            return Response({
                'error': 'Bad Request',
                'message': 'Skill already added'
            }, status=status.HTTP_400_BAD_REQUEST)
        request.user.skills_offered.append(skill)
        request.user.save()
        return Response(UserSerializer(request.user).data)
    return Response({
        'error': 'Bad Request',
        'message': 'Skill is required'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def remove_skill_offered(request):
    blocked = _blocked_response(request)
    if blocked:
        return blocked

    serializer = SkillSerializer(data=request.data)
    if serializer.is_valid():
        skill = serializer.validated_data['skill']
        
        if skill in request.user.skills_offered:
            request.user.skills_offered.remove(skill)
            request.user.save()
        
        return Response(UserSerializer(request.user).data)
    
    return Response({
        'error': 'Bad Request',
        'message': 'Skill is required'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST', 'DELETE'])
def add_skill_wanted(request):
    blocked = _blocked_response(request)
    if blocked:
        return blocked

    if request.method == 'DELETE':
        serializer = SkillSerializer(data=request.data)
        if serializer.is_valid():
            skill = serializer.validated_data['skill']
            if skill in request.user.skills_wanted:
                request.user.skills_wanted.remove(skill)
                request.user.save()
            return Response(UserSerializer(request.user).data)
        return Response({
            'error': 'Bad Request',
            'message': 'Skill is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    serializer = SkillSerializer(data=request.data)
    if serializer.is_valid():
        skill = serializer.validated_data['skill']
        if skill in request.user.skills_wanted:
            return Response({
                'error': 'Bad Request',
                'message': 'Skill already added'
            }, status=status.HTTP_400_BAD_REQUEST)
        request.user.skills_wanted.append(skill)
        request.user.save()
        return Response(UserSerializer(request.user).data)
    return Response({
        'error': 'Bad Request',
        'message': 'Skill is required'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def remove_skill_wanted(request):
    blocked = _blocked_response(request)
    if blocked:
        return blocked

    serializer = SkillSerializer(data=request.data)
    if serializer.is_valid():
        skill = serializer.validated_data['skill']
        
        if skill in request.user.skills_wanted:
            request.user.skills_wanted.remove(skill)
            request.user.save()
        
        return Response(UserSerializer(request.user).data)
    
    return Response({
        'error': 'Bad Request',
        'message': 'Skill is required'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def add_review(request, id):
    blocked = _blocked_response(request)
    if blocked:
        return blocked

    try:
        reviewee = User.objects.get(id=id)
        if reviewee.is_blocked:
            return Response({'error': 'Bad Request', 'message': 'Cannot review this user'}, status=status.HTTP_400_BAD_REQUEST)
        if reviewee.id == request.user.id:
            return Response({'error': 'Bad Request', 'message': 'You cannot review yourself'}, status=status.HTTP_400_BAD_REQUEST)
        rating = int(request.data.get('rating', 5))
        text = request.data.get('text', '')

        if rating < 1 or rating > 5:
            return Response({'error': 'Bad Request', 'message': 'Rating must be between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)
        
        from .models import Review
        Review.objects.create(
            reviewer=request.user,
            reviewee=reviewee,
            rating=rating,
            text=text
        )

        # Update average rating using DB aggregate to avoid loading all reviews in Python.
        reviews = Review.objects.filter(reviewee=reviewee)
        agg = reviews.aggregate(avg_rating=Avg('rating'), total_reviews=Count('id'))
        reviewee.rating = round(agg['avg_rating'] or 0, 1)
        reviewee.rating_count = agg['total_reviews'] or 0
        reviewee.save()

        return Response(UserSerializer(reviewee).data)
    except User.DoesNotExist:
        return Response({'error': 'Not Found', 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_user_by_id(request, id):
    blocked = _blocked_response(request)
    if blocked:
        return blocked

    try:
        user = User.objects.get(id=id, is_blocked=False)
        if not user.is_public and request.user.id != user.id and not request.user.is_staff:
            return Response({
                'error': 'Forbidden',
                'message': 'User profile is private'
            }, status=status.HTTP_403_FORBIDDEN)
        serializer = UserSerializer(user)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({
            'error': 'Not Found',
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
