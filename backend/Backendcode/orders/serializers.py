from decimal import Decimal
from rest_framework import serializers
from .models import Order, OrderItem
from menu.models import Restaurant, Table
from menu.utils import get_discounted_price

TAX_RATE = Decimal("0.05")


class OrderItemSerializer(serializers.ModelSerializer):
    price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['menu_item', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, source='order_items')
    table_number = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Order
        fields = ['id', 'table_number', 'order_type', 'status', 'total_price', 'created_at', 'items']
        read_only_fields = ['total_price', 'status', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('order_items')
        table_number = validated_data.pop('table_number', None)

        restaurant = Restaurant.objects.get(id=1)

        table = None
        if table_number is not None:
            try:
                table = Table.objects.get(table_number=table_number, is_active=True)
            except Table.DoesNotExist:
                raise serializers.ValidationError(
                    {"table_number": f"Table {table_number} does not exist or is not active."}
                )

        order = Order.objects.create(restaurant=restaurant, table=table, **validated_data)

        subtotal = Decimal("0")
        for item in items_data:
            menu_item = item['menu_item']
            quantity = item['quantity']
            price_data = get_discounted_price(menu_item)
            final_price = Decimal(str(price_data["final_price"]))
            subtotal += final_price * quantity

            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                item_name=menu_item.name,
                quantity=quantity,
                price=final_price,
            )

        tax = (subtotal * TAX_RATE).quantize(Decimal("0.01"))
        order.total_price = subtotal + tax
        order.save()
        return order