package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Coordinates struct {
	Latitude  string `json:"latitude"`
	Longitude string `json:"longitude"`
}

type Bike struct {
	ID            primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	OwnerId       string             `json:"ownerid"`
	BikeName      string             `json:"bikeName"`
	BikeNumber    string             `json:"bikeNumber"`
	Rate          int                `json:"rate"`
	AvailableOn   string             `json:"availableOn"`
	AvailableFrom string             `json:"availableFrom"`
	AvailableTo   string             `json:"availableTo"`

	Street      string  `json:"street"`
	City        string  `json:"city"`
	Address     string  `json:"address"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Description string  `json:"description"`
	IsOccupied  bool    `json:"isoccupied"`
	Image       string  `json:"image"`
	CustomerId  string  `json:"customerid"` // by default it is "" is no customer has booked the bike
}
