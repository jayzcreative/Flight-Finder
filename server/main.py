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
    trip_type = input("Trip type? (1=Round Trip, 2=One Way): ").strip() or "1"
    if trip_type in ["1", "2"]:
        break
    print("Please enter 1 or 2.")

while True:
    email = input('Enter your email: ').strip()
    if re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
        break
    print("Please enter a valid email address.")

while True:
    currency = input("Currency (default GBP): ").strip().upper() or "GBP"
    if len(currency) == 3 and currency.isalpha():
        break
    print("Please enter a valid 3-letter currency code e.g GBP, USD, INR.")


while True:
    try:
        budget = float(input(f'Enter your budget in {currency}: ').strip())
        if budget <= 0:
            print("Budget must be greater than 0.")
            continue
        break
    except ValueError:
        print("Please enter a valid number.")
while True:
    try:
        adults = int(input("Number of adults (default 1): ").strip() or "1")
        if adults <= 0:
            print("Must be at least 1 adult.")
            continue
        break
    except ValueError:
        print("Please enter a valid number.")
while True:
    print("Cabin class: 1=Economy, 2=Premium Economy, 3=Business, 4=First")
    travel_class = input("Choose cabin class (default 1): ").strip() or "1"
    if travel_class in ["1", "2", "3", "4"]:
        break
    print("Please enter 1, 2, 3 or 4.")
while True:
    try:
        months_ahead = int(input("Search how many months ahead? (1-12, default 6): ").strip() or "6")
        if 1 <= months_ahead <= 12:
            break
        print("Please enter a number between 1 and 12.")
    except ValueError:
        print("Please enter a valid number.")


tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
end_date = (datetime.now() + timedelta(days=30 * months_ahead)).strftime('%Y-%m-%d')


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
print(f'\nSearching for direct flights from {origin_city} to {destination_city} between {tomorrow} and {end_date} within your budget of {currency}{budget}...')
try:
    flights=flight_search.check_flights(
        origin_city_code=origin_code,
        destination_city_code=destination_code,
        from_time=tomorrow,
        to_time=end_date if trip_type == "1" else None,
        is_direct=True,
        trip_type=trip_type,
        currency=currency,
        adults=adults ,
        travel_class=travel_class

    )
    
    if flights is None:
        print("Colud not retrieve flights.Please try again later.")
        exit()
    cheapest=find_cheapest_flight(flights,end_date)
except Exception as e:
    print(f"Unexpected error: {e}")
    exit()
#-------------------FALLBACK TO INDIRECT FLIGHTS-------------------#

if cheapest.price == 'N/A':
    print(f'No direct flights found. Searching indirect...')
    try:
        flights = flight_search.check_flights(
            origin_city_code=origin_code,
            destination_city_code=destination_code,
            from_time=tomorrow,
            to_time=end_date if trip_type=='1' else None,
            is_direct=False,
            trip_type=trip_type,
            currency=currency,
            adults=adults,
            travel_class=travel_class
        )
        
        if flights is None:
            print("Colud not retrieve flights.Please try again later.")
            exit()
        cheapest = find_cheapest_flight(flights, end_date)
    
    except Exception as e:
        print(f"Unexpected error: {e}")
        exit()

if cheapest.price=='N/A':
    print(f'Sorry, we could not find any flights from {origin_city} to {destination_city} within your budget of {currency}{budget}. Please try again later or adjust your search criteria.')
    exit()

print(f'Cheapest flight found: {currency}{cheapest.price} .')
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
    print(f'\n🎉 Great news! We found a flight from {origin_city} to {destination_city} for {currency}{cheapest.price}, which is within your budget of {currency}{budget}. Sending you an email notification now...')
    notification_manager.send_emails(
        customer_emails=[email],
        price=cheapest.price,
        departure_code=cheapest.origin_airport,
        arrival_code=cheapest.destination_airport,
        outbound_date=cheapest.out_date,
        inbound_date=cheapest.return_date,
        stops=cheapest.stops,
        currency=currency
    )
    print('📧 Email sent!')

else:
    print(f"\n⚠️  Cheapest price {currency} {cheapest.price} is above your budget of {currency} {budget}.")
    print("No email sent but search is saved.")