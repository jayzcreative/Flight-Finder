import os
from dotenv import load_dotenv
import smtplib

load_dotenv()

class NotificationManager:
   
    #This class is responsible for sending notifications with the deal flight details.
   def __init__(self):

      self.smtp_email=os.getenv('SMTP_EMAIL')
      self.smtp_password=os.getenv('SMTP_PASSWORD')
      
   
    

   def send_emails(self,customer_emails,price,departure_code,arrival_code,outbound_date,inbound_date,stops):
       message=(
        f"Low price alert: Only GBP{price} to fly from {departure_code} to {arrival_code}."
        f"From {outbound_date} to {inbound_date}."
        f"Stops: {stops}"
      )
       self.connection=smtplib.SMTP('smtp.gmail.com',587)
       self.connection.starttls()
       self.connection.login(self.smtp_email,self.smtp_password)
       
       for email in customer_emails:   
         self.connection.sendmail(
            from_addr=self.smtp_email,
            to_addrs=email,
            msg=f"Subject:New Low Price Flight!\n\n{message}".encode('utf-8')
         )
       self.connection.close()