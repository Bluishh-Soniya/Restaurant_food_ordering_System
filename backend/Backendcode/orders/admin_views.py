from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.utils import timezone
from django.db.models import Sum
from .models import OrderItem
from .admin_serializers import AdminOrderItemSerializer

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = timezone.now().date()
        
        total_orders = OrderItem.objects.filter(created_at=today).count()
        new_orders = OrderItem.objects.filter(status='pending').count()
        confirmed_orders = OrderItem.objects.filter(status='preparing').count()
        ready_orders = OrderItem.objects.filter(status='ready').count()
        delivered_orders = OrderItem.objects.filter(status='delivered').count()
        cancelled_orders = OrderItem.objects.filter(status='failed').count()  # Adjust if you have a cancelled status
        
        todays_sales = OrderItem.objects.filter(created_at=today, status='delivered').aggregate(Sum('total_price'))['total_price__sum'] or 0
        total_sales = OrderItem.objects.filter(status='delivered').aggregate(Sum('total_price'))['total_price__sum'] or 0
        
        return Response({
            "total_orders": total_orders,
            "new_orders": new_orders,
            "confirmed_orders": confirmed_orders,
            "ready_orders": ready_orders,
            "delivered_orders": delivered_orders,
            "cancelled_orders": cancelled_orders,
            "todays_sales": todays_sales,
            "total_sales": total_sales
        })

class AdminOrderListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        orders = OrderItem.objects.all().order_by('-created_at')
        serializer = AdminOrderItemSerializer(orders, many=True)
        return Response(serializer.data)

class AdminOrderDetailView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        try:
            order = OrderItem.objects.get(pk=pk)
        except OrderItem.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)
            
        status = request.data.get('status')
        if status in dict(OrderItem.STATUS).keys():
            order.status = status
            order.save()
            return Response(AdminOrderItemSerializer(order).data)
        return Response({"error": "Invalid status"}, status=400)
