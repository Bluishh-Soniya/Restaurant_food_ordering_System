from django.urls import path
from .views import home_data, OrderCreateView, TrendingItemsView, filter_menu_by_category

urlpatterns = [
    path('home/', home_data),
    path('orders/', OrderCreateView.as_view()),
    path("trending/", TrendingItemsView.as_view()),
    path('menu/filter/', filter_menu_by_category),
]