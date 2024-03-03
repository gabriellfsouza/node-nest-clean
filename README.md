### Generate JWT_PRIVATE_KEY and JWT_PUBLIC_KEY keys

```bash
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in private_key.pem -out public_key.pem
echo "JWT_PRIVATE_KEY=\"$(base64 -i private_key.pem)\"" >> .env
echo "JWT_PUBLIC_KEY=\"$(base64 -i public_key.pem)\"" >> .env
rm private_key.pem
rm public_key.pem
```
