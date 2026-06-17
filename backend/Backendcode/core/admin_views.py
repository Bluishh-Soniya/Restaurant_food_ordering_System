from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta

from menu.models import Category, MenuItem, Table
from orders.models import Order
from .admin_serializers import (
    AdminCategorySerializer, AdminMenuItemSerializer,
    AdminTableSerializer, AdminOrderSerializer,
)


class AdminLoginView(APIView):
    """POST username/password → returns auth token (staff only)"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user is None:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_staff:
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "username": user.username})


class IsAdminStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class AdminDashboardStatsView(APIView):
    """Dashboard summary: counts, revenue, recent orders"""
    permission_classes = [IsAdminStaff]

    def get(self, request):
        today = timezone.now().date()
        orders = Order.objects.all()
        today_orders = orders.filter(created_at__date=today)

        stats = {
            "total_orders": orders.count(),
            "today_orders": today_orders.count(),
            "total_revenue": float(orders.filter(payment_status='success').aggregate(Sum('total_price'))['total_price__sum'] or 0),
            "today_revenue": float(today_orders.filter(payment_status='success').aggregate(Sum('total_price'))['total_price__sum'] or 0),
            "pending_orders": orders.filter(status='pending').count(),
            "menu_items": MenuItem.objects.count(),
            "categories": Category.objects.count(),
        }

        recent = AdminOrderSerializer(orders[:10], many=True).data
        return Response({"stats": stats, "recent_orders": recent})


class AdminFinanceView(APIView):
    """Deep financial metrics for the admin dashboard"""
    permission_classes = [IsAdminStaff]

    def get(self, request):
        today = timezone.now().date()
        
        # Only successful orders matter for revenue
        successful_orders = Order.objects.filter(payment_status='success')
        
        total_revenue = float(successful_orders.aggregate(Sum('total_price'))['total_price__sum'] or 0)
        today_orders = successful_orders.filter(created_at__date=today)
        today_revenue = float(today_orders.aggregate(Sum('total_price'))['total_price__sum'] or 0)
        
        successful_count = successful_orders.count()
        aov = float(total_revenue / successful_count) if successful_count > 0 else 0

        # Calculate 7-day trend
        trend = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            day_orders = successful_orders.filter(created_at__date=d)
            rev = float(day_orders.aggregate(Sum('total_price'))['total_price__sum'] or 0)
            trend.append({
                "date": d.strftime("%b %d"),
                "revenue": rev
            })

        # Recent transactions (last 20 successful)
        recent_tx = successful_orders.order_by('-created_at')[:20]
        
        # Basic serialization for tx
        transactions = []
        for tx in recent_tx:
            items_list = [{"name": item.item_name or item.menu_item.name, "quantity": item.quantity} for item in tx.order_items.all()]
            transactions.append({
                "id": tx.id,
                "items": items_list,
                "amount": float(tx.total_price),
                "date": tx.created_at.strftime("%Y-%m-%d %H:%M"),
                "razorpay_id": tx.razorpay_payment_id or "—"
            })

        return Response({
            "total_revenue": total_revenue,
            "today_revenue": today_revenue,
            "aov": round(aov, 2),
            "trend": trend,
            "transactions": transactions
        })


class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = AdminOrderSerializer
    permission_classes = [IsAdminStaff]

    def partial_update(self, request, *args, **kwargs):
        """PATCH: update order status"""
        return super().partial_update(request, *args, **kwargs)


class AdminMenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all().order_by('-id')
    serializer_class = AdminMenuItemSerializer
    permission_classes = [IsAdminStaff]


class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('-id')
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAdminStaff]


class AdminTableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.all().order_by('table_number')
    serializer_class = AdminTableSerializer
    permission_classes = [IsAdminStaff]
