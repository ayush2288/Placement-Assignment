from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for returning user details (SAFE fields only).
    Aadhaar is NEVER exposed.
    """

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "phone_number",
            "date_of_birth",
            "address",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class RegisterSerializer(serializers.ModelSerializer):
    """
    User registration serializer.
    Accepts plaintext Aadhaar but stores it encrypted.
    """

    password = serializers.CharField(write_only=True, min_length=8)
    aadhaar = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        help_text="Plain Aadhaar number (will be encrypted before saving)"
    )

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "first_name",
            "last_name",
            "password",
            "aadhaar",
            "phone_number",
            "date_of_birth",
            "address",
        ]

    def create(self, validated_data):
        aadhaar = validated_data.pop("aadhaar", None)
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)

        if aadhaar:
            user.set_aadhaar(aadhaar)

        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """
    Email + password login serializer.
    Returns JWT tokens.
    """

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(
            request=self.context.get("request"),
            username=email,   # because USERNAME_FIELD = 'email'
            password=password,
        )

        if not user:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")

        refresh = RefreshToken.for_user(user)

        return {
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for Profile View.
    Explicitly handles the decryption of Aadhaar for the response.
    """
    aadhaar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "first_name", "last_name",
            "phone_number", "date_of_birth", "address", 
            "aadhaar" # <--- Including our custom field
        ]
        read_only_fields = ["email", "username"]

    def get_aadhaar(self, obj):
        # This calls the decryption method from your User model
        return obj.get_aadhaar()