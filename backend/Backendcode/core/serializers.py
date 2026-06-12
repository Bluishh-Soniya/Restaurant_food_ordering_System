from rest_framework import serializers
from .models import Footer, NewsletterSubscriber

class FooterSerializer(serializers.ModelSerializer):
    logo = serializers.ImageField(use_url=True)
    class Meta:
        model = Footer
        fields = '__all__'


class NewsletterSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = '__all__'