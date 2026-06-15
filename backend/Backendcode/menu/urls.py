from django.urls import path
from .views import home_data, OrderCreateView, TrendingItemsView, MenuItemListView, TableListView, VerifyPaymentView, InvoiceView

urlpatterns = [
    path('home/', home_data),
    path('orders/', OrderCreateView.as_view()),

    path('verify-payment/', VerifyPaymentView.as_view()),
    path("trending/", TrendingItemsView.as_view()),
    path('menu/items/', MenuItemListView.as_view()),
    path('tables/', TableListView.as_view()),
    path('invoice/<int:order_id>/', InvoiceView.as_view()),
]