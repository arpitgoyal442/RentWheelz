package controllers

import (
	"context"

	"fmt"
	"net/http"

	"github.com/arpitgoyal442/rentwheelz-backend/pkg/config"
	"github.com/arpitgoyal442/rentwheelz-backend/pkg/models"
	"github.com/arpitgoyal442/rentwheelz-backend/pkg/utility"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"

	"go.mongodb.org/mongo-driver/mongo"
)

func GetSingleUser(ctx *gin.Context) {

	userId := ctx.Param("id")

	fmt.Println("User id:", userId)

	client := config.GetClient()
	collection := client.Database("mydb").Collection("users")

	result := collection.FindOne(context.TODO(), bson.M{"id": userId})

	if result.Err() == mongo.ErrNoDocuments {

		ctx.JSON(http.StatusNotFound, gin.H{"error: ": "No document found"})
	} else {

		var user models.User
		result.Decode(&user)
		fmt.Println(user)
		ctx.JSON(200, gin.H{"data": user})
	}
}

// To send only user-name,email and phonenumber
func GetBasicInfo(ctx *gin.Context) {

	userid := ctx.Param("userid")
	fmt.Println(userid)

	type Basicinfo struct {
		Name  string `json:"name"`
		Phone string `json:"phone"`
		Email string `json:"email"`
	}

	mongoClient := config.GetClient()

	collection := mongoClient.Database("mydb").Collection("users")

	result := collection.FindOne(context.TODO(), bson.M{"id": userid})

	if result.Err() != nil {

		fmt.Println(result.Err())
	}

	var basicinfo Basicinfo

	result.Decode(&basicinfo)

	ctx.JSON(200, gin.H{"data": basicinfo})

}

func AddUser(c *gin.Context) {

	var user models.User

	c.BindJSON(&user)

	fmt.Println(user)

	mongoClient := config.GetClient()
	collection := mongoClient.Database("mydb").Collection("users")

	result, err := collection.InsertOne(context.TODO(), user)

	if err != nil {
		c.JSON(404, gin.H{"err": err})
	} else {

		c.JSON(200, gin.H{"user is": result.InsertedID})
	}

}

func UpdateUser(c *gin.Context) {

	id := c.Param("id")
	fmt.Println("User id:", id)

	// mongoclient
	mongoClient := config.GetClient()
	collection := mongoClient.Database("mydb").Collection("users")

	// Parse the form data
	err := c.Request.ParseMultipartForm(10 << 20) // 10 MB maximum file size
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to parse form data",
		})
		return
	}

	name := c.Request.FormValue("name")
	email := c.Request.FormValue("email")
	phone := c.Request.FormValue("phone")
	aadharcard := ""
	license := ""

	fmt.Println(id, name, email, phone)

	// Uploading the files to amazon s3
	config.CreateSession()
	s3slient := config.GetS3Client()
	fmt.Println("Client is :", *s3slient)

	aadharFile, aadharHeader, aadharerr := c.Request.FormFile("aadharcard")
	licenseFile, licenseHeader, licenseerr := c.Request.FormFile("license")

	// aadharURL, licenseURL, err := utility.StoreFileToS3(s3slient, c)
	aadharURL, err := utility.Helper_StoreToS3(s3slient, aadharFile, aadharHeader, aadharerr)
	licenseURL, err := utility.Helper_StoreToS3(s3slient, licenseFile, licenseHeader, licenseerr)

	if err != nil {
		fmt.Println(err)
		c.JSON(404, gin.H{"res": err})
	} else {
		aadharcard = aadharURL
		license = licenseURL
		fmt.Println(aadharcard, license)

		// Now add the user to Database
		var documents bool
		if email != "" && phone != "" && aadharURL != "" && licenseURL != "" {
			documents = true
		} else {
			documents = false
		}

		// To update we can't simply Give user we need to give a bson object (bcz update needs a bson object )
		updateData := bson.M{

			"$set": bson.M{
				"name":      name,
				"email":     email,
				"phone":     phone,
				"documents": documents,
			},
		}

		// If aadharURL is not empty, add it to the updateData
		if aadharURL != "" {
			setFields, ok := updateData["$set"].(bson.M)
			if !ok {
				setFields = bson.M{}
			}

			setFields["aadharcard"] = aadharURL
			updateData["$set"] = setFields
		}

		// Similarly if license is coming from frontend then only set its new value in db
		if licenseURL != "" {
			setFields, ok := updateData["$set"].(bson.M)
			if !ok {
				setFields = bson.M{}
			}

			setFields["license"] = licenseURL
			updateData["$set"] = setFields
		}

		fmt.Println(updateData)

		_, error := collection.UpdateOne(context.TODO(), bson.M{"id": id}, updateData)

		if err != nil {
			c.JSON(404, gin.H{"error": error})
		} else {
			c.JSON(200, gin.H{"res": "Updated"})
		}

		// c.JSON(200, gin.H{"adharcardURL": aadharURL , "licenseURL":licenseURL })
	}

}
