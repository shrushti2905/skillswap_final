import jwt
from datetime import datetime, timedelta, timezone
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model

User = get_user_model()

class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
            
        token = auth_header.split(' ')[1]
        
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('userId')
            
            if not user_id:
                raise AuthenticationFailed('Invalid token payload')
                
            user = User.objects.get(id=user_id)
            return (user, token)
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found')

def generate_token(user):
    now = datetime.now(timezone.utc)
    expiry_hours = getattr(settings, 'JWT_EXPIRY_HOURS', 24)
    payload = {
        'userId': user.id,
        'email': user.email,
        'role': user.role,
        'iat': int(now.timestamp()),
        'exp': int((now + timedelta(hours=expiry_hours)).timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm='HS256')
