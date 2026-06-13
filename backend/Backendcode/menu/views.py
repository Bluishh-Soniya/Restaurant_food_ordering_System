from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
import razorpay

razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

from .models import Category, MenuItem, Offer, Banner, Table
from orders.serializers import OrderSerializer
from .serializers import MenuItemSerializer
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
                    "image": request.build_absolute_uri(c.image.url) if getattr(c, "image", None) else None
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
                    "banner": request.build_absolute_uri(o.banner.url) if getattr(o, "banner", None) else None
                }
                for o in offers
            ],

            "banner": {
                "title": getattr(banner, "title", ""),
                "subtitle": getattr(banner, "subtitle", ""),
                "image": request.build_absolute_uri(banner.image.url)
            } if banner else None,

            "trending": [
                {
                    **{
                        "id": m.id,
                        "name": m.name,
                        "image": request.build_absolute_uri(m.image.url) if getattr(m, "image", None) else None,
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


# ✅ FILTER MENU BY CATEGORY
@api_view(['GET'])
def filter_menu_by_category(request):
    try:
        category_id = request.GET.get('category_id')
        restaurant_id = request.GET.get('restaurant', 1)
        
        if not category_id:
            return Response({
                "error": "category_id parameter is required"
            }, status=400)
        
        menu_items = MenuItem.objects.filter(
            category_id=category_id,
            restaurant_id=restaurant_id
        )
        
        serializer = MenuItemSerializer(
            menu_items,
            many=True,
            context={"request": request}
        )
        
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
        print("ORDER VIEW HIT")
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
                # If razorpay fails, just return the order without payment integration
                return Response({
                    "message": "Order placed successfully but failed to initialize payment.",
                    "error": str(e),
                    "order": OrderSerializer(order).data
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
            razorpay_client.utility.verify_payment_signature(params_dict)
            
            # Update order status
            from orders.models import Order
            order = Order.objects.get(razorpay_order_id=razorpay_order_id)
            order.payment_status = 'success'
            order.razorpay_payment_id = razorpay_payment_id
            order.razorpay_signature = razorpay_signature
            order.save()
            
            return Response({"message": "Payment successful"}, status=status.HTTP_200_OK)
            
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