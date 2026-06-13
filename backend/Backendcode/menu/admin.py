from django.contrib import admin
from django.utils.html import format_html
from .models import Restaurant, Category, MenuItem, Offer, Banner, Table

admin.site.register(Restaurant)
admin.site.register(Category)
admin.site.register(MenuItem)
admin.site.register(Offer)
admin.site.register(Banner)


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
