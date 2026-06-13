from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('item_name', 'menu_item', 'quantity', 'price')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'table', 'restaurant', 'order_type', 'status', 'payment_status', 'item_names', 'total_price', 'created_at')
    list_filter = ('status', 'payment_status', 'order_type', 'table', 'created_at')
    search_fields = ('id', 'item_names', 'razorpay_order_id', 'razorpay_payment_id')
    inlines = [OrderItemInline]
    readonly_fields = ('total_price', 'created_at', 'item_names', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature')
