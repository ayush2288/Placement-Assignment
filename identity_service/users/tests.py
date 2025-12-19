"""
Comprehensive unit tests for encryption/decryption logic
Tests AES-256 encryption functionality and edge cases
"""
import unittest
from django.test import TestCase
from django.contrib.auth import get_user_model
from .utils import EncryptionHelper
import base64


User = get_user_model()


class EncryptionHelperTestCase(TestCase):
    """
    Test suite for EncryptionHelper utility class.
    Tests encryption, decryption, and edge cases.
    """
    
    def setUp(self):
        """
        Set up test fixtures before each test method.
        """
        self.encryptor = EncryptionHelper()
        self.test_aadhaar = "123456789012"
        self.test_text = "Sensitive Information"
    
    def test_encryption_produces_different_output(self):
        """
        Test that encryption produces output different from input.
        """
        encrypted = self.encryptor.encrypt(self.test_aadhaar)
        self.assertIsNotNone(encrypted)
        self.assertNotEqual(encrypted, self.test_aadhaar)
        self.assertIsInstance(encrypted, str)
    
    def test_encryption_produces_base64(self):
        """
        Test that encrypted output is valid base64.
        """
        encrypted = self.encryptor.encrypt(self.test_aadhaar)
        try:
            base64.b64decode(encrypted)
            valid_base64 = True
        except Exception:
            valid_base64 = False
        self.assertTrue(valid_base64)
    
    def test_encryption_decryption_roundtrip(self):
        """
        Test that encrypt->decrypt returns original plaintext.
        """
        encrypted = self.encryptor.encrypt(self.test_aadhaar)
        decrypted = self.encryptor.decrypt(encrypted)
        self.assertEqual(decrypted, self.test_aadhaar)
    
    def test_different_plaintexts_produce_different_ciphertexts(self):
        """
        Test that different inputs produce different encrypted outputs.
        """
        text1 = "123456789012"
        text2 = "987654321098"
        
        encrypted1 = self.encryptor.encrypt(text1)
        encrypted2 = self.encryptor.encrypt(text2)
        
        self.assertNotEqual(encrypted1, encrypted2)
    
    def test_same_plaintext_produces_different_ciphertext(self):
        """
        Test that encrypting the same text twice produces different outputs.
        This verifies that IV randomization is working.
        """
        encrypted1 = self.encryptor.encrypt(self.test_aadhaar)
        encrypted2 = self.encryptor.encrypt(self.test_aadhaar)
        
        # Different IVs should produce different ciphertexts
        self.assertNotEqual(encrypted1, encrypted2)
        
        # But both should decrypt to the same plaintext
        self.assertEqual(
            self.encryptor.decrypt(encrypted1),
            self.encryptor.decrypt(encrypted2)
        )
    
    def test_decrypt_with_wrong_key_fails(self):
        """
        Test that decryption with wrong key fails appropriately.
        """
        encrypted = self.encryptor.encrypt(self.test_aadhaar)
        
        # Create new encryptor with different key
        different_key = EncryptionHelper.generate_key()
        wrong_encryptor = EncryptionHelper(key=different_key)
        
        with self.assertRaises(ValueError):
            wrong_encryptor.decrypt(encrypted)
    
    def test_encrypt_empty_string(self):
        """
        Test handling of empty string input.
        """
        encrypted = self.encryptor.encrypt("")
        self.assertIsNone(encrypted)
    
    def test_encrypt_none_value(self):
        """
        Test handling of None input.
        """
        encrypted = self.encryptor.encrypt(None)
        self.assertIsNone(encrypted)
    
    def test_decrypt_empty_string(self):
        """
        Test handling of empty string during decryption.
        """
        decrypted = self.encryptor.decrypt("")
        self.assertIsNone(decrypted)
    
    def test_decrypt_none_value(self):
        """
        Test handling of None during decryption.
        """
        decrypted = self.encryptor.decrypt(None)
        self.assertIsNone(decrypted)
    
    def test_decrypt_invalid_base64(self):
        """
        Test that decrypting invalid base64 raises error.
        """
        with self.assertRaises(ValueError):
            self.encryptor.decrypt("not-valid-base64!@#$")
    
    def test_decrypt_truncated_data(self):
        """
        Test that decrypting truncated data raises error.
        """
        encrypted = self.encryptor.encrypt(self.test_aadhaar)
        truncated = encrypted[:10]  # Truncate the encrypted data
        
        with self.assertRaises(ValueError):
            self.encryptor.decrypt(truncated)
    
    def test_encryption_preserves_unicode(self):
        """
        Test that encryption handles Unicode characters correctly.
        """
        unicode_text = "नमस्ते 你好 مرحبا"
        encrypted = self.encryptor.encrypt(unicode_text)
        decrypted = self.encryptor.decrypt(encrypted)
        self.assertEqual(decrypted, unicode_text)
    
    def test_encryption_handles_long_text(self):
        """
        Test encryption of longer text (multiple blocks).
        """
        long_text = "A" * 1000
        encrypted = self.encryptor.encrypt(long_text)
        decrypted = self.encryptor.decrypt(encrypted)
        self.assertEqual(decrypted, long_text)
    
    def test_encryption_handles_special_characters(self):
        """
        Test encryption with special characters.
        """
        special_text = "!@#$%^&*()_+-=[]{}|;:',.<>?/~`"
        encrypted = self.encryptor.encrypt(special_text)
        decrypted = self.encryptor.decrypt(encrypted)
        self.assertEqual(decrypted, special_text)
    
    def test_generate_key_produces_valid_key(self):
        """
        Test that generate_key produces a valid 32-byte key.
        """
        key = EncryptionHelper.generate_key()
        self.assertIsNotNone(key)
        
        # Decode and check length
        decoded_key = base64.b64decode(key)
        self.assertEqual(len(decoded_key), 32)
    
    def test_custom_key_initialization(self):
        """
        Test initialization with custom key.
        """
        custom_key = EncryptionHelper.generate_key()
        encryptor = EncryptionHelper(key=custom_key)
        
        encrypted = encryptor.encrypt(self.test_aadhaar)
        decrypted = encryptor.decrypt(encrypted)
        self.assertEqual(decrypted, self.test_aadhaar)
    
    def test_validate_encrypted_format_valid(self):
        """
        Test format validation on valid encrypted text.
        """
        encrypted = self.encryptor.encrypt(self.test_aadhaar)
        is_valid = self.encryptor.validate_encrypted_format(encrypted)
        self.assertTrue(is_valid)
    
    def test_validate_encrypted_format_invalid(self):
        """
        Test format validation on invalid encrypted text.
        """
        is_valid = self.encryptor.validate_encrypted_format("invalid")
        self.assertFalse(is_valid)


class UserModelEncryptionTestCase(TestCase):
    """
    Test suite for User model encryption methods.
    """
    
    def setUp(self):
        """
        Set up test user before each test.
        """
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.test_aadhaar = "123456789012"
    
    def test_set_aadhaar_encrypts(self):
        """
        Test that set_aadhaar encrypts the Aadhaar number.
        """
        self.user.set_aadhaar(self.test_aadhaar)
        self.user.save()
        
        self.assertIsNotNone(self.user.encrypted_aadhaar)
        self.assertNotEqual(self.user.encrypted_aadhaar, self.test_aadhaar)
    
    def test_get_aadhaar_decrypts(self):
        """
        Test that get_aadhaar decrypts the Aadhaar number correctly.
        """
        self.user.set_aadhaar(self.test_aadhaar)
        self.user.save()
        
        decrypted = self.user.get_aadhaar()
        self.assertEqual(decrypted, self.test_aadhaar)
    
    def test_aadhaar_roundtrip(self):
        """
        Test complete encrypt-save-load-decrypt roundtrip.
        """
        self.user.set_aadhaar(self.test_aadhaar)
        self.user.save()
        
        # Reload from database
        user_from_db = User.objects.get(id=self.user.id)
        decrypted = user_from_db.get_aadhaar()
        
        self.assertEqual(decrypted, self.test_aadhaar)
    
    def test_get_aadhaar_returns_none_when_not_set(self):
        """
        Test that get_aadhaar returns None when no Aadhaar is set.
        """
        decrypted = self.user.get_aadhaar()
        self.assertIsNone(decrypted)
    
    def test_aadhaar_not_stored_in_plaintext(self):
        """
        Critical test: Verify Aadhaar is NEVER stored in plaintext.
        """
        self.user.set_aadhaar(self.test_aadhaar)
        self.user.save()
        
        # Check that the encrypted field doesn't contain plaintext
        self.assertNotIn(self.test_aadhaar, self.user.encrypted_aadhaar)
        
        # Verify it's stored as base64
        try:
            base64.b64decode(self.user.encrypted_aadhaar)
            is_base64 = True
        except Exception:
            is_base64 = False
        self.assertTrue(is_base64)