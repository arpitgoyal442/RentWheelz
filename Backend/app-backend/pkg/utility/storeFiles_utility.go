package utility

import (
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/s3"
)

// Functions To Store in Amazon s3

func Helper_StoreToS3(s3client *s3.S3, file multipart.File, fileHeader *multipart.FileHeader, fileError error) (string, error) {
	if fileError != nil {
		if fileError == http.ErrMissingFile {
			// File not found, handle the case here
			return "", nil
		}
		return "", fileError
	}
	defer file.Close()

	objectKey := fileHeader.Filename

	// Put to Bucket
	bucketName := os.Getenv("BUCKET_NAME")
	_, err := s3client.PutObject(&s3.PutObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
		Body:   file,
	})

	if err == nil {
		publicURL := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", bucketName, "ap-south-1", objectKey)
		fmt.Println("Uploaded Object has Etag as:", objectKey)
		return publicURL, nil
	}
	return "", err
}

// func Helper_StoreFileToS3(s3client *s3.S3, c *gin.Context, fileName string) (string, error) {

// 	file, fileHeader, file_error := c.Request.FormFile(fileName)

// 	if file_error != nil {

// 		if file_error == http.ErrMissingFile {
// 			// File not found, handle the case here
// 			return "", nil
// 		}

// 		return "", file_error
// 	}

// 	defer file.Close()

// 	objectKey := fileHeader.Filename

// 	// Puting to Bucket
// 	bucketName := os.Getenv("BUCKET_NAME")
// 	output, err := s3client.PutObject(&s3.PutObjectInput{
// 		Bucket: aws.String(bucketName),
// 		Key:    aws.String(objectKey),
// 		Body:   file,
// 	})

// 	if err == nil {

// 		publicURL := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", os.Getenv("BUCKET_NAME"), "ap-south-1", objectKey)

// 		fmt.Println("Uploaded Object have Etag as :", output.ETag)

// 		return publicURL, nil
// 	} else {
// 		return "", err
// 	}
// }

// func StoreFileToS3(s3client *s3.S3, c *gin.Context) (string, string, error) {

// 	aadharurl, err1 := Helper_StoreFileToS3(s3client, c, "aadharcard")
// 	licenseurl, err2 := Helper_StoreFileToS3(s3client, c, "license")

// 	if err1 != nil {
// 		return "", "", err1
// 	}

// 	if err2 != nil {
// 		return "", "", err2
// 	}

// 	return aadharurl, licenseurl, nil
// }

func GetFileFromS3(s3client *s3.S3, bucketName, objectKey, destinationPath string) error {
	result, err := s3client.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
	})
	if err != nil {
		return err
	}
	defer result.Body.Close()

	file, err := os.Create(destinationPath)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = io.Copy(file, result.Body)
	return err
}
