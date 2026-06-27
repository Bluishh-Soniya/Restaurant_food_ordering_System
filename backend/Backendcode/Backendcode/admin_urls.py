from django.urls import path, include
from rest_framework.routers import DefaultRouter
from orders.admin_views import AdminDashboardStatsView, AdminOrderListView, AdminOrderDetailView
from menu.admin_views import AdminCategoryViewSet, AdminMenuItemViewSet, AdminBannerViewSet

router = DefaultRouter()
router.register(r'category', AdminCategoryViewSet, basename='admin-category')
router.register(r'menu', AdminMenuItemViewSet, basename='admin-menu')
router.register(r'banner', AdminBannerViewSet, basename='admin-banner')

urlpatterns = [
    path('dashboard/', AdminDashboardStatsView.as_view(), name='admin-dashboard'),
    path('orders/', AdminOrderListView.as_view(), name='admin-orders'),
    path('orders/<int:pk>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('', include(router.urls)),
]
