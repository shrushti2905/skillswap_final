from django.urls import path
from . import views

urlpatterns = [
    # Frontend SPA
    path('', views.index, name='index'),
]