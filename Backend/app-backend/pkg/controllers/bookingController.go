package controllers

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/arpitgoyal442/rentwheelz-backend/pkg/config"
	"go.mongodb.org/mongo-driver/bson"
	"gopkg.in/gomail.v2"

	"github.com/arpitgoyal442/rentwheelz-backend/pkg/utility"
	"github.com/gin-gonic/gin"
)

func AcceptBikeImages(c *gin.Context) {

	bikeId := c.Param("bikeid")

	config.CreateSession()

	var bikeImages []string

	s3Client := config.GetS3Client()

	err := c.Request.ParseMultipartForm(10 << 20) // 10 MB limit
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	files := c.Request.MultipartForm.File["bikeImages"]

	for _, fileHeader := range files {

		file, err := fileHeader.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
			return
		}

		url, err := utility.Helper_StoreToS3(s3Client, file, fileHeader, err)

		if err != nil {

			c.JSON(500, gin.H{"err": err, "msg": "unable to Store in s3"})

		}

		bikeImages = append(bikeImages, url)

		defer file.Close()
	}

	// add this bikeImages to the bikeId in bookings

	mongoClient := config.GetClient()
	collection := mongoClient.Database("mydb").Collection("bookings")
	updateData := bson.M{

		"$set": bson.M{
			"bikeimages": bikeImages,
		},
	}

	updateresult, updateerr := collection.UpdateOne(context.TODO(), bson.M{"bikeid": bikeId}, updateData)

	if updateerr != nil {

		c.JSON(500, gin.H{"err": updateerr, "message": "Unable to add bike images in Bookings"})
		return
	}

	// Now send these Images to Owner
	sendImagesViaMail(bikeImages)

	c.JSON(200, gin.H{"data": updateresult.ModifiedCount})

}

func sendImagesViaMail(bikeImages []string) error {

	my_email := os.Getenv("MY_EMAIL")
	my_password := os.Getenv("MY_EMAIL_PASSWORD")

	htmlBody := "<html><body><h3>Please find images Send by the Customer Before Starting the ride</h3>"

	for _, imageLink := range bikeImages {
		// Add an image tag for each image link
		imgTag := fmt.Sprintf(`<img src="%s" alt="Image">`, imageLink)
		htmlBody += imgTag
	}

	htmlBody += "</body></html>"

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
