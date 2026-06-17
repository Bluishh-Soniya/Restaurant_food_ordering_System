from rest_framework import serializers
from menu.models import Category, MenuItem, Table, Restaurant
from orders.models import Order, OrderItem


class AdminCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class AdminMenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = MenuItem
        fields = '__all__'


class AdminTableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['id', 'table_number', 'is_active']


class AdminOrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'menu_item_name', 'item_name', 'quantity', 'price']


class AdminOrderSerializer(serializers.ModelSerializer):
    items = AdminOrderItemSerializer(source='order_items', many=True, read_only=True)
    table_number = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'restaurant', 'table', 'table_number', 'order_type',
            'total_price', 'status', 'payment_status',
            'razorpay_order_id', 'razorpay_payment_id',
            'created_at', 'items',
        ]

    def get_table_number(self, obj):
        return obj.table.table_number if obj.table else None
