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
        ('delivered', 'Delivered'),
    )

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    table = models.ForeignKey(
        'menu.Table',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )

    order_type = models.CharField(
        max_length=20,
        choices=ORDER_TYPE,
        default='dine_in'
    )

    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    status = models.CharField(max_length=20, choices=STATUS, default='pending')
    item_names = models.CharField(max_length=500, blank=True, null=True)

    payment_status = models.CharField(
        max_length=20,
        choices=(
            ('pending', 'Pending'),
            ('success', 'Success'),
            ('failed', 'Failed')
        ),
        default='pending'
    )
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=200, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="order_items")
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name="order_items")

    quantity = models.IntegerField()

    item_name = models.CharField(max_length=200, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)