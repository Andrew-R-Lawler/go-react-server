package handlers

import (
	"database/sql"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
)

type Product struct {
	ID              int      `json:"id"`
	Name            string   `json:"name"`
	Description     string   `json:"description"`
	Images          []string `json:"images"`
	Price           float32  `json:"price"`
	StockQuantity   int      `json:"stock_quantity"`
	Featured        bool     `json:"featured"`
	OnSale          bool     `json:"on_sale"`
	SalePrice       float32  `json:"sale_price"`
	LongDescription string   `json:"long_description"`
}

func GetProducts(c *gin.Context, db *sql.DB) {
	rows, err := db.Query(`SELECT id, name, description, images, price, stock_quantity, featured, on_sale, sale_price, COALESCE(long_description, '') FROM "products" ORDER BY id;`)
	if err != nil {
		log.Printf("error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}
	defer rows.Close()
	var products []Product
	for rows.Next() {
		var product Product
		if err := rows.Scan(&product.ID, &product.Name, &product.Description, pq.Array(&product.Images), &product.Price, &product.StockQuantity, &product.Featured, &product.OnSale, &product.SalePrice, &product.LongDescription); err != nil {
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

func GetFeaturedProducts(c *gin.Context, db *sql.DB) {
	rows, err := db.Query(`SELECT id, name, description, images, price, stock_quantity, featured, on_sale, sale_price, COALESCE(long_description, '') FROM "products" WHERE featured = TRUE ORDER BY id;`)
	if err != nil {
		log.Printf("error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}
	defer rows.Close()
	var products []Product
	for rows.Next() {
		var product Product
		if err := rows.Scan(&product.ID, &product.Name, &product.Description, pq.Array(&product.Images), &product.Price, &product.StockQuantity, &product.Featured, &product.OnSale, &product.SalePrice, &product.LongDescription); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read product"})
			return
		}
		products = append(products, product)
	}
	if products == nil {
		products = []Product{}
	}
	c.JSON(http.StatusOK, products)
}

func GetNewArrivals(c *gin.Context, db *sql.DB) {
	rows, err := db.Query(`SELECT id, name, description, images, price, stock_quantity, featured, on_sale, sale_price, COALESCE(long_description, '') FROM "products" ORDER BY id DESC LIMIT 6;`)
	if err != nil {
		log.Printf("error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}
	defer rows.Close()
	var products []Product
	for rows.Next() {
		var product Product
		if err := rows.Scan(&product.ID, &product.Name, &product.Description, pq.Array(&product.Images), &product.Price, &product.StockQuantity, &product.Featured, &product.OnSale, &product.SalePrice, &product.LongDescription); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read product"})
			return
		}
		products = append(products, product)
	}
	if products == nil {
		products = []Product{}
	}
	c.JSON(http.StatusOK, products)
}

func AddProduct(c *gin.Context, db *sql.DB) {
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
	query := `INSERT INTO products ("name", "description", "images", "price", "stock_quantity", "featured", "on_sale", "sale_price", "long_description")
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	_, err = db.Exec(query, product.Name, product.Description, pq.Array(product.Images), product.Price, product.StockQuantity, product.Featured, product.OnSale, product.SalePrice, product.LongDescription)
	if err != nil {
		log.Printf("error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Added Product"})
}

func DeleteProduct(c *gin.Context, db *sql.DB) {
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

func EditProduct(c *gin.Context, db *sql.DB) {
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
		images = $3,
		price = $4,
		stock_quantity = $5,
		featured = $6,
		on_sale = $7,
		sale_price = $8,
		long_description = $9
	WHERE id = $10
	`
	result, err := db.Exec(query, product.Name, product.Description, pq.Array(product.Images), product.Price, product.StockQuantity, product.Featured, product.OnSale, product.SalePrice, product.LongDescription, productId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update product"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "product updated successfully",
		"result":  result,
	})
}

func GetProduct(c *gin.Context, db *sql.DB) {
	id := c.Param("id")
	var product Product
	query := `SELECT id, name, description, images, price, stock_quantity, featured, on_sale, sale_price, COALESCE(long_description, '') FROM "products" WHERE id = $1`
	err := db.QueryRow(query, id).Scan(&product.ID, &product.Name, &product.Description, pq.Array(&product.Images), &product.Price, &product.StockQuantity, &product.Featured, &product.OnSale, &product.SalePrice, &product.LongDescription)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	c.JSON(http.StatusOK, product)
}

// Asset Handler Structs
type Asset struct {
	Name    string    `json:"name"`
	URL     string    `json:"url"`
	Size    int64     `json:"size"`
	ModTime time.Time `json:"mod_time"`
}

// ListAssets returns all files in the assets directory
func ListAssets(c *gin.Context) {
	// Verify admin
	admin, _ := c.Get("admin")
	if admin == false {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	assetsDir := "./client/dist/assets"
	entries, err := os.ReadDir(assetsDir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read assets directory"})
		return
	}

	var assets []Asset
	for _, entry := range entries {
		if !entry.IsDir() {
			// Filter out non-image files
			ext := strings.ToLower(filepath.Ext(entry.Name()))
			if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".svg" && ext != ".webp" && ext != ".gif" {
				continue
			}

			info, err := entry.Info()
			if err != nil {
				continue
			}
			assets = append(assets, Asset{
				Name:    entry.Name(),
				URL:     "/assets/" + entry.Name(),
				Size:    info.Size(),
				ModTime: info.ModTime(),
			})
		}
	}

	// Sort by newest first
	sort.Slice(assets, func(i, j int) bool {
		return assets[i].ModTime.After(assets[j].ModTime)
	})

	c.JSON(http.StatusOK, assets)
}

// UploadAsset handles file uploads to the assets directory
func UploadAsset(c *gin.Context) {
	// Verify admin
	admin, _ := c.Get("admin")
	if admin == false {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get file from request
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	// Validate file type (basic check by extension)
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".svg" && ext != ".webp" && ext != ".gif" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Allowed: jpg, jpeg, png, svg, webp, gif"})
		return
	}

	// Sanitize filename (basic)
	filename := filepath.Base(header.Filename)
	filename = strings.ReplaceAll(filename, " ", "_")

	targetPath := filepath.Join("./client/dist/assets", filename)

	// Save file
	dst, err := os.Create(targetPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create file on server"})
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file content"})
		return
	}

	// Helper: Also try to save to source directory if it exists, for persistence in dev environment
	// This is "best effort" and won't fail the request if it fails
	sourcePath := filepath.Join("./client/public/assets", filename)
	if _, err := os.Stat("./client/public/assets"); err == nil {
		// Re-open source file to copy again
		file.Seek(0, 0)
		if srcDst, err := os.Create(sourcePath); err == nil {
			io.Copy(srcDst, file)
			srcDst.Close()
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "File uploaded successfully",
		"url":     "/assets/" + filename,
		"name":    filename,
	})
}

// DeleteAsset removes a file from the assets directory
func DeleteAsset(c *gin.Context) {
	// Verify admin
	admin, _ := c.Get("admin")
	if admin == false {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	filename := c.Param("filename")

	// Basic path traversal protection
	if strings.Contains(filename, "..") || strings.Contains(filename, "/") || strings.Contains(filename, "\\") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid filename"})
		return
	}

	targetPath := filepath.Join("./client/dist/assets", filename)

	if err := os.Remove(targetPath); err != nil {
		if os.IsNotExist(err) {
			c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete file"})
		return
	}

	// Also try to delete from source if exists
	sourcePath := filepath.Join("./client/public/assets", filename)
	os.Remove(sourcePath) // Ignore errors

	c.JSON(http.StatusOK, gin.H{"message": "File deleted successfully"})
}
