from rest_framework import serializers
from .models import SwapRequest
from accounts.models import User


class SwapUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'email',
            'location',
            'profile_image',
            'rating',
            'rating_count',
            'availability',
            'skills_offered',
            'skills_wanted',
            'is_public',
        ]

class SwapRequestSerializer(serializers.ModelSerializer):
    sender = SwapUserSerializer(read_only=True)
    receiver = SwapUserSerializer(read_only=True)
    
    class Meta:
        model = SwapRequest
        fields = ['id', 'sender', 'receiver', 'skill_offered', 'skill_requested', 'message', 'status', 'milestone', 'created_at']
    
class CreateSwapRequestSerializer(serializers.Serializer):
    receiver_id = serializers.IntegerField()
    skill_offered = serializers.CharField()
    skill_requested = serializers.CharField()
    message = serializers.CharField(required=False, allow_blank=True)

class UpdateRequestSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=SwapRequest.STATUS_CHOICES)
