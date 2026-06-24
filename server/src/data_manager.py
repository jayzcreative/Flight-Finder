import os
from dotenv import load_dotenv
import requests

load_dotenv()


class DataManager:
    
    """This class is responsible for talking to the Google Sheet."""
    

    def __init__(self):
        """Initializing constructors for Sheety API endpoints and headers."""
        self.sheety_headers = {
            "Authorization": f"Basic {os.getenv('SHEETY_TOKEN')}"
        }
        self.sheety_endpoint = os.getenv('SHEETY_ENDPOINT')
        self.sheety_users_endpoint=os.getenv('SHEETY_ENDPOINT_USERS')
        self.sheety_searches_endpoint=os.getenv('SHEETY_ENDPOINT_SEARCHES')
    
    
    def get_data(self):
        """Method to get data from the Google Sheet on prices sheet."""
        
        try:
            response = requests.get(self.sheety_endpoint, headers=self.sheety_headers)
            response.raise_for_status()
            self.data = response.json()
            return self.data['prices']
        
        except requests.exceptions.HTTPError as e:
            print(f"Failed to fetch prices data: {e}")
            return []
        
        except requests.exceptions.RequestException as e:
            print(f"Network error fetching prices: {e}")
            return []
    
    
    def get_customer_emails(self):
        """Method to get customer emails from the Google Sheet on users sheet."""
        try:
            response=requests.get(self.sheety_users_endpoint,headers=self.sheety_headers)
            response.raise_for_status()
            self.customer_data=response.json()
            return self.customer_data['users']
        
        except requests.exceptions.HTTPError as e:
            print(f"Failed to fetch users: {e}")
            return []
        
        except requests.exceptions.RequestException as e:
            print(f"Network error fetching users: {e}")
            return []

    
    def update_lowest_price(self, row_id, new_price):
       """Method to update the lowest price in the Google Sheet prices sheet."""
       try:

            update_endpoint = f"{self.sheety_endpoint}/{row_id}"
            update_data = {
                "price": {
                    "lowestPrice": new_price
                }
            }
            response = requests.put(url=update_endpoint, json=update_data, headers=self.sheety_headers)
            response.raise_for_status()
            return response.json()
       
       except requests.exceptions.HTTPError as e:
           print(f"Failed to update price: {e}")
           return None
       
       except requests.exceptions.RequestException as e:
           print(f"Netroek error updating price: {e}")
           return None
        
    
    def post_search_result(self,email,origin,destination,origin_code,destination_code,price,outbound,inbound,stops):
        """Method to post a new search result to the Google Sheet searches sheet."""
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

        try:

            response=requests.post(
                self.sheety_searches_endpoint,
                json=payload,
                headers=self.sheety_headers
            )
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.HTTPError as e:
            print(f"Failed to save search result: {e}")
            return None
        
        except requests.exceptions.RequestException as e:
            print(f"Network error saving search: {e}")
            return None
        