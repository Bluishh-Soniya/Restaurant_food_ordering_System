from django.db import models
from django.utils import timezone
import qrcode
import io
from django.core.files import File


class Restaurant(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=100)

    # ✅ NEW CATEGORY IMAGE FIELD
    image = models.ImageField(
        upload_to='categories/',
        null=True,
        blank=True
    )

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # ✅ Decimal for accuracy
    description = models.TextField()

    image = models.ImageField(upload_to='menu/', null=True, blank=True)
    is_trending = models.BooleanField(default=False)

    is_available = models.BooleanField(default=True)
    is_recommended = models.BooleanField(default=False)

    @property
    def final_price(self):
        active_offer = self.offers.filter(
            is_active=True
        ).first()

        if active_offer:
            discount = (
                self.price *
                active_offer.discount_percentage
            ) / 100

            return round(
                self.price - discount,
                2
            )

        return self.price

    def __str__(self):
        return self.name

class Offer(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)

    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)

    banner = models.ImageField(upload_to='offers/banner/', blank=True, null=True)

    # ✅ Added related_name for clean reverse access
    menu_item = models.ForeignKey(
        MenuItem,
        on_delete=models.CASCADE,
        related_name="offers"
    )

    is_active = models.BooleanField(default=True)

    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    def is_valid(self):
        now = timezone.now()
        return self.is_active and self.start_date <= now <= self.end_date

    def __str__(self):
        return self.title


class Banner(models.Model):
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300)
    image = models.ImageField(upload_to='banner/')

    def __str__(self):
        return self.title


class Table(models.Model):
    table_number = models.IntegerField(unique=True)
    is_active = models.BooleanField(default=True)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)

    def save(self, *args, **kwargs):
        # Auto-generate QR pointing to /table/<number>
        qr_url = f"http://localhost:3000/table/{self.table_number}"
        qr_img = qrcode.make(qr_url)
        buffer = io.BytesIO()
        qr_img.save(buffer, format='PNG')
        buffer.seek(0)
        filename = f"table_{self.table_number}.png"
        self.qr_code.save(filename, File(buffer), save=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Table {self.table_number}"


# 🔥 ORDER SYSTEM
class Order(models.Model):
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id}"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items"
    )

    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)

    quantity = models.IntegerField(default=1)

    # ✅ FIXED: Integer → Decimal
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.menu_item.name