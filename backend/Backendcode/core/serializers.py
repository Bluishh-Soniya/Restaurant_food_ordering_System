from rest_framework import serializers
from .models import Footer

class FooterSerializer(serializers.ModelSerializer):
    logo = serializers.ImageField(use_url=True)
    class Meta:
        model = Footer
        fields = '__all__'