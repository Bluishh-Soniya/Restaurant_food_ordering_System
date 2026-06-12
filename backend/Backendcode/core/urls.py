from django.urls import path
from .views import FooterAPIView, NewsletterAPIView

urlpatterns = [
    path('footer/', FooterAPIView.as_view(), name='footer-api'),
    path('newsletter/', NewsletterAPIView.as_view(), name='newsletter-api'),
]