from django.contrib import admin
from .models import Order, OrderItem, Invoice


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('item_name', 'menu_item', 'quantity', 'price')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'table', 'restaurant', 'order_type', 'status', 'payment_status', 'total_price', 'created_at')
    list_filter = ('status', 'payment_status', 'order_type', 'created_at')
    search_fields = ('id', 'razorpay_order_id', 'razorpay_payment_id')
    inlines = [OrderItemInline]
    readonly_fields = ('total_price', 'created_at', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature')


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'order', 'total', 'generated_at']
    search_fields = ['invoice_number', 'order__id']
    ordering = ['-generated_at']
    readonly_fields = ['invoice_number', 'generated_at']
