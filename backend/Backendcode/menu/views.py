from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .models import Category, MenuItem, Offer, Banner
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

            return Response({
    "message": "Order placed successfully",
    "order": OrderSerializer(order).data
}, status=201)

        return Response(serializer.errors, status=400)