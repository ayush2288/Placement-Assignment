"""
User models with encrypted Aadhaar/ID storage
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from .utils import EncryptionHelper


from django.contrib.auth.models import AbstractUser
from django.db import models
from .utils import EncryptionHelper


class User(AbstractUser):
    email = models.EmailField(unique=True)

    encrypted_aadhaar = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return self.email




    def set_aadhaar(self, plaintext_aadhaar):
        """
        Encrypt and store the Aadhaar number.
        
        Args:
            plaintext_aadhaar (str): The plaintext Aadhaar number
        """
        if plaintext_aadhaar:
            encryptor = EncryptionHelper()
            self.encrypted_aadhaar = encryptor.encrypt(plaintext_aadhaar)
    
    def get_aadhaar(self):
        """
        Decrypt and return the Aadhaar number.
        
        Returns:
            str: Decrypted Aadhaar number or None
        """
        if self.encrypted_aadhaar:
            try:
                decryptor = EncryptionHelper()
                return decryptor.decrypt(self.encrypted_aadhaar)
            except Exception as e:
                # Log the error in production
                print(f"Decryption error: {str(e)}")
                return None
        return None
    
    def get_full_name(self):
        """
        Return the user's full name.
        """
        return f"{self.first_name} {self.last_name}".strip() or self.username