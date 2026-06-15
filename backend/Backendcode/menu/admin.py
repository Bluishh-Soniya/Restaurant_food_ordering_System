from django.contrib import admin
from django.utils.html import format_html
from .models import Restaurant, Category, MenuItem, Offer, Banner, Table

admin.site.register(Restaurant)
admin.site.register(Banner)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'image_preview']
    search_fields = ['name']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" style="border-radius:5px;" />', obj.image.url)
        return "No Image"
    image_preview.short_description = 'Preview'

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'restaurant', 'category', 'price', 'is_available', 'is_recommended', 'is_trending', 'image_preview']
    list_filter = ['restaurant', 'category', 'is_available', 'is_recommended', 'is_trending']
    search_fields = ['name', 'description']
    list_editable = ['price', 'is_available', 'is_recommended', 'is_trending']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" style="border-radius:5px;" />', obj.image.url)
        return "No Image"
    image_preview.short_description = 'Preview'

@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ['title', 'menu_item', 'discount_percentage', 'is_active', 'start_date', 'end_date']
    list_filter = ['is_active', 'start_date', 'end_date']
    search_fields = ['title', 'menu_item__name']
    list_editable = ['is_active', 'discount_percentage']

@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ['table_number', 'is_active', 'qr_preview']
    list_editable = ['is_active']
    ordering = ['table_number']

    def qr_preview(self, obj):
        if obj.qr_code:
            return format_html(
                '<img src="{}" width="80" height="80" style="border-radius:6px;" />',
                obj.qr_code.url
            )
        return "No QR"
    qr_preview.short_description = 'QR Code'
