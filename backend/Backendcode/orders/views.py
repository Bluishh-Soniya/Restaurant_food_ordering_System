from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import OrderItemSerializer


@api_view(['POST'])
def create_order(request):
    serializer = OrderItemSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Order placed successfully"})

    return Response(serializer.errors, status=400)