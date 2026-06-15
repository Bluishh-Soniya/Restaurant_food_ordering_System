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
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            'id', 'restaurant', 'category', 'category_name', 'name', 'price',
            'description', 'image', 'is_trending', 'is_available',
            'is_recommended', 'final_price', 'discount_percentage',
        ]

    def get_image(self, obj):
        if not obj.image:
            return None
            
        # If it's already a full HTTP URL (e.g. from the new Admin string input)
        if str(obj.image).startswith("http"):
            return str(obj.image)
            
        # If it's an old relative path from when it was an ImageField
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(f'/media/{obj.image}')
        
        return f'/media/{obj.image}'

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