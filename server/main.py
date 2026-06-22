import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import requests_cache

from src.data_manager import DataManager
from src.flight_search import FlightSearch
from src.flight_data import find_cheapest_flight
from src.notification_manager import NotificationManager


load_dotenv()

requests_cache.install_cache(
    cache_name='flight_cache',
    expire_after=3600,  # 1 hour
    urls_expire_after={
        os.getenv('SHEETY_ENDPOINT'): 0  # never cache Sheety - always fresh
    }
)

notification_manager=NotificationManager()
data_manager = DataManager()
sheet_data = data_manager.get_data()


customer_emails=data_manager.get_customer_emails()
print(customer_emails)
emails_only = [customer['whatIsYourEmail?'] for customer in customer_emails]

flight_search = FlightSearch()

tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
six_months_from_today = (datetime.now() + timedelta(days=180)).strftime('%Y-%m-%d')

for row in sheet_data:
    print(f"Getting direct flights for {row['city']}...")

    flights = flight_search.check_flights(
        origin_city_code="LHR",
        destination_city_code=row["iataCode"],
        from_time=tomorrow,
        to_time=six_months_from_today,
        is_direct=True
    )

    cheapest_flight = find_cheapest_flight(flights, six_months_from_today)

    if cheapest_flight.price == "N/A":
        print(f"No flights found to {row['city']}. Looking for indirect flights...")
        
        flights=flight_search.check_flights(
            origin_city_code="LHR",
            destination_city_code=row["iataCode"],
            from_time=tomorrow,
            to_time=six_months_from_today,
            is_direct=False
        ) 
        cheapest_flight = find_cheapest_flight(flights, six_months_from_today)


    print(f"{row['city']}: GBP {cheapest_flight.price}")

    if cheapest_flight.price < row["lowestPrice"]:
        print(f"Lower price flight found to {row['city']}!")
        data_manager.update_lowest_price(row["id"], cheapest_flight.price)
      
        notification_manager.send_emails(
            customer_emails=emails_only,
            price=cheapest_flight.price,
            departure_code=cheapest_flight.origin_airport,
            arrival_code=cheapest_flight.destination_airport,
            outbound_date=cheapest_flight.out_date,
            inbound_date=cheapest_flight.return_date
        )

    