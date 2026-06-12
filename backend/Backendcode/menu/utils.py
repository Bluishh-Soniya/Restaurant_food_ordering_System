from django.utils import timezone
from decimal import Decimal, ROUND_HALF_UP

def get_discounted_price(menu_item):
    now = timezone.now()

    offer = menu_item.offers.filter(
        is_active=True,
        start_date__lte=now,
        end_date__gte=now
    ).order_by('-discount_percentage').first()

    original_price = menu_item.price

    if offer:
        # ✅ ensure decimal calculation
        discount_percentage = Decimal(offer.discount_percentage)

        discount = (original_price * discount_percentage) / Decimal('100')

        # ✅ round final price properly
        final_price = (original_price - discount).quantize(
            Decimal('0.01'),
            rounding=ROUND_HALF_UP
        )

        # ✅ round percentage (clean display)
        discount_percentage = discount_percentage.quantize(
            Decimal('0.01'),
            rounding=ROUND_HALF_UP
        )

        return {
            "original_price": original_price,
            "discount_percentage": discount_percentage,
            "final_price": final_price
        }

    return {
        "original_price": original_price,
        "discount_percentage": Decimal('0.00'),
        "final_price": original_price
    }