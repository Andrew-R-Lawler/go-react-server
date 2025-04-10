package handlers

import (
	"fmt"
	"log"
	"database/sql"
	"github.com/gin-gonic/gin"
)

func GetProducts (c *gin.Context, db *sql.DB) {
	fmt.Println("GetProducts endpoint hit")
	log.Println("GetProducts endpoint hit")
}

func AddProduct (c *gin.Context, db *sql.DB) {
	log.Println("Add Product endpoint hit")
	admin, _ := c.Get("admin")
	log.Printf("admin: %v", admin)
}
