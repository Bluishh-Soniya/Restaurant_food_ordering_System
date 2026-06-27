from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError

from .models import Footer, NewsletterSubscriber
from .serializers import FooterSerializer, NewsletterSerializer


class FooterAPIView(APIView):
    def get(self, request):
        footer = Footer.objects.last()  # latest entry
        if not footer:
            return Response({})
        serializer = FooterSerializer(footer)
        return Response(serializer.data)


class NewsletterAPIView(APIView):
    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response({"error": "Email is required"}, status=400)

        try:
            subscriber = NewsletterSubscriber.objects.create(email=email)
            return Response({"message": "Subscribed successfully"}, status=201)

        except IntegrityError:
            return Response({"message": "Email already subscribed"}, status=400)
