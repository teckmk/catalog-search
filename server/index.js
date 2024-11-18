import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, 'catalog.json');
  },
});

const upload = multer({ storage: storage });

// Ensure uploads directory exists
await fs.mkdir(join(__dirname, 'uploads'), { recursive: true });

let catalogData = [];

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const fileContent = await fs.readFile(req.file.path, 'utf8');
    catalogData = JSON.parse(fileContent);
    res.json({ message: 'Catalog uploaded successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid JSON file' });
  }
});

app.get('/api/search', (req, res) => {
  const { query = '', page = 1, limit = 12 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const allProducts = catalogData.flatMap(item => 
    item.products.map(product => ({
      ...product,
      aisleNumber: item.aisleNumber
    }))
  );
  
  const filteredProducts = query
    ? allProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.categories.some(category =>
          category.toLowerCase().includes(query.toLowerCase())
        )
      )
    : allProducts;

  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / limitNum);
  
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limitNum);

  res.json({
    products: paginatedProducts,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalProducts,
      hasMore: pageNum < totalPages
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});