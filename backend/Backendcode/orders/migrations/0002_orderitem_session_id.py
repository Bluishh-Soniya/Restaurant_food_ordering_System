# Generated manually for adding session_id to OrderItem

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='orderitem',
            name='session_id',
            field=models.CharField(blank=True, db_index=True, max_length=100, null=True),
        ),
    ]
