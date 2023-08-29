package models



type User struct {
	Id         string   `json:"id" `
	Name       string `json:"name" `
	Email      string `json:"email" `
	Phone      string `json:"phone" `
	License    string `json:"license" `
	Aadharcard string `json:"aadharcard" `
	Documents  bool  `json:"documents" `
}