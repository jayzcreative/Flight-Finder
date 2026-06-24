class FlightData:
    """This class is responsible for structuring the flight data."""

    def __init__(self, price, origin_airport, destination_airport, out_date, return_date,stops):
        self.price = price
        self.origin_airport = origin_airport
        self.destination_airport = destination_airport
        self.out_date = out_date
        self.return_date = return_date
        self.stops=stops


def find_cheapest_flight(data, return_date,trip_type="1"):
    if data is None or ('best_flights' not in data and 'other_flights' not in data):
        return FlightData("N/A", "N/A", "N/A", "N/A", "N/A",'N/A')

    all_flights = data.get('best_flights', []) + data.get('other_flights', [])

    cheapest_flight = FlightData(
        price=float('inf'),
        origin_airport="N/A",
        destination_airport="N/A",
        out_date="N/A",
        return_date="N/A", 
        stops="N/A"
    )
  

    for flight in all_flights:
        if "price" not in flight:
            continue
        price = flight["price"]
        if price < cheapest_flight.price:
            cheapest_flight.price = price
            cheapest_flight.origin_airport = flight["flights"][0]["departure_airport"]["id"]
            cheapest_flight.stops=len(flight['flights'])-1
            cheapest_flight.destination_airport = flight["flights"][-1]["arrival_airport"]["id"]
            cheapest_flight.out_date = flight["flights"][0]["departure_airport"]["time"].split(" ")[0]
            cheapest_flight.return_date = return_date if trip_type == "1" else "One way"
    if cheapest_flight.price == float('inf'):
        return FlightData("N/A", "N/A", "N/A", "N/A", "N/A", "N/A")
    return cheapest_flight
   
        