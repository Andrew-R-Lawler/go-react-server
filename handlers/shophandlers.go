package handlers

import (
	"log"
	"net/http"
	"database/sql"
	"github.com/gin-gonic/gin"
)

type Product struct {
	ID				int		`json:"id"`
	Name			string	`json:"name"`	
	Description		string	`json:"description"`
	ImageUrl		string	`json:"image_url"`
	Price			float32	`json:"price"`
	StockQuantity	int		`json:"stock_quantity"`
}

func GetProducts (c *gin.Context, db *sql.DB) {
	rows, err := db.Query(`SELECT * FROM "products" ORDER BY id;`)
	if err != nil {
		log.Printf("error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}
	defer rows.Close()
	var products []Product
	for rows.Next() {
		var product Product
		if err := rows.Scan(&product.ID, &product.Name, &product.Description, &product.ImageUrl, &product.Price, &product.StockQuantity); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read product"})
			return
		}
		products = append(products, product)
	}
	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while iterating products"})
		return
	}
	c.JSON(http.StatusOK, products)
}

func AddProduct (c *gin.Context, db *sql.DB) {
	admin, _ := c.Get("admin")
	if admin == false {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Only admins can add products"})
		return
	}
	var product Product
	err := c.ShouldBindJSON(&product)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	query := `INSERT INTO products ("name", "description", "image_url", "price", "stock_quantity")
	VALUES ($1, $2, $3, $4, $5)`
	_, err = db.Exec(query, product.Name, product.Description, product.ImageUrl, product.Price, product.StockQuantity)
	if err != nil {
		log.Printf("error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{ "message": "Added Product", })
}

func DeleteProduct (c *gin.Context, db *sql.DB) {
	admin, _ := c.Get("admin")
	if admin == false {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user is not an admin"})
		return
	}
	productId := c.Param("id")
	query := "DELETE FROM products WHERE id = $1"
	_, err := db.Exec(query, productId)
	if err != nil {
		log.Printf("error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "product successfully deleted"})
}

func EditProduct (c *gin.Context, db *sql.DB) {
	admin, _ := c.Get("admin")
	if admin == false {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Only admins can edit products"})
	}
	var product Product
	err := c.ShouldBindJSON(&product)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	productId := c.Param("id")
	query := `UPDATE "products"
	SET name = $1,
		description = $2,
		image_url = $3,
		price = $4,
		stock_quantity = $5
	WHERE id = $6
	`
	result, err := db.Exec(query, product.Name, product.Description, product.ImageUrl, product.Price, product.StockQuantity, productId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update product"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": 	"product updated successfully",
		"result": result,
	})
}
