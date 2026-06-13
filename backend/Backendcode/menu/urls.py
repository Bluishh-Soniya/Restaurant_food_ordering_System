from django.urls import path
from .views import home_data, OrderCreateView, TrendingItemsView, filter_menu_by_category, TableListView, VerifyPaymentView

urlpatterns = [
    path('home/', home_data),
    path('orders/', OrderCreateView.as_view()),
    path('verify-payment/', VerifyPaymentView.as_view()),
    path("trending/", TrendingItemsView.as_view()),
    path('menu/filter/', filter_menu_by_category),
    path('tables/', TableListView.as_view()),
]