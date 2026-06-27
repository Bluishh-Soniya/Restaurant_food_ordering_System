"""
URL configuration for Backendcode project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.views import serve as staticfiles_serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/admin/', include('Backendcode.admin_urls')),
    path('api/', include('menu.urls')),
    path('api/', include('core.urls')),
]

if settings.DEBUG:
    # Serve static files using staticfiles finders (works without collectstatic).
    # This uses AppDirectoriesFinder to locate admin CSS/JS in installed apps.
    urlpatterns += [
        re_path(r'^static/(?P<path>.*)$', staticfiles_serve, kwargs={'insecure': True}),
    ]
    # Serve uploaded media files.
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)