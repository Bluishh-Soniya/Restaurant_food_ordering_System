from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Footer
from .serializers import FooterSerializer


class FooterAPIView(APIView):
    def get(self, request):
        footer = Footer.objects.last()
        serializer = FooterSerializer(footer)
        return Response(serializer.data)
