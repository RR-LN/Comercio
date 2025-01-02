from rest_framework import serializers

class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

class NewsletterSerializer(serializers.Serializer):
    subject = serializers.CharField(max_length=200)
    content = serializers.CharField()
    recipients = serializers.ListField(
        child=serializers.EmailField(),
        min_length=1
    )

class EmailVerificationSerializer(serializers.Serializer):
    token = serializers.CharField() 