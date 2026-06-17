from decimal import Decimal
from rest_framework import serializers
from .models import OrderItem
from menu.models import Restaurant, Table

class OrderItemSerializer(serializers.ModelSerializer):
    # Write-only: customer sends table_number (e.g. 3)
    table_number = serializers.IntegerField(write_only=True, required=True, allow_null=False)

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'table_number',
            'order_type',
            'item_names',
            'total_price',
            'status',
            'payment_status',
            'created_at',
        ]
        read_only_fields = ['status', 'created_at']

    def create(self, validated_data):
        table_number = validated_data.pop('table_number', None)

        # Auto-assign the single restaurant (id=1)
        restaurant = Restaurant.objects.get(id=1)

        # Resolve table by table_number
        table = None
        if table_number is not None:
            try:
                table = Table.objects.get(table_number=table_number, is_active=True)
            except Table.DoesNotExist:
                raise serializers.ValidationError(
                    {"table_number": f"Table {table_number} does not exist or is not active."}
                )

        order_item = OrderItem.objects.create(
            restaurant=restaurant,
            table=table,
            **validated_data
        )

        return order_item