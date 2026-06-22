import os
from dotenv import load_dotenv
import requests

load_dotenv()


class FlightSearch:
    """This class is responsible for talking to the Flight Search API."""

    def __init__(self):
        self.serpapi_key = os.getenv('SERPAPI_KEY')
        self.flight_endpoint = os.getenv('SERPAPI_ENDPOINT')

    def check_flights(self, origin_city_code, destination_city_code, from_time, to_time,is_direct=True):
        flight_params = {
            "engine": "google_flights",
            "departure_id": origin_city_code,
            "arrival_id": destination_city_code,
            "outbound_date": from_time,
            "return_date": to_time,
            "type": "1",
            "adults": "1",
            "currency": "GBP",
            "api_key": self.serpapi_key,
        }
        if is_direct:
            flight_params['stops']='0'

        response = requests.get(self.flight_endpoint, params=flight_params)
        response.raise_for_status()
        return response.json()