package config

import (
	"fmt"
	"os"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)



var S3client *s3.S3

func CreateSession(){

	accessKey := os.Getenv("AWS_ACCESS_KEY_ID")
	secretKey := os.Getenv("AWS_SECRET_ACCESS_KEY")

	fmt.Println(accessKey,secretKey)

	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("ap-south-1"), 
		Credentials: credentials.NewStaticCredentials(accessKey,secretKey,""),
		
		
	})
	if err != nil {
		fmt.Printf("Failed to create session: %v", err)
	}

	// Create an S3 client
	S3client = s3.New(sess)

}

func GetS3Client() (*s3.S3){

	return S3client
}