from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .models import Category, MenuItem, Banner
from .admin_serializers import CategorySerializer, MenuItemSerializer, BannerSerializer

class AdminCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class AdminMenuItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer

class AdminBannerViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
