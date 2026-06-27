from rest_framework import serializers
from .models import OrderItem

class AdminOrderItemSerializer(serializers.ModelSerializer):
    table_number = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = '__all__'
        
    def get_table_number(self, obj):
        if obj.table:
            return obj.table.table_number
        return None
