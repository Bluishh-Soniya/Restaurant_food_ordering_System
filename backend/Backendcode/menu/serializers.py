from rest_framework import serializers

from .models import (
    Order,
    OrderItem,
    MenuItem,
    Category
)

from menu.utils import get_discounted_price


# ✅ CATEGORY SERIALIZER
class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = '__all__'


# ✅ MENU ITEM SERIALIZER
class MenuItemSerializer(serializers.ModelSerializer):

    image = serializers.SerializerMethodField()

    final_price = serializers.SerializerMethodField()

    discount_percentage = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem

        fields = [
            'id',
            'restaurant',
            'category',
            'name',
            'price',
            'description',
            'image',
            'is_trending',
            'is_available',
            'is_recommended',

            # ✅ OFFER FIELDS
            'final_price',
            'discount_percentage',
        ]

    def get_image(self, obj):

        request = self.context.get("request")

        if obj.image and request:

            return request.build_absolute_uri(
                obj.image.url
            )

        return None

    def get_final_price(self, obj):

        price_data = get_discounted_price(obj)

        return price_data["final_price"]

    def get_discount_percentage(self, obj):

        price_data = get_discounted_price(obj)

        return price_data["discount_percentage"]


# ✅ ORDER ITEM SERIALIZER
class OrderItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = OrderItem
        fields = ['menu_item', 'quantity', 'price']


# ✅ ORDER SERIALIZER
class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(
        many=True,
        source="order_items"
    )

    class Meta:
        model = Order
        fields = [
            'id',
            'restaurant',
            'order_type',
            'total_price',
            'items'
        ]

    # ✅ VALIDATION
    def validate(self, data):

        items = data.get('items', [])

        if not items:

            raise serializers.ValidationError(
                "Cart is empty"
            )

        return data

    # ✅ CREATE ORDER + ITEMS
    def create(self, validated_data):

        items_data = validated_data.pop('items')

        order = Order.objects.create(
            total_price=0
        )

        total_price = 0

        for item in items_data:

            menu_item = item['menu_item']

            quantity = item['quantity']

            # ✅ SAFETY CHECK
            if not MenuItem.objects.filter(
                id=menu_item.id
            ).exists():

                raise serializers.ValidationError(
                    "Invalid menu item"
                )

            # ✅ GET DISCOUNTED PRICE
            price_data = get_discounted_price(
                menu_item
            )

            final_price = price_data["final_price"]

            # ✅ CALCULATE TOTAL
            item_total = final_price * quantity

            total_price += item_total

            # ✅ SAVE ORDER ITEM
            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=quantity,
                price=final_price
            )

        # ✅ UPDATE TOTAL
        order.total_price = total_price

        order.save()

        return order