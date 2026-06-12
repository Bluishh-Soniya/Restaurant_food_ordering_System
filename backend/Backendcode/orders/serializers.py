from rest_framework import serializers
from .models import Order, OrderItem
from menu.utils import get_discounted_price


class OrderItemSerializer(serializers.ModelSerializer):
    price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['menu_item', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, source='order_items')

    class Meta:
        model = Order
        fields = ['id', 'restaurant', 'order_type', 'total_price', 'items']
        read_only_fields = ['total_price']


    def create(self, validated_data):
        items_data = validated_data.pop('order_items')

        order = Order.objects.create(**validated_data)

        total = 0
        dish_names_list = []

        for item in items_data:
            menu_item = item['menu_item']
            quantity = item['quantity']
            dish_name = menu_item.name

            price_data = get_discounted_price(menu_item)
            final_price = price_data["final_price"]

            item_total = final_price * quantity
            total += item_total
            
            dish_names_list.append(dish_name)

            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                dish_name=dish_name,
                quantity=quantity,
                price=final_price
            )

        order.total_price = total
        order.dish_names = ", ".join(dish_names_list)[:500]
        order.save()

        return order