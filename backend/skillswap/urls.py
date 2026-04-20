from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

def api_info(request):
    return JsonResponse({
        'message': 'SkillSwap API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'auth': '/api/auth/',
            'users': '/api/users',
            'requests': '/api/requests',
            'notifications': '/api/notifications',
            'admin_api': '/api/admin/',
            'admin_panel': '/admin/'
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    # API routes
    path('api/', include('requests.urls')),
    path('api/', include('notifications.urls')),
    path('api/', include('accounts.urls')),
    path('api/', api_info),
    # Frontend SPA routes
    path('', include('accounts.frontend_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
