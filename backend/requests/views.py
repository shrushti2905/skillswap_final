from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import models
from .models import SwapRequest, SwapMessage
from .serializers import SwapRequestSerializer, CreateSwapRequestSerializer, UpdateRequestSerializer
from notifications.models import Notification

User = get_user_model()


def _ensure_active_user(request):
    if getattr(request.user, 'is_blocked', False):
        return Response({
            'error': 'Forbidden',
            'message': 'Your account is blocked.'
        }, status=status.HTTP_403_FORBIDDEN)
    return None


def _create_swap_request(request, data):
    try:
        receiver = User.objects.get(id=data['receiver_id'], is_blocked=False)
    except User.DoesNotExist:
        return Response({
            'error': 'Bad Request',
            'message': 'Receiver not found'
        }, status=status.HTTP_400_BAD_REQUEST)

    if receiver.id == request.user.id:
        return Response({
            'error': 'Bad Request',
            'message': 'You cannot send a request to yourself.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Prevent duplicate pending requests
    existing_request = SwapRequest.objects.filter(
        sender=request.user,
        receiver=receiver,
        skill_offered=data['skill_offered'],
        skill_requested=data['skill_requested'],
        status='pending'
    ).exists()

    if existing_request:
        return Response({
            'error': 'Conflict',
            'message': 'A pending request for these skills already exists.'
        }, status=status.HTTP_409_CONFLICT)

    swap_request = SwapRequest.objects.create(
        sender=request.user,
        receiver=receiver,
        skill_offered=data['skill_offered'],
        skill_requested=data['skill_requested'],
        message=data.get('message', '')
    )

    Notification.objects.create(
        user=receiver,
        message=f"New skill swap request from {request.user.email}: {data['skill_offered']} for {data['skill_requested']}"
    )

    return Response(SwapRequestSerializer(swap_request).data, status=status.HTTP_201_CREATED)

@api_view(['GET', 'POST'])
def list_requests(request):
    blocked_response = _ensure_active_user(request)
    if blocked_response:
        return blocked_response

    if request.method == 'POST':
        serializer = CreateSwapRequestSerializer(data=request.data)
        if serializer.is_valid():
            return _create_swap_request(request, serializer.validated_data)
        return Response({
            'error': 'Bad Request',
            'message': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    status_filter = request.GET.get('status')
    type_filter = request.GET.get('type')  # 'sent' or 'received'
    try:
        page = max(int(request.GET.get('page', 1)), 1)
        limit = max(min(int(request.GET.get('limit', 20)), 100), 1)
    except (TypeError, ValueError):
        return Response({
            'error': 'Bad Request',
            'message': 'Invalid pagination values'
        }, status=status.HTTP_400_BAD_REQUEST)

    requests = SwapRequest.objects.select_related('sender', 'receiver')

    if request.user.is_staff:
        # Admin can inspect all requests unless explicitly filtered.
        pass
    elif type_filter == 'sent':
        requests = requests.filter(sender=request.user)
    elif type_filter == 'received':
        requests = requests.filter(receiver=request.user)
    else:
        # Safe default: only requests where current user is a participant.
        requests = requests.filter(sender=request.user) | requests.filter(receiver=request.user)
    
    if status_filter:
        requests = requests.filter(status=status_filter)

    total = requests.count()
    start = (page - 1) * limit
    end = start + limit
    
    requests = requests[start:end]
    serializer = SwapRequestSerializer(requests, many=True)
    
    return Response({
        'requests': serializer.data,
        'total': total,
        'page': page,
        'limit': limit
    })

@api_view(['POST'])
def create_request(request):
    blocked_response = _ensure_active_user(request)
    if blocked_response:
        return blocked_response

    serializer = CreateSwapRequestSerializer(data=request.data)
    if serializer.is_valid():
        return _create_swap_request(request, serializer.validated_data)
    
    return Response({
        'error': 'Bad Request',
        'message': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def accept_request(request, id):
    blocked_response = _ensure_active_user(request)
    if blocked_response:
        return blocked_response

    try:
        swap_request = SwapRequest.objects.get(id=id, receiver=request.user, status='pending')
        
        swap_request.status = 'accepted'
        swap_request.save()
        
        # Create notification for sender
        Notification.objects.create(
            user=swap_request.sender,
            message=f"Your skill swap request with {request.user.email} has been accepted!"
        )
        
        return Response(SwapRequestSerializer(swap_request).data)
        
    except SwapRequest.DoesNotExist:
        return Response({
            'error': 'Not Found',
            'message': 'Request not found or cannot be accepted'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
def reject_request(request, id):
    blocked_response = _ensure_active_user(request)
    if blocked_response:
        return blocked_response

    try:
        swap_request = SwapRequest.objects.get(id=id, receiver=request.user, status='pending')
        
        swap_request.status = 'rejected'
        swap_request.save()
        
        # Create notification for sender
        Notification.objects.create(
            user=swap_request.sender,
            message=f"Your skill swap request with {request.user.email} has been rejected."
        )
        
        return Response(SwapRequestSerializer(swap_request).data)
        
    except SwapRequest.DoesNotExist:
        return Response({
            'error': 'Not Found',
            'message': 'Request not found or cannot be rejected'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
def complete_request(request, id):
    blocked_response = _ensure_active_user(request)
    if blocked_response:
        return blocked_response

    # Debug logging
    print(f"Complete request attempt - Request ID: {id}, User: {request.user.email}")
    
    try:
        # Allow both sender and receiver to complete the request, or admin users
        if request.user.role == 'admin':
            swap_request = SwapRequest.objects.filter(id=id).first()
        else:
            swap_request = SwapRequest.objects.filter(
                id=id
            ).filter(
                models.Q(sender=request.user) | models.Q(receiver=request.user)
            ).first()
        
        if not swap_request:
            print(f"Request not found - ID: {id}, User: {request.user.email}")
            return Response({
                'error': 'Not Found',
                'message': 'Request not found or you do not have permission to complete it'
            }, status=status.HTTP_404_NOT_FOUND)
        
        print(f"Found request - ID: {swap_request.id}, Status: {swap_request.status}")
        print(f"Sender: {swap_request.sender.email}, Receiver: {swap_request.receiver.email}")
        
        # Check if request is in correct state for completion
        if swap_request.status != 'accepted':
            print(f"Invalid state for completion: {swap_request.status}")
            return Response({
                'error': 'Invalid state',
                'message': f'Request must be accepted before completion. Current status: {swap_request.status}',
                'current_status': swap_request.status,
                'required_status': 'accepted'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Complete the request
        swap_request.status = 'completed'
        swap_request.save()
        
        print(f"Request {id} completed successfully")
        
        # Create notification for the other party
        other_user = swap_request.receiver if request.user == swap_request.sender else swap_request.sender
        Notification.objects.create(
            user=other_user,
            message=f"Your skill swap with {request.user.email} has been marked as completed!"
        )
        
        return Response(SwapRequestSerializer(swap_request).data)
        
    except Exception as e:
        print(f"Error completing request {id}: {str(e)}")
        return Response({
            'error': 'Internal Server Error',
            'message': 'An error occurred while completing the request'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def delete_request(request, id):
    blocked_response = _ensure_active_user(request)
    if blocked_response:
        return blocked_response

    try:
        swap_request = SwapRequest.objects.get(id=id, sender=request.user)
        
        # Only allow deletion of pending requests
        if swap_request.status != 'pending':
            return Response({
                'error': 'Bad Request',
                'message': 'Can only delete pending requests'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        swap_request.delete()
        
        return Response({'message': 'Request deleted successfully'})
        
    except SwapRequest.DoesNotExist:
        return Response({
            'error': 'Not Found',
            'message': 'Request not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
def update_milestone(request, id):
    blocked_response = _ensure_active_user(request)
    if blocked_response:
        return blocked_response

    try:
        # Both sender and receiver can update milestone
        swap_request = SwapRequest.objects.get(id=id, status='accepted')
        if swap_request.sender != request.user and swap_request.receiver != request.user:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
            
        milestone = request.data.get('milestone', '')
        swap_request.milestone = milestone
        swap_request.save()
        
        partner = swap_request.receiver if swap_request.sender == request.user else swap_request.sender
        if milestone:
            Notification.objects.create(
                user=partner,
                message=f"{request.user.first_name} updated swap milestone to: {milestone}"
            )
            
        return Response(SwapRequestSerializer(swap_request).data)
    except SwapRequest.DoesNotExist:
        return Response({'error': 'Not Found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST'])
def swap_messages(request, id):
    blocked_response = _ensure_active_user(request)
    if blocked_response:
        return blocked_response

    try:
        swap_request = SwapRequest.objects.get(id=id)
        if swap_request.sender != request.user and swap_request.receiver != request.user:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
            
        if request.method == 'GET':
            messages = SwapMessage.objects.filter(swap_request=swap_request).order_by('created_at')
            return Response([{
                'id': m.id,
                'sender_id': m.sender.id,
                'sender_name': m.sender.first_name,
                'text': m.text,
                'created_at': m.created_at
            } for m in messages])
            
        elif request.method == 'POST':
            text = request.data.get('text', '')
            if not text:
                return Response({'error': 'Bad Request', 'message': 'Message text is required'}, status=status.HTTP_400_BAD_REQUEST)
            msg = SwapMessage.objects.create(
                swap_request=swap_request,
                sender=request.user,
                text=text
            )
            
            # Create notification for receiver
            partner = swap_request.receiver if swap_request.sender == request.user else swap_request.sender
            Notification.objects.create(
                user=partner,
                message=f"New message from {request.user.first_name}: {text[:30]}..."
            )

            return Response({
                'id': msg.id,
                'sender_id': msg.sender.id,
                'sender_name': msg.sender.first_name,
                'text': msg.text,
                'created_at': msg.created_at
            })
    except SwapRequest.DoesNotExist:
        return Response({'error': 'Not Found'}, status=status.HTTP_404_NOT_FOUND)
