from django.db import models
from menu.models import Restaurant, MenuItem

class OrderItem(models.Model):
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

    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed')
    )

    # 1. ID is implicit in Django
    # 2. Table No
    table = models.ForeignKey(
        'menu.Table',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='order_items'
    )
    
    # 3. Order Type
    order_type = models.CharField(
        max_length=20,
        choices=ORDER_TYPE,
        default='dine_in'
    )
    
    # 4. Item Names
    item_names = models.CharField(max_length=1000, blank=True, null=True)
    
    # 5. Total Price
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # 6. Status
    status = models.CharField(max_length=20, choices=STATUS, default='pending')
    
    # 7. Payment Status
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default='pending'
    )
    
    # 8. Date (date only, no time)
    created_at = models.DateField(auto_now_add=True)

    # 9. Session ID — groups multiple orders into one dining session/receipt
    session_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)

    # 10. Restaurant reference
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, default=1)

    class Meta:
        ordering = ['-created_at']  # Task 3: Recent orders always show first

    def __str__(self):
        return f"OrderItem {self.id}"