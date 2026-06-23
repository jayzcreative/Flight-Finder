import os
import re
from datetime import datetime, timedelta
from dotenv import load_dotenv
import requests_cache

from src.data_manager import DataManager
from src.flight_search import FlightSearch
from src.flight_data import find_cheapest_flight
from src.notification_manager import NotificationManager

"""This is the main file that runs the entire program. It checks for flight deals and sends notifications to customers if a deal is found."""
load_dotenv()

"""Setting up requests cache to avoid hitting API limits and improve performance. Cache expires after 1 hour, but Sheety endpoints are never cached to ensure we always have fresh data."""
requests_cache.install_cache(
    cache_name='flight_cache',
    expire_after=3600,  # 1 hour
    urls_expire_after={
        os.getenv('SHEETY_ENDPOINT'): 0 ,
        os.getenv('SHEETY_ENDPOINT_USERS'): 0 ,
        os.getenv('SHEETY_ENDPOINT_SEARCHES'): 0  # never cache Sheety - always fresh
    }
)

"""Objects for data management, flight search, and notification management."""
notification_manager=NotificationManager()
data_manager = DataManager()
flight_search = FlightSearch()


tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
six_months_from_today = (datetime.now() + timedelta(days=180)).strftime('%Y-%m-%d')

#-------------------USER INPUT-------------------#

print('Welcome to Flight Finder!')

while True:
    origin_city = input('Enter the origin city: ').strip()
    if origin_city:
        break
    print("City name cannot be empty.")

while True:
    destination_city = input('Enter the destination city: ').strip()
    if destination_city:
        break
    print("City name cannot be empty.")
while True:
    email = input('Enter your email: ').strip()
    if re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
        break
    print("Please enter a valid email address.")

while True:
    try:
        budget = float(input('Enter your budget in GBP: ').strip())
        if budget <= 0:
            print("Budget must be greater than 0.")
            continue
        break
    except ValueError:
        print("Please enter a valid number.")
#-------------------GET IATA CODES-------------------#

print(f'Looking up airports for {origin_city} and {destination_city}...')
origin_code=flight_search.get_iata_code(origin_city)
destination_code=flight_search.get_iata_code(destination_city)

if origin_code=='N/A' or destination_code=='N/A':
    print('Sorry, we could not find IATA codes for the provided cities. Please check your city names and try again.')
    exit()

print(f'{origin_city}→{origin_code}')
print(f'{destination_city}→{destination_code}')


#-------------------SEARCH DIRECT FLIGHTS-------------------#
print(f'\nSearching for direct flights from {origin_city} to {destination_city} between {tomorrow} and {six_months_from_today} within your budget of GBP{budget}...')
flights=flight_search.check_flights(
    origin_city_code=origin_code,
    destination_city_code=destination_code,
    from_time=tomorrow,
    to_time=six_months_from_today,
    is_direct=True
)
cheapest=find_cheapest_flight(flights,six_months_from_today)

#-------------------FALLBACK TO INDIRECT FLIGHTS-------------------#

if cheapest.price == 'N/A':
    print(f'No direct flights found. Searching indirect...')
    flights = flight_search.check_flights(
        origin_city_code=origin_code,
        destination_city_code=destination_code,
        from_time=tomorrow,
        to_time=six_months_from_today,
        is_direct=False
    )
    cheapest = find_cheapest_flight(flights, six_months_from_today)

if cheapest.price=='N/A':
    print(f'Sorry, we could not find any flights from {origin_city} to {destination_city} within your budget of GBP{budget}. Please try again later or adjust your search criteria.')
    exit()

print(f'Cheapest flight found: GBP{cheapest.price} .')
print(f'From {cheapest.origin_airport}  → To: {cheapest.destination_airport}.')
print(f'Outbound date: {cheapest.out_date} | Return date    : {cheapest.return_date}.')
print(f'Stops: {cheapest.stops}.')


#-------------------SAVE TO SEARCHES SHEET-------------------#
data_manager.post_search_result(
    email=email,
    origin=origin_city,
    destination=destination_city,
    origin_code=origin_code,
    destination_code=destination_code,
    price=cheapest.price,
    outbound=cheapest.out_date,
    inbound=cheapest.return_date,
    stops=cheapest.stops
)
print("\n✅ Search saved to sheet!")

#-------------------SEND NOTIFICATION-------------------#
if cheapest.price <= budget:
    print(f'\n🎉 Great news! We found a flight from {origin_city} to {destination_city} for GBP{cheapest.price}, which is within your budget of GBP{budget}. Sending you an email notification now...')
    notification_manager.send_emails(
        customer_emails=[email],
        price=cheapest.price,
        departure_code=cheapest.origin_airport,
        arrival_code=cheapest.destination_airport,
        outbound_date=cheapest.out_date,
        inbound_date=cheapest.return_date,
        stops=cheapest.stops   
    )
    print('📧 Email sent!')

else:
    print(f"\n⚠️  Cheapest price GBP {cheapest.price} is above your budget of GBP {budget}.")
    print("No email sent but search is saved.")