package cache

import (
	"context"
	"fmt"

	"github.com/go-redis/redis/v8"
	"github.com/spf13/viper"
)

var redisClient *redis.Client

func init() {

	// Write Path according to main.go
	viper.SetConfigFile("../../pkg/config/redisconfig.yml")

	err := viper.ReadInConfig()

	if err != nil {

		fmt.Println(err)
	}

	redisConfig := viper.GetStringMapString("redis")
	fmt.Println(redisConfig["password"])

	client := redis.NewClient(&redis.Options{
		Addr:     redisConfig["host"],
		Password: redisConfig["password"],
		DB:       0,
	})

	// Ping the Redis server to check the connection
	res, error := client.Ping(context.TODO()).Result()
	if error != nil {
		fmt.Println(error)
	}

	fmt.Println(res)

	redisClient = client

}

func GetRedisClient() *redis.Client {

	return redisClient
}
