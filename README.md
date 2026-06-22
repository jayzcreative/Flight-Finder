# Flight Finder

Flight Finder is a Python-based flight deal tracker that monitors flight prices for a list of destinations stored in Google Sheets. It queries flight data through SerpAPI (Google Flights), updates the lowest price in Sheety, and notifies subscribers when a better fare is found.

## Features

- Search for cheap flights from a fixed origin to multiple destinations
- Try direct flights first, then fall back to indirect options
- Compare the latest fare against the stored lowest price
- Update destination pricing in Google Sheets via Sheety
- Send email alerts to subscribed users
- Use environment-based configuration for API keys and endpoints

## Project Structure

```text
server/
  main.py                # Main workflow for fetching and processing flight deals
  requirements.txt       # Python dependencies
  src/
    data_manager.py      # Reads and updates Google Sheet data via Sheety
    flight_data.py       # Formats and selects the cheapest flight option
    flight_search.py     # Calls the flight search API
    notification_manager.py  # Sends notifications via email/Twilio
```

## Tech Stack

- Python
- Requests and requests-cache
- python-dotenv
- Sheety for Google Sheets integration
- SerpAPI for flight search data
- Twilio and SMTP for notifications

## Setup

1. Clone the repository
2. Create and activate a virtual environment
3. Install dependencies:

```bash
pip install -r server/requirements.txt
```

4. Create a `.env` file inside the `server` directory with the following variables:

```env
SERPAPI_KEY=your_serpapi_key
SERPAPI_ENDPOINT=https://serpapi.com/search.json
SHEETY_TOKEN=your_sheety_basic_auth_token
SHEETY_ENDPOINT=https://api.sheety.co/your-sheet-id/prices
SHEETY_ENDPOINT_USERS=https://api.sheety.co/your-sheet-id/users
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

5. Run the app:

```bash
python server/main.py
```

## How It Works

1. The app reads destination and price threshold data from Sheety.
2. It searches for flights from London (LHR) to each destination for a date range starting tomorrow.
3. It identifies the cheapest available option.
4. If the fare is lower than the current saved threshold, it updates the sheet and sends a notification.

## Notes

- The current implementation is configured for a fixed origin airport (`LHR`).
- The script uses a cache for API requests to reduce repeated lookups.
- If you want to customize alert delivery, update the notification logic in `server/src/notification_manager.py`.
