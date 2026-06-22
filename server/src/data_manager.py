import os
from dotenv import load_dotenv
import requests

load_dotenv()

"""This class is responsible for talking to the Google Sheet."""

class DataManager:
    
    """Initializing constructors for Sheety API endpoints and headers."""

    def __init__(self):
        self.sheety_headers = {
            "Authorization": f"Basic {os.getenv('SHEETY_TOKEN')}"
        }
        self.sheety_endpoint = os.getenv('SHEETY_ENDPOINT')
        self.sheety_users_endpoint=os.getenv('SHEETY_ENDPOINT_USERS')
        self.sheety_searches_endpoint=os.getenv('SHEETY_ENDPOINT_SEARCHES')
    
    """Method to get data from the Google Sheet on prices sheet."""
    def get_data(self):
        response = requests.get(self.sheety_endpoint, headers=self.sheety_headers)
        response.raise_for_status()
        self.data = response.json()
        return self.data['prices']
    
    """Method to get customer emails from the Google Sheet on users sheet."""
    def get_customer_emails(self):
        response=requests.get(self.sheety_users_endpoint,headers=self.sheety_headers)
        response.raise_for_status()
        self.customer_data=response.json()
        return self.customer_data['users']

    """Method to update the lowest price in the Google Sheet prices sheet."""
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
    
    """Method to post a new search result to the Google Sheet searches sheet."""
    def post_search_result(self,email,origin,destination,origin_code,destination_code,price,outbound,inbound,stops):
        payload={
            'search':{
                'email':email,
                'origin':origin,
                'destination':destination,
                'originCode':origin_code,
                'destinationCode':destination_code,
                'price':price,
                'outbound':outbound,
                'inbound':inbound,
                'stops':stops
            }
        }

        response=requests.post(
            self.sheety_searches_endpoint,
            json=payload,
            headers=self.sheety_headers
        )
        response.raise_for_status()
        return response.json()