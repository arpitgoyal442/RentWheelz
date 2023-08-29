package models

type Booking struct {
	BikeID             string   `json:"bikeid"`
	OwnerID            string   `json:"ownerid"`
	CustomerID         string   `json:"customerid"`
	BookingTime        string   `json:"bookingTime"`
	StartTime          string   `json:"startTime"`
	EndTime            string   `json:"endTime"`
	IsPaymentDone      bool     `json:"isPaymentDone"`
	IsRideStarted      bool     `json:"isRideStarted"`
	BikeImages         []string `json:"bikeimages"`         // uploaded by customer
	IsVerificationDone bool     `json:"isverificationdone"` // Owner will verify the images first

}
