from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
import razorpay

razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

from .models import Category, MenuItem, Offer, Banner, Table
from .serializers import MenuItemSerializer, InvoiceSerializer
from orders.models import Invoice
from orders.serializers import OrderSerializer
from .utils import get_discounted_price


# ✅ HOME API
@api_view(['GET'])
def home_data(request):
    try:
        restaurant_id = request.GET.get('restaurant', 1)

        categories = Category.objects.all()
        menu = MenuItem.objects.filter(restaurant_id=restaurant_id)
        offers = Offer.objects.all()
        banner = Banner.objects.first()

        return Response({
            "categories": [
                {
                    "id": c.id,
                    "name": c.name,
                    "image": str(c.image) if c.image and str(c.image).startswith('http') else (request.build_absolute_uri(f'/media/{c.image}') if c.image else None)
                }
                for c in categories
            ],

            # ✅ WITH DISCOUNT
           # ✅ SERIALIZED MENU
        "menu": [
    {
        **item,
        "discount_percentage": get_discounted_price(
            MenuItem.objects.get(id=item["id"])
        )["discount_percentage"],

        "final_price": get_discounted_price(
            MenuItem.objects.get(id=item["id"])
        )["final_price"]
    }

    for item in MenuItemSerializer(
        menu,
        many=True,
        context={"request": request}
    ).data
],

            "offers": [
                {
                    "id": o.id,
                    "title": o.title,
                    "description": o.description,
                    "discount_percentage": o.discount_percentage,
                    "banner": request.build_absolute_uri(o.banner.url) if o.banner and o.banner.name else None
                }
                for o in offers
            ],

            "banner": {
                "title": getattr(banner, "title", ""),
                "subtitle": getattr(banner, "subtitle", ""),
                "image": request.build_absolute_uri(banner.image.url) if banner and banner.image and banner.image.name else None
            } if banner else None,

            "trending": [
                {
                    **{
                        "id": m.id,
                        "name": m.name,
                        "image": str(m.image) if m.image and str(m.image).startswith('http') else (request.build_absolute_uri(f'/media/{m.image}') if m.image else None),
                        "price": str(m.price),
                        "description": m.description
                    },
                    "discount_percentage": get_discounted_price(m)["discount_percentage"],
                    "final_price": get_discounted_price(m)["final_price"]
                }
                for m in ([mi for mi in menu if hasattr(mi, "is_trending") and mi.is_trending] or menu[:5])
            ]
        })

    except Exception as e:
        return Response({
            "categories": [],
            "menu": [],
            "offers": [],
            "banner": None,
            "trending": [],
            "error": str(e)
        }, status=200)
    
class TrendingItemsView(APIView):

    def get(self, request):

        trending_items = MenuItem.objects.filter(
            is_trending=True
        )

        serializer = MenuItemSerializer(
            trending_items,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)


# ✅ FILTER MENU BY CATEGORY AND SEARCH
class MenuItemListView(APIView):
    def get(self, request):
        try:
            restaurant_id = request.GET.get('restaurant', 1)
            category = request.GET.get('category', 'All')
            search = request.GET.get('search', '')

            menu_items = MenuItem.objects.filter(restaurant_id=restaurant_id)

            if category and category != 'All':
                if category.lower() == 'recommended':
                    menu_items = menu_items.filter(is_recommended=True)
                elif category.lower() == 'trending':
                    menu_items = menu_items.filter(is_trending=True)
                else:
                    menu_items = menu_items.filter(category__name__iexact=category)
            
            if search:
                menu_items = menu_items.filter(name__icontains=search)

            serializer = MenuItemSerializer(
                menu_items,
                many=True,
                context={"request": request}
            )

            # Manually inject dynamic pricing
            menu_data = [
                {
                    **item,
                    "discount_percentage": get_discounted_price(
                        MenuItem.objects.get(id=item["id"])
                    )["discount_percentage"],
                    "final_price": get_discounted_price(
                        MenuItem.objects.get(id=item["id"])
                    )["final_price"]
                }
                for item in serializer.data
            ]

            return Response({
                "menu": menu_data,
                "count": len(menu_data)
            })

        except Exception as e:
            return Response({
                "error": str(e),
                "menu": []
            }, status=500)


# ✅ ORDER CREATE VIEW (FINAL CLEAN)
class OrderCreateView(APIView):
    def post(self, request):
        serializer = OrderSerializer(data=request.data)
    

        if serializer.is_valid():
            order = serializer.save()

            # Create Razorpay order
            try:
                amount_in_paise = int(order.total_price * 100)
                razorpay_order = razorpay_client.order.create({
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "payment_capture": "1"
                })

                order.razorpay_order_id = razorpay_order['id']
                order.save()

                return Response({
                    "message": "Order placed successfully",
                    "order": OrderSerializer(order).data,
                    "razorpay_order_id": order.razorpay_order_id,
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "key_id": settings.RAZORPAY_KEY_ID
                }, status=201)

            except Exception as e:
                print("Razorpay Error:", str(e))
                # Fallback to mock order if razorpay fails (Useful for local testing)
                order.razorpay_order_id = f"mock_order_{order.id}"
                order.save()
                return Response({
                    "message": "Order placed successfully (Mock Mode)",
                    "order": OrderSerializer(order).data,
                    "razorpay_order_id": order.razorpay_order_id,
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "key_id": settings.RAZORPAY_KEY_ID,
                    "is_mock": True
                }, status=201)

        return Response(serializer.errors, status=400)


# ✅ VERIFY RAZORPAY PAYMENT VIEW
class VerifyPaymentView(APIView):
    def post(self, request):
        try:
            data = request.data
            razorpay_order_id = data.get('razorpay_order_id')
            razorpay_payment_id = data.get('razorpay_payment_id')
            razorpay_signature = data.get('razorpay_signature')
            
            # Verify the payment signature
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            
            # If signature is invalid, it raises SignatureVerificationError
            if str(razorpay_order_id).startswith("mock_order_"):
                pass # Skip signature verification for mock orders
            else:
                razorpay_client.utility.verify_payment_signature(params_dict)
            
            # Update order status
            from orders.models import Order
            from decimal import Decimal
            order = Order.objects.get(razorpay_order_id=razorpay_order_id)
            order.payment_status = 'success'
            order.razorpay_payment_id = razorpay_payment_id
            order.razorpay_signature = razorpay_signature
            order.save()
            
            # ✅ CREATE INVOICE after successful payment
            subtotal = sum(
                Decimal(item.price) * item.quantity 
                for item in order.order_items.all()
            )
            tax = (subtotal * Decimal('0.05')).quantize(Decimal('0.01'))
            total = subtotal + tax
            
            invoice_number = f"INV-{order.id}-{order.created_at.strftime('%Y%m%d')}"
            
            invoice, created = Invoice.objects.get_or_create(
                order=order,
                defaults={
                    'invoice_number': invoice_number,
                    'subtotal': subtotal,
                    'tax': tax,
                    'total': total
                }
            )
            
            return Response({
                "message": "Payment successful",
                "invoice_id": invoice.id,
                "order_id": order.id,
                "invoice_number": invoice.invoice_number
            }, status=status.HTTP_200_OK)
            
        except razorpay.errors.SignatureVerificationError:
            from orders.models import Order
            order = Order.objects.get(razorpay_order_id=data.get('razorpay_order_id'))
            order.payment_status = 'failed'
            order.save()
            return Response({"error": "Invalid payment signature"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ✅ TABLE LIST VIEW — returns all active tables with QR code URLs
class TableListView(APIView):
    def get(self, request):
        tables = Table.objects.filter(is_active=True).order_by('table_number')
        data = [
            {
                "id": t.id,
                "table_number": t.table_number,
                "is_active": t.is_active,
                "qr_code": request.build_absolute_uri(t.qr_code.url) if t.qr_code else None,
                "qr_url": f"http://localhost:3000/table/{t.table_number}",
            }
            for t in tables
        ]
        return Response(data)


# ✅ INVOICE VIEW — Get invoice for a specific order
class InvoiceView(APIView):
    def get(self, request, order_id):
        try:
            invoice = Invoice.objects.get(order_id=order_id)
            serializer = InvoiceSerializer(invoice)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Invoice.DoesNotExist:
            return Response({"error": "Invoice not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
