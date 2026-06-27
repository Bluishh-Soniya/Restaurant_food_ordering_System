import uuid
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
import razorpay

razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

from .models import Category, MenuItem, Offer, Banner, Table
from orders.serializers import OrderItemSerializer
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


# ✅ CREATE RAZORPAY PAYMENT VIEW
from decimal import Decimal
class CreatePaymentView(APIView):
    def post(self, request):
        try:
            total_price = request.data.get('total_price')
            if not total_price:
                return Response({"error": "No total_price provided"}, status=400)

            amount_in_paise = int(float(total_price) * 100)

            razorpay_order = razorpay_client.order.create({
                "amount": amount_in_paise,
                "currency": "INR",
                "payment_capture": "1"
            })

            return Response({
                "razorpay_order_id": razorpay_order['id'],
                "amount": amount_in_paise,
                "currency": "INR",
                "key_id": settings.RAZORPAY_KEY_ID
            }, status=200)

        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            print("CREATE PAYMENT ERROR:\n", tb)
            return Response({"error": f"{str(e)}\n{tb}"}, status=400)

# ✅ ORDER CREATE VIEW (WITH SESSION SUPPORT)
class OrderCreateView(APIView):
    def post(self, request):
        print("=" * 50)
        print("ORDER VIEW HIT")
        print("Request data:", request.data)

        try:
            data = request.data.copy()

            # Auto-generate session_id if not provided (first order in session)
            if not data.get('session_id'):
                data['session_id'] = str(uuid.uuid4())

            print("Data after session_id:", data)

            serializer = OrderItemSerializer(data=data)
        
            if serializer.is_valid():
                print("Serializer VALID, saving...")
                order_item = serializer.save()
                print("Order saved! ID:", order_item.id)

                # Mark payment as success if Razorpay verification data was sent
                razorpay_payment_id = request.data.get('razorpay_payment_id')
                if razorpay_payment_id:
                    order_item.payment_status = 'success'
                    order_item.save()
                    print("Payment status set to success")

                return Response({
                    "message": "Order placed successfully",
                    "order": OrderItemSerializer(order_item).data
                }, status=201)

            print("Serializer ERRORS:", serializer.errors)
            return Response(serializer.errors, status=400)

        except Exception as e:
            print("ORDER CREATE EXCEPTION:", str(e))
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)


# ✅ SESSION ORDERS VIEW — fetch all orders in a dining session
class SessionOrdersView(APIView):
    def get(self, request, session_id):
        from orders.models import OrderItem as OrderItemModel

        orders = OrderItemModel.objects.filter(
            session_id=session_id
        ).order_by('id')

        if not orders.exists():
            return Response(
                {"error": "No orders found for this session"},
                status=404
            )

        # Build per-round data
        rounds = []
        cumulative_subtotal = Decimal('0')

        for idx, order in enumerate(orders, start=1):
            rounds.append({
                "round": idx,
                "order_id": order.id,
                "item_names": order.item_names,
                "subtotal": float(order.total_price),
                "status": order.status,
                "payment_status": order.payment_status,
            })
            cumulative_subtotal += order.total_price

        # Calculate cumulative tax
        cgst = round(float(cumulative_subtotal) * 0.025, 2)
        sgst = round(float(cumulative_subtotal) * 0.025, 2)
        grand_total = round(float(cumulative_subtotal) + cgst + sgst, 2)

        return Response({
            "session_id": session_id,
            "table_number": orders.first().table.table_number if orders.first().table else None,
            "rounds": rounds,
            "cumulative_subtotal": float(cumulative_subtotal),
            "cgst": cgst,
            "sgst": sgst,
            "grand_total": grand_total,
        })


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
            
            return Response({"message": "Payment successful"}, status=status.HTTP_200_OK)
            
        except razorpay.errors.SignatureVerificationError:
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

# ✅ CALCULATE TAX VIEW
class CalculateTaxView(APIView):
    def post(self, request):
        try:
            subtotal = float(request.data.get('subtotal', 0))
            cgst = round(subtotal * 0.025, 2)
            sgst = round(subtotal * 0.025, 2)
            total = round(subtotal + cgst + sgst, 2)
            
            return Response({
                "subtotal": subtotal,
                "cgst": cgst,
                "sgst": sgst,
                "total": total
            }, status=200)
        except ValueError:
            return Response({"error": "Invalid subtotal provided"}, status=400)