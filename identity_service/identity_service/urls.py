from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

# Simple view for the root URL
def home(request):
    return JsonResponse({
        "message": "Identity Service API is running",
        "endpoints": {
            "register": "/api/auth/register/",
            "login": "/api/auth/login/",
            "profile": "/api/profile/"
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # This handles the root URL "http://127.0.0.1:8000/"
    path('', home), 
    
    # This connects your app URLs
    path('api/', include('users.urls')),
]