from django.db import models

class Footer(models.Model):
    restaurant_name = models.CharField(max_length=200)
    description = models.TextField()
    logo = models.ImageField(upload_to='logos/', null=True, blank=True)
    address = models.TextField()
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    opening_hours = models.CharField(max_length=200)
    instagram = models.URLField(blank=True, null=True)
    facebook = models.URLField(blank=True, null=True)
    whatsapp = models.URLField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.restaurant_name
