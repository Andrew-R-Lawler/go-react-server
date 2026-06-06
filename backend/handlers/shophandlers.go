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

type ProductSKU struct {
	ID            int    `json:"id"`
	ProductID     int    `json:"product_id"`
	SKU           string `json:"sku"`
	VariantName   string `json:"variant_name"`
	StockQuantity int    `json:"stock_quantity"`
}

type Product struct {
	ID              int          `json:"id"`
	Name            string       `json:"name"`
	Description     string       `json:"description"`
	Images          []string     `json:"images"`
	Price           float32      `json:"price"`
	StockQuantity   int          `json:"stock_quantity"`
	Featured        bool         `json:"featured"`
	OnSale          bool         `json:"on_sale"`
	SalePrice       float32      `json:"sale_price"`
	LongDescription string       `json:"long_description"`
	Ingredients     string       `json:"ingredients"`
	Skus            []ProductSKU `json:"skus"`
}

func GetProducts(c *gin.Context, db *sql.DB) {
	rows, err := db.Query(`SELECT id, name, description, images, price, stock_quantity, featured, on_sale, sale_price, COALESCE(long_description, ''), COALESCE(ingredients, '') FROM "products" ORDER BY id;`)
	if err != nil {
		log.Printf("error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}
	defer rows.Close()
	var products []Product
	for rows.Next() {
		var product Product
		if err := rows.Scan(&product.ID, &product.Name, &product.Description, pq.Array(&product.Images), &product.Price, &product.StockQuantity, &product.Featured, &product.OnSale, &product.SalePrice, &product.LongDescription, &product.Ingredients); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read product"})
			return
		}
		// Fetch SKUs
		skuRows, err := db.Query(`SELECT id, product_id, sku, variant_name, stock_quantity FROM product_skus WHERE product_id = $1`, product.ID)
		if err == nil {
			defer skuRows.Close()
			for skuRows.Next() {
				var sku ProductSKU
				if err := skuRows.Scan(&sku.ID, &sku.ProductID, &sku.SKU, &sku.VariantName, &sku.StockQuantity); err == nil {
					product.Skus = append(product.Skus, sku)
				}
			}
		}
		if product.Skus == nil {
			product.Skus = []ProductSKU{}
		}
		products = append(products, product)
	}
	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while iterating products"})
		return
	}
	if products == nil {
		products = []Product{}
	}
	c.JSON(http.StatusOK, products)
}

func GetFeaturedProducts(c *gin.Context, db *sql.DB) {
	rows, err := db.Query(`SELECT id, name, description, images, price, stock_quantity, featured, on_sale, sale_price, COALESCE(long_description, ''), COALESCE(ingredients, '') FROM "products" WHERE featured = TRUE ORDER BY id;`)
	if err != nil {
		log.Printf("error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}
	defer rows.Close()
	var products []Product
	for rows.Next() {
		var product Product
		if err := rows.Scan(&product.ID, &product.Name, &product.Description, pq.Array(&product.Images), &product.Price, &product.StockQuantity, &product.Featured, &product.OnSale, &product.SalePrice, &product.LongDescription, &product.Ingredients); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read product"})
			return
		}
		// Fetch SKUs
		skuRows, err := db.Query(`SELECT id, product_id, sku, variant_name, stock_quantity FROM product_skus WHERE product_id = $1`, product.ID)
		if err == nil {
			defer skuRows.Close()
			for skuRows.Next() {
				var sku ProductSKU
				if err := skuRows.Scan(&sku.ID, &sku.ProductID, &sku.SKU, &sku.VariantName, &sku.StockQuantity); err == nil {
					product.Skus = append(product.Skus, sku)
				}
			}
		}
		if product.Skus == nil {
			product.Skus = []ProductSKU{}
		}
		products = append(products, product)
	}
	if products == nil {
		products = []Product{}
	}
	c.JSON(http.StatusOK, products)
}

func GetNewArrivals(c *gin.Context, db *sql.DB) {
	rows, err := db.Query(`SELECT id, name, description, images, price, stock_quantity, featured, on_sale, sale_price, COALESCE(long_description, ''), COALESCE(ingredients, '') FROM "products" ORDER BY id DESC LIMIT 6;`)
	if err != nil {
		log.Printf("error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}
	defer rows.Close()
	var products []Product
	for rows.Next() {
		var product Product
		if err := rows.Scan(&product.ID, &product.Name, &product.Description, pq.Array(&product.Images), &product.Price, &product.StockQuantity, &product.Featured, &product.OnSale, &product.SalePrice, &product.LongDescription, &product.Ingredients); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read product"})
			return
		}
		// Fetch SKUs
		skuRows, err := db.Query(`SELECT id, product_id, sku, variant_name, stock_quantity FROM product_skus WHERE product_id = $1`, product.ID)
		if err == nil {
			defer skuRows.Close()
			for skuRows.Next() {
				var sku ProductSKU
				if err := skuRows.Scan(&sku.ID, &sku.ProductID, &sku.SKU, &sku.VariantName, &sku.StockQuantity); err == nil {
					product.Skus = append(product.Skus, sku)
				}
			}
		}
		if product.Skus == nil {
			product.Skus = []ProductSKU{}
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
	query := `INSERT INTO products ("name", "description", "images", "price", "stock_quantity", "featured", "on_sale", "sale_price", "long_description", "ingredients")
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`
	var productID int
	err = db.QueryRow(query, product.Name, product.Description, pq.Array(product.Images), product.Price, product.StockQuantity, product.Featured, product.OnSale, product.SalePrice, product.LongDescription, product.Ingredients).Scan(&productID)
	if err != nil {
		log.Printf("error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Insert SKUs
	if len(product.Skus) > 0 {
		skuQuery := `INSERT INTO product_skus (product_id, sku, variant_name, stock_quantity) VALUES ($1, $2, $3, $4)`
		for _, sku := range product.Skus {
			_, err := db.Exec(skuQuery, productID, sku.SKU, sku.VariantName, sku.StockQuantity)
			if err != nil {
				log.Printf("error inserting sku: %v", err)
				// Continue or fail? defaulting to log
			}
		}
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Added Product", "id": productID})
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
		long_description = $9,
		ingredients = $10
	WHERE id = $11
	`
	result, err := db.Exec(query, product.Name, product.Description, pq.Array(product.Images), product.Price, product.StockQuantity, product.Featured, product.OnSale, product.SalePrice, product.LongDescription, product.Ingredients, productId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update product"})
		return
	}

	// Update SKUs: Delete existing and re-insert
	_, err = db.Exec(`DELETE FROM product_skus WHERE product_id = $1`, productId)
	if err != nil {
		log.Printf("error deleting old skus: %v", err)
	}

	if len(product.Skus) > 0 {
		skuQuery := `INSERT INTO product_skus (product_id, sku, variant_name, stock_quantity) VALUES ($1, $2, $3, $4)`
		for _, sku := range product.Skus {
			_, err := db.Exec(skuQuery, productId, sku.SKU, sku.VariantName, sku.StockQuantity)
			if err != nil {
				log.Printf("error inserting update sku: %v", err)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "product updated successfully",
		"result":  result,
	})
}

func GetProduct(c *gin.Context, db *sql.DB) {
	id := c.Param("id")
	var product Product
	query := `SELECT id, name, description, images, price, stock_quantity, featured, on_sale, sale_price, COALESCE(long_description, ''), COALESCE(ingredients, '') FROM "products" WHERE id = $1`
	err := db.QueryRow(query, id).Scan(&product.ID, &product.Name, &product.Description, pq.Array(&product.Images), &product.Price, &product.StockQuantity, &product.Featured, &product.OnSale, &product.SalePrice, &product.LongDescription, &product.Ingredients)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	// Fetch SKUs
	skuRows, err := db.Query(`SELECT id, product_id, sku, variant_name, stock_quantity FROM product_skus WHERE product_id = $1`, product.ID)
	if err == nil {
		defer skuRows.Close()
		for skuRows.Next() {
			var sku ProductSKU
			if err := skuRows.Scan(&sku.ID, &sku.ProductID, &sku.SKU, &sku.VariantName, &sku.StockQuantity); err == nil {
				product.Skus = append(product.Skus, sku)
			}
		}
	}
	if product.Skus == nil {
		product.Skus = []ProductSKU{}
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

func getAssetsDir() string {
	dir := os.Getenv("ASSETS_DIR")
	if dir == "" {
		dir = "./uploads"
	}
	os.MkdirAll(dir, 0755)
	return dir
}

// ListAssets returns all files in the assets directory
func ListAssets(c *gin.Context) {
	// Verify admin
	admin, _ := c.Get("admin")
	if admin == false {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	assetsDir := getAssetsDir()
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
				URL:     "/uploads/" + entry.Name(),
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

	assetsDir := getAssetsDir()
	targetPath := filepath.Join(assetsDir, filename)

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

	c.JSON(http.StatusCreated, gin.H{
		"message": "File uploaded successfully",
		"url":     "/uploads/" + filename,
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

	assetsDir := getAssetsDir()
	targetPath := filepath.Join(assetsDir, filename)

	if err := os.Remove(targetPath); err != nil {
		if os.IsNotExist(err) {
			c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File deleted successfully"})
}
