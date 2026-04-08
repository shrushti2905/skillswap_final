from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

def api_info(request):
    return JsonResponse({
        'message': 'SkillSwap API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth/',
            'users': '/api/users',
            'requests': '/api/requests',
            'notifications': '/api/notifications',
            'admin': '/api/admin/',
            'admin_panel': '/admin/'
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('requests.urls')),
    path('api/', include('notifications.urls')),
    path('api/', include('accounts.urls')),
    # Serve frontend - catch all other routes
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='frontend'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
