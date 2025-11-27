import React, { useState, useEffect, useMemo } from 'react';
import { Select, Typography, Space, Tag, Spin, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { productService, ProductSummary } from '../../services/productService';
import useAuth from '../../contexts/AuthContext';

const { Option } = Select;
const { Text } = Typography;

// Use ProductSummary from service instead of custom interface
type Product = ProductSummary;

interface ProductSelectorProps {
  value?: string;
  onChange?: (value: string, product?: Product) => void;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  showSearch?: boolean;
  style?: React.CSSProperties;
  size?: 'small' | 'middle' | 'large';
  mode?: 'single' | 'multiple';
  filterByStock?: boolean; // Only show products with stock
  filterByActive?: boolean; // Only show active products
  showProductDetails?: boolean; // Show additional product info
  showStockInfo?: boolean; // Show stock information
  productTypes?: string[]; // Filter by product types
  className?: string;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  value,
  onChange,
  placeholder = "Select a product",
  allowClear = true,
  disabled = false,
  showSearch = true,
  style,
  size = 'middle',
  mode = 'single',
  filterByStock = false,
  filterByActive = true,
  showProductDetails = true,
  showStockInfo = true,
  productTypes,
  className,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { currentCompany } = useAuth();

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!currentCompany?.id) return;

      setLoading(true);
      try {
        const response = await productService.getProducts({
          isActive: filterByActive,
          search: searchValue,
        });

        setProducts(response.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentCompany?.id, filterByActive, productTypes, searchValue]);

  // Filter products based on criteria
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (filterByStock && product.stockQuantity <= 0) {
        return false;
      }
      return true;
    });
  }, [products, filterByStock]);

  // Handle selection change
  const handleChange = (selectedValue: string | string[]) => {
    if (mode === 'single') {
      const selectedProduct = products.find(p => p.id === selectedValue);
      onChange?.(selectedValue as string, selectedProduct);
    } else {
      onChange?.(selectedValue as string);
    }
  };

  // Custom filter function for search
  const filterOption = (input: string, option: any): boolean => {
    const product = products.find(p => p.id === option.value);
    if (!product) return false;

    const searchText = input.toLowerCase();
    return Boolean(
      product.name.toLowerCase().includes(searchText) ||
      product.productCode.toLowerCase().includes(searchText) ||
      product.sku.toLowerCase().includes(searchText) ||
      (product.material && product.material.toLowerCase().includes(searchText)) ||
      (product.color && product.color.toLowerCase().includes(searchText))
    );
  };

  // Get stock status color
  const getStockStatusColor = (product: Product) => {
    if (product.stockQuantity <= 0) return 'error';
    if (product.reorderLevel && product.stockQuantity <= product.reorderLevel) return 'warning';
    return 'success';
  };

  // Get stock status text
  const getStockStatusText = (product: Product) => {
    if (product.stockQuantity <= 0) return 'Out of Stock';
    if (product.reorderLevel && product.stockQuantity <= product.reorderLevel) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      allowClear={allowClear}
      disabled={disabled}
      showSearch={showSearch}
      loading={loading}
      style={style}
      size={size}
      mode={mode as any}
      className={className}
      filterOption={filterOption}
      notFoundContent={loading ? <Spin size="small" /> : 'No products found'}
      optionLabelProp="label"
      dropdownRender={(menu) => (
        <div>
          {showSearch && (
            <div style={{ padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
              <Input
                placeholder="Search products..."
                prefix={<SearchOutlined />}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                size="small"
              />
            </div>
          )}
          {menu}
        </div>
      )}
    >
      {filteredProducts.map((product) => (
        <Option 
          key={product.id} 
          value={product.id}
          label={`${product.name} • ${product.productCode}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text strong style={{ fontSize: '14px' }}>
                  {product.name}
                </Text>
                
                {showStockInfo && (
                  <Tag 
                    color={getStockStatusColor(product)}
                    style={{ fontSize: '11px' }}
                  >
                    {getStockStatusText(product)}
                  </Tag>
                )}
              </div>
              
              {showProductDetails && (
                <div style={{ marginTop: '2px' }}>
                  <Space size={4} wrap>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {product.productCode}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      •
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {product.sku}
                    </Text>
                    {product.material && (
                      <>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          •
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {product.material}
                        </Text>
                      </>
                    )}
                    {product.color && (
                      <>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          •
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {product.color}
                        </Text>
                      </>
                    )}
                  </Space>
                </div>
              )}
            </div>
            
            {showStockInfo && (
              <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
                  Stock: {product.stockQuantity} {product.unitOfMeasure}
                </Text>
                <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
                  Price: ₹{product.sellingPrice}
                </Text>
              </div>
            )}
          </div>
        </Option>
      ))}
    </Select>
  );
};

export default ProductSelector;
