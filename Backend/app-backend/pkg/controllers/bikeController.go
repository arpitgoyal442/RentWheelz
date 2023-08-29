package controllers

import (
	// "context"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/arpitgoyal442/rentwheelz-backend/pkg/cache"
	"github.com/arpitgoyal442/rentwheelz-backend/pkg/config"
	"github.com/arpitgoyal442/rentwheelz-backend/pkg/models"
	"github.com/arpitgoyal442/rentwheelz-backend/pkg/utility"
	"github.com/gin-gonic/gin"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"gopkg.in/gomail.v2"

	_ "github.com/arpitgoyal442/rentwheelz-backend/pkg/cache"
)

func AllBikes(c *gin.Context) {

	// See if data if we can send the data from cache
	redisClient := cache.GetRedisClient()
	cachedData, error := redisClient.Get(context.Background(), "allBikes").Result()
	if error == nil {

		fmt.Println("Cache Hit")
		var bikes []models.Bike
		// because cachedData is in json-string format So convert to golang struct first
		json.Unmarshal([]byte(cachedData), &bikes)
		c.JSON(200, gin.H{"bikes": bikes})
		return

	} else {
		fmt.Println("Inside error")
		fmt.Println(error)
	}

	// If data is not in Cache or expired then fetch from DB
	mongoClient := config.GetClient()
	collection := mongoClient.Database("mydb").Collection("bikes")

	filter := bson.D{}
	cursor, err := collection.Find(context.TODO(), filter)

	if err != nil {
		c.JSON(404, gin.H{"err": err})
	}

	defer cursor.Close(context.TODO())

	var bikes []models.Bike
	for cursor.Next(context.TODO()) {
		var bike models.Bike
		if err := cursor.Decode(&bike); err != nil {
			log.Fatal(err)
		}

		bikes = append(bikes, bike)
	}

	if err := cursor.Err(); err != nil {
		log.Fatal(err)
	}

	// Inserting into Cache
	bikeJSON, err := json.Marshal(bikes)
	if err != nil {
		log.Fatalf("Failed to marshal bikes: %v", err)
	}
	redisClient.Set(context.TODO(), "allBikes", bikeJSON, 30*time.Second)

	c.JSON(200, gin.H{"bikes": bikes})
}

func SingleBike(c *gin.Context) {

	mongoClient := config.GetClient()
	collection := mongoClient.Database("mydb").Collection("bikes")

	bkId := c.Param("id")

	bikeId, err := primitive.ObjectIDFromHex(bkId)

	if err != nil {
		c.JSON(404, gin.H{"error": err})
	}
	result := collection.FindOne(context.TODO(), bson.M{"_id": bikeId})

	var bike models.Bike
	result.Decode(&bike)

	if result.Err() != nil {

		if result.Err().Error() == "ErrNoDocuments" {
			c.JSON(200, gin.H{"Data": bike}) // in this base bike will have all the keys but empty values
		}

	}

	c.JSON(200, gin.H{"bikeData": bike})

}

func AddBike(c *gin.Context) {

	var myBike models.Bike
	c.ShouldBind(&myBike)

	fmt.Println("My Bike")
	fmt.Println(myBike)

	fmt.Println(myBike.Image)

	config.CreateSession()
	s3slient := config.GetS3Client()
	file, fileheader, err := c.Request.FormFile("Image")

	// Uploaded_url, error := utility.Helper_StoreFileToS3(s3slient, c, "Image")
	Uploaded_url, error := utility.Helper_StoreToS3(s3slient, file, fileheader, err)

	if error == nil {
		fmt.Println(Uploaded_url)
		myBike.Image = Uploaded_url

	} else {
		fmt.Println("Error in uploading as :", error)
		c.JSON(404, gin.H{"Couldn't upload image as :": error})
	}

	config.ConnectDb()
	mongoClient := config.GetClient()
	collection := mongoClient.Database("mydb").Collection("bikes")

	result, inserterr := collection.InsertOne(context.Background(), myBike)

	if inserterr != nil {
		c.JSON(404, gin.H{"Couldn't Insert into DB as :": error})
	} else {
		c.JSON(200, gin.H{"Successfully inserted ,id:": result.InsertedID})
	}

}

func setCustomerId(mongoClient *mongo.Client, customerId string, bikeId primitive.ObjectID, sessionContext mongo.SessionContext, updatedBike models.Bike, wg *sync.WaitGroup, errorchan chan error) {

	defer wg.Done()
	collection := mongoClient.Database("mydb").Collection("bikes")
	updateData := bson.M{

		"$set": bson.M{
			"customerid": customerId,
		},
	}
	result := collection.FindOneAndUpdate(sessionContext, bson.M{"_id": bikeId}, updateData)

	if result.Err() != nil {
		// return result.Err()
		errorchan <- result.Err()
	}
	result.Decode(&updatedBike)
	// return nil
	errorchan <- nil

}

func insertIntoBooking(mongoClient *mongo.Client, bkid string, customerId string, ownerId string, sessionContext mongo.SessionContext, wg *sync.WaitGroup, errorchan chan error) {

	defer wg.Done()
	bookingCollection := mongoClient.Database("mydb").Collection("bookings")
	var booking models.Booking
	booking.BikeID = bkid
	booking.CustomerID = customerId
	booking.OwnerID = ownerId

	bookingresult, bookingerr := bookingCollection.InsertOne(sessionContext, booking)

	if bookingerr != nil {
		fmt.Println("Inside booking error")
		fmt.Println(bookingerr)
		errorchan <- bookingerr

		// return bookingerr

	} else {
		fmt.Println("booking done with inserted id : ", bookingresult.InsertedID)
		errorchan <- nil
	}

	// return nil
	// errorchan<-nil

}

func BookBike(c *gin.Context) {

	var wg sync.WaitGroup
	errorChan := make(chan error)

	wg.Add(2)

	startTime := time.Now()

	mongoClient := config.GetClient()
	bkid := c.Param("bikeid")

	bikeId, err := primitive.ObjectIDFromHex(bkid)
	if err != nil {
		c.JSON(404, gin.H{"error": err})
	}

	var requestBody struct {
		UserID     string `json:"userid"`
		Aadharcard string `json:"aadharcard"`
		License    string `json:"license"`
		Name       string `json:"name"`
		Phone      string `json:"phone"`
	}

	if err := c.BindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	var updatedBike models.Bike

	// Perform 2 Tasks as a single transaction (using mongodb transaction)
	// So that if any one trans. fails we will be rolled back
	session, err := mongoClient.StartSession()
	if err != nil {
		panic(err)
	}
	defer session.EndSession(context.Background())

	err = mongo.WithSession(context.Background(), session, func(sessionContext mongo.SessionContext) error {
		if err = session.StartTransaction(); err != nil {
			return err
		}

		// Do Task 1 --> Set Customer Id
		go setCustomerId(mongoClient, requestBody.UserID, bikeId, sessionContext, updatedBike, &wg, errorChan)

		// Do task 2 --> Push to bookings Models
		go insertIntoBooking(mongoClient, bkid, requestBody.UserID, updatedBike.OwnerId, sessionContext, &wg, errorChan)

		var errors []error

		for i := 0; i < 2; i++ {
			err := <-errorChan
			if err != nil {
				errors = append(errors, err)
			}
		}

		if len(errors) == 0 {

			err := session.CommitTransaction(sessionContext)
			if err != nil {
				return err
			} else {
				return nil
			}
		} else {
			fmt.Println(errors[0])
			return errors[0]
		}

	})
	if err != nil {

		if abortErr := session.AbortTransaction(context.Background()); abortErr != nil {
			fmt.Println(abortErr)

		}

		c.JSON(500, gin.H{"Error": err})
	}

	// Send mail to owner saying : zyz user is requesting to book you bike here are the users details

	fmt.Println("before Send mail")
	sendMail(requestBody.Aadharcard, requestBody.License, requestBody.Name, requestBody.Phone, updatedBike.BikeName, updatedBike.BikeNumber)

	endTime := time.Now()

	elapsedTime := endTime.Sub(startTime)

	fmt.Println("Time took was : " + elapsedTime.String())

	c.JSON(200, gin.H{"message": "Bike Booked"})

	wg.Wait()

}

func sendMail(aadharcard string, license string, name string, phone string, bikeName string, bikeNumber string) error {

	my_email := os.Getenv("MY_EMAIL")
	my_password := os.Getenv("MY_EMAIL_PASSWORD")

	htmlBody := `
    <html>
	  
        <body>
            <h3>` + name + ` has booked your bike : ` + bikeName + ` (` + bikeNumber + `)</h3>
            <h4> phone number is : ` + phone + `</h4>
			<p>Please Find below customers AadharCard and License .</p>
			<p>Note: Verify User details in documents before handling the vehicle </p>
            <img src="` + aadharcard + `" alt="Adharcard">
            <img src="` + license + `" alt="Image 2">
        </body>
    </html>
    `

	m := gomail.NewMessage()
	m.SetHeader("From", "arpitgoyal442@gmail.com")
	m.SetHeader("To", "arpitgoyal271199@gmail.com")
	m.SetHeader("Subject", "Hello from Go!")
	m.SetBody("text/html", htmlBody)

	// Create a new SMTP client
	d := gomail.NewDialer("smtp.gmail.com", 587, my_email, my_password)

	// Send the email
	if err := d.DialAndSend(m); err != nil {

		fmt.Println(err)
		return err
	} else {
		return nil
	}

}

func Test(ctx *gin.Context) {

	type reqBody struct {
		data1 string
		data2 string
	}

	var body reqBody

	ctx.BindJSON(&body)

	ctx.JSON(200, gin.H{"data": body})

}

func GetBookedBikes(ctx *gin.Context) {

	userid := ctx.Param("userid")

	// Return all the bikes where customerId==userid

	mongoClient := config.GetClient()

	collection := mongoClient.Database("mydb").Collection("bikes")

	cursor, err := collection.Find(context.TODO(), bson.M{"customerid": userid})

	if err != nil {

		ctx.JSON(404, gin.H{"error": err})
		return
	}

	defer cursor.Close(context.TODO())

	var bikes []models.Bike
	for cursor.Next(context.TODO()) {
		var bike models.Bike
		if err := cursor.Decode(&bike); err != nil {
			log.Fatal(err)
		}

		bikes = append(bikes, bike)
	}

	ctx.JSON(200, gin.H{"data": bikes})

}
