"""

# First, install required python package:

pip install eth-keyfile

# Then execute the script to extract your private key from the json keystore

python3 decrypt_private_key.py --keystore keystore.json --password 123

"""

import argparse
import binascii
import eth_keyfile

parser = argparse.ArgumentParser()
parser.add_argument("--keystore", type=str, help="path to the json keystore file", required=True)
parser.add_argument("--password", type=str, help="password to decrypt the keystore", required=True)

args = parser.parse_args()

binary_private_key = eth_keyfile.extract_key_from_keyfile(args.keystore, args.password)
hex_data = binascii.hexlify(binary_private_key)
private_key = hex_data.decode('utf-8')
print('Your private key is:')
print(private_key)
