"""
Encryption/Decryption Utility for AES-256 encryption
Handles secure storage of sensitive user data (Aadhaar/ID numbers)
"""
import os
import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
from django.conf import settings


class EncryptionHelper:
    """
    AES-256 encryption/decryption helper class for securing sensitive data.
    Uses CBC mode with PKCS7 padding for robust encryption.
    """
    
    def __init__(self, key=None):
        """
        Initialize the encryption helper with a secret key.
        
        Args:
            key (str, optional): Base64-encoded 32-byte key. If None, uses settings.SECRET_KEY
        """
        if key is None:
            # Derive a 32-byte key from Django's SECRET_KEY
            key = settings.SECRET_KEY.encode()[:32].ljust(32, b'0')
        else:
            key = base64.b64decode(key) if isinstance(key, str) else key
        
        if len(key) != 32:
            raise ValueError("Encryption key must be exactly 32 bytes for AES-256")
        
        self.key = key
        self.backend = default_backend()
    
    def encrypt(self, plaintext):
        """
        Encrypt plaintext using AES-256-CBC with PKCS7 padding.
        
        Args:
            plaintext (str): The text to encrypt
            
        Returns:
            str: Base64-encoded string containing IV + ciphertext
        """
        if not plaintext:
            return None
        
        # Generate a random 16-byte initialization vector
        iv = os.urandom(16)
        
        # Create cipher instance
        cipher = Cipher(
            algorithms.AES(self.key),
            modes.CBC(iv),
            backend=self.backend
        )
        encryptor = cipher.encryptor()
        
        # Apply PKCS7 padding (block size 128 bits = 16 bytes)
        padder = padding.PKCS7(128).padder()
        padded_data = padder.update(plaintext.encode('utf-8')) + padder.finalize()
        
        # Encrypt the padded data
        ciphertext = encryptor.update(padded_data) + encryptor.finalize()
        
        # Prepend IV to ciphertext and encode as base64
        encrypted_data = iv + ciphertext
        return base64.b64encode(encrypted_data).decode('utf-8')
    
    def decrypt(self, encrypted_text):
        """
        Decrypt AES-256-CBC encrypted text with PKCS7 padding.
        
        Args:
            encrypted_text (str): Base64-encoded string containing IV + ciphertext
            
        Returns:
            str: Decrypted plaintext
        """
        if not encrypted_text:
            return None
        
        try:
            # Decode from base64
            encrypted_data = base64.b64decode(encrypted_text)
            
            # Extract IV (first 16 bytes) and ciphertext
            iv = encrypted_data[:16]
            ciphertext = encrypted_data[16:]
            
            # Create cipher instance
            cipher = Cipher(
                algorithms.AES(self.key),
                modes.CBC(iv),
                backend=self.backend
            )
            decryptor = cipher.decryptor()
            
            # Decrypt the data
            padded_plaintext = decryptor.update(ciphertext) + decryptor.finalize()
            
            # Remove PKCS7 padding
            unpadder = padding.PKCS7(128).unpadder()
            plaintext = unpadder.update(padded_plaintext) + unpadder.finalize()
            
            return plaintext.decode('utf-8')
        
        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}")
    
    @staticmethod
    def generate_key():
        """
        Generate a new random 32-byte key for AES-256.
        
        Returns:
            str: Base64-encoded 32-byte key
        """
        key = os.urandom(32)
        return base64.b64encode(key).decode('utf-8')
    
    def validate_encrypted_format(self, encrypted_text):
        """
        Validate that the encrypted text has the correct format.
        
        Args:
            encrypted_text (str): The encrypted text to validate
            
        Returns:
            bool: True if format is valid, False otherwise
        """
        try:
            encrypted_data = base64.b64decode(encrypted_text)
            # Must have at least IV (16 bytes) + 1 block of ciphertext (16 bytes)
            return len(encrypted_data) >= 32
        except Exception:
            return False