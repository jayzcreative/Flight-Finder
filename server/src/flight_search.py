from datetime import date
import os
from dotenv import load_dotenv
import requests

load_dotenv()



class FlightSearch:
    """This class is responsible for talking to the Flight Search API."""
    
   
    def __init__(self):
        """Initializing constructors for SerpApi API endpoints and headers."""
        self.serpapi_key = os.getenv('SERPAPI_KEY')
        self.flight_endpoint = os.getenv('SERPAPI_ENDPOINT')
     
    

    def check_flights(self, origin_city_code, destination_city_code,
                       from_time, to_time=None,is_direct=True,trip_type="1",
                       currency="GBP",adults="1",travel_class="1"):
        """Method to check flight availability and prices."""
        flight_params = {
            "engine": "google_flights",
            "departure_id": origin_city_code,
            "arrival_id": destination_city_code,
            "outbound_date": from_time,
            "type": trip_type,
            "adults":  str(adults),
            "currency": currency,
            "travel_class":travel_class,
            "api_key": self.serpapi_key,
        }

        if trip_type=='1' and to_time:
            flight_params['return_date']=to_time

        if is_direct:
            flight_params['stops']='0'
        try:

            response = requests.get(self.flight_endpoint, params=flight_params,timeout=30)
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.Timeout:
            print('Flight search timed out.please try again.')
            return None
        
        except requests.exceptions.HTTPError as e:
            print(f"Flight search failed: {e.response.status_code} - {e.response.text}")
            return None
        
        except requests.exceptions.RequestException as e:
            print(f"Network error during flight search: {e}")
            return None
        
    
    def get_iata_code(self, city_name):
        """Method to get IATA code for a given city name."""
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
    
    def get_flight_status(self, flight_number, date):
        """Method to get live status for a specific flight number and date via Google Search."""
        params = {
            "engine": "google",
            "q": f"{flight_number} flight status {date}",
            "api_key": self.serpapi_key,
        }
        try:
            response = requests.get(self.flight_endpoint, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            flight_result = data.get("flight_result")
            if not flight_result:
                return None
            # take the entry matching the requested date, else first available
            for entry in flight_result.get("dates", []):
                if entry.get("date") == date:
                    return entry.get("metadata", {}).get("status")
            dates = flight_result.get("dates", [])
            return dates[0].get("metadata", {}).get("status") if dates else None
        except requests.exceptions.RequestException as e:
            print(f"Error fetching flight status: {e}")
            return None