# pip install eth-keyfile

import binascii
import eth_keyfile

binary_private_key = eth_keyfile.extract_key_from_keyfile('keystore.json', b'123')
hex_data = binascii.hexlify(binary_private_key)
private_key = hex_data.decode('utf-8')
print(private_key)
