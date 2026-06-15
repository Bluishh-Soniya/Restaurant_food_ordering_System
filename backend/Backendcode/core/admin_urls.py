from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .admin_views import (
    AdminLoginView, AdminDashboardStatsView, AdminFinanceView,
    AdminOrderViewSet, AdminMenuItemViewSet,
    AdminCategoryViewSet, AdminTableViewSet,
)

router = DefaultRouter()
router.register(r'orders', AdminOrderViewSet, basename='admin-orders')
router.register(r'menu-items', AdminMenuItemViewSet, basename='admin-menu-items')
router.register(r'categories', AdminCategoryViewSet, basename='admin-categories')
router.register(r'tables', AdminTableViewSet, basename='admin-tables')

urlpatterns = [
    path('login/', AdminLoginView.as_view(), name='admin-login'),
    path('stats/', AdminDashboardStatsView.as_view(), name='admin-stats'),
    path('finance/', AdminFinanceView.as_view(), name='admin-finance'),
    path('', include(router.urls)),
]
