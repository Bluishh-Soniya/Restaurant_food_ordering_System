from django.urls import path
from .views import FooterAPIView

urlpatterns = [
    path('footer/', FooterAPIView.as_view(), name='footer-api'),
]