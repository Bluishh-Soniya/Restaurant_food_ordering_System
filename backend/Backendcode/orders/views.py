from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import OrderSerializer


@api_view(['POST'])
def create_order(request):
    serializer = OrderSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Order placed successfully"})

    return Response(serializer.errors, status=400)