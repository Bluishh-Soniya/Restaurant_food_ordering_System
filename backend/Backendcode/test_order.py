import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Backendcode.settings")
django.setup()

from orders.serializers import OrderSerializer

data = {
    "restaurant": 1,
    "order_type": "dine_in",
    "items": [
        {"menu_item": 1, "quantity": 2}
    ]
}

serializer = OrderSerializer(data=data)
if serializer.is_valid():
    order = serializer.save()
    print("SUCCESS, created order:", order.id)
else:
    print("FAILED, errors:", serializer.errors)
