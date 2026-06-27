from django.urls import path
from .views import home_data, OrderCreateView, TrendingItemsView, filter_menu_by_category, TableListView, VerifyPaymentView, CreatePaymentView, CalculateTaxView, SessionOrdersView

urlpatterns = [
    path('home/', home_data),
    path('orders/', OrderCreateView.as_view()),
    path('create-payment/', CreatePaymentView.as_view()),
    path('verify-payment/', VerifyPaymentView.as_view()),
    path("trending/", TrendingItemsView.as_view()),
    path('menu/filter/', filter_menu_by_category),
    path('tables/', TableListView.as_view()),
    path('calculate-tax/', CalculateTaxView.as_view()),
    path('session-orders/<str:session_id>/', SessionOrdersView.as_view()),
]