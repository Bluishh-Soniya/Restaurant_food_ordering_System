from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('price',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'restaurant', 'order_type', 'status', 'total_price', 'created_at')
    list_filter = ('status', 'order_type', 'restaurant', 'created_at')
    search_fields = ('id',)
    inlines = [OrderItemInline]
    readonly_fields = ('total_price', 'created_at')
