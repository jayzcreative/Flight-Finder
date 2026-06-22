import os
from dotenv import load_dotenv
import requests

load_dotenv()


class DataManager:
    """This class is responsible for talking to the Google Sheet."""

    def __init__(self):
        self.sheety_headers = {
            "Authorization": f"Basic {os.getenv('SHEETY_TOKEN')}"
        }
        self.sheety_endpoint = os.getenv('SHEETY_ENDPOINT')
        self.sheety_users_endpoint=os.getenv('SHEETY_ENDPOINT_USERS')

    def get_data(self):
        response = requests.get(self.sheety_endpoint, headers=self.sheety_headers)
        response.raise_for_status()
        self.data = response.json()
        return self.data['prices']
    
    def get_customer_emails(self):
        response=requests.get(self.sheety_users_endpoint,headers=self.sheety_headers)
        response.raise_for_status()
        self.customer_data=response.json()
        return self.customer_data['users']

    def update_lowest_price(self, row_id, new_price):
        update_endpoint = f"{self.sheety_endpoint}/{row_id}"
        update_data = {
            "price": {
                "lowestPrice": new_price
            }
        }
        response = requests.put(url=update_endpoint, json=update_data, headers=self.sheety_headers)
        print(response.text)  # see the actual error before raising
        response.raise_for_status()
        return response.json()