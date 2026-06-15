from rest_framework import serializers
from .models import MenuItem, Category
from orders.models import Order, OrderItem, Invoice
from menu.utils import get_discounted_price


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class MenuItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    final_price = serializers.SerializerMethodField()
    discount_percentage = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = [
            'id', 'restaurant', 'category', 'name', 'price',
            'description', 'image', 'is_trending', 'is_available',
            'is_recommended', 'final_price', 'discount_percentage',
        ]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and obj.image.name and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_final_price(self, obj):
        return get_discounted_price(obj)["final_price"]

    def get_discount_percentage(self, obj):
        return get_discounted_price(obj)["discount_percentage"]


class InvoiceSerializer(serializers.ModelSerializer):
    order_details = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'order', 'subtotal',
            'tax', 'total', 'generated_at', 'order_details'
        ]

    def get_order_details(self, obj):
        order = obj.order
        return {
            'id': order.id,
            'table_number': order.table.table_number if order.table else None,
            'items': [
                {
                    'name': item.item_name,
                    'quantity': item.quantity,
                    'price': str(item.price)
                }
                for item in order.order_items.all()
            ],
            'status': order.status,
            'payment_status': order.payment_status
        }