from django.db import models
from menu.models import Restaurant, MenuItem


class Order(models.Model):
    ORDER_TYPE = (
        ('dine_in', 'Dine In'),
        ('parcel', 'Parcel')
    )

    STATUS = (
        ('pending', 'Pending'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('served', 'Served')
    )

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)

    # ✅ ADD DEFAULT (fixes validation issues)
    order_type = models.CharField(
        max_length=20,
        choices=ORDER_TYPE,
        default='dine_in'
    )

    # ✅ FIX: Integer → Decimal
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    status = models.CharField(max_length=20, choices=STATUS, default='pending')
    dish_names = models.CharField(max_length=500, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="order_items")
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name="order_items")

    quantity = models.IntegerField()

    dish_name = models.CharField(max_length=200, blank=True, null=True)
    # ✅ FIX: Integer → Decimal (VERY IMPORTANT)
    price = models.DecimalField(max_digits=10, decimal_places=2)