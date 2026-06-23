import os
from dotenv import load_dotenv
import requests

load_dotenv()

"""This class is responsible for talking to the Flight Search API."""

class FlightSearch:
   
    """Initializing constructors for SerpApi API endpoints and headers."""
   
    def __init__(self):
        self.serpapi_key = os.getenv('SERPAPI_KEY')
        self.flight_endpoint = os.getenv('SERPAPI_ENDPOINT')
     
    """Method to check flight availability and prices."""

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

        response = requests.get(self.flight_endpoint, params=flight_params,timeout=30)
        response.raise_for_status()
        return response.json()
    
    """Method to get IATA code for a given city name."""
    def get_iata_code(self, city_name):
        params = {
            "engine": "google_flights_autocomplete",
            "q": city_name,
            "api_key": self.serpapi_key
        }

        try:
            response = requests.get(self.flight_endpoint, params=params,timeout=30)
            response.raise_for_status()
            data = response.json()

            suggestions = data.get("suggestions", [])
            if suggestions:
                for suggestion in suggestions:
                    airports = suggestion.get("airports", [])
                    if airports:
                        return airports[0].get("id")

        except requests.exceptions.RequestException as e:
            print(f"Error fetching IATA code for {city_name}: {e}")

        return "N/A"