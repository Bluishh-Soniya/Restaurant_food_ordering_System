from django.contrib import admin
from .models import OrderItem

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    # Column sequence: ID, Table, Order Type, Item Names, Total Price, Status, Payment Status, Date
    list_display = ('id', 'table', 'order_type', 'item_names', 'total_price', 'status', 'payment_status', 'created_at')
    
    # Recent orders show on top
    ordering = ['-created_at']
    
    list_filter = ('status', 'payment_status', 'order_type', 'table', 'created_at')
    search_fields = ('=id', 'item_names')
    readonly_fields = ('created_at',)

    fieldsets = (
        ('Order Info', {
            'fields': ('table', 'order_type', 'item_names', 'total_price', 'status', 'payment_status', 'created_at')
        }),
    )
