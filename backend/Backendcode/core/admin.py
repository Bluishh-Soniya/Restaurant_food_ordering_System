from django.contrib import admin
from .models import Footer, NewsletterSubscriber

@admin.register(Footer)
class FooterAdmin(admin.ModelAdmin):
    list_display = ('restaurant_name', 'phone', 'email')

@admin.register(NewsletterSubscriber)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ('email', 'subscribed_at')