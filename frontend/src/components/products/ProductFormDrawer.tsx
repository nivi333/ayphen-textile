import React, { useEffect, useState } from 'react';
import { Drawer, Form, Input, InputNumber, Select, Button, message, Row, Col, Switch, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { GradientButton } from '../ui';
import { productService, CreateProductRequest, ProductDetail } from '../../services/productService';
import './ProductFormDrawer.scss';

const { Option } = Select;
const { TextArea } = Input;

// UOM (Unit of Measure) options for textile manufacturing
const UOM_OPTIONS = [
  { value: 'PCS', label: 'PCS - Pieces' },
  { value: 'MTR', label: 'MTR - Meters' },
  { value: 'YDS', label: 'YDS - Yards' },
  { value: 'KG', label: 'KG - Kilograms' },
  { value: 'LBS', label: 'LBS - Pounds' },
  { value: 'ROLL', label: 'ROLL - Rolls' },
  { value: 'BOX', label: 'BOX - Boxes' },
  { value: 'CTN', label: 'CTN - Cartons' },
  { value: 'DOZ', label: 'DOZ - Dozens' },
  { value: 'SET', label: 'SET - Sets' },
  { value: 'BALE', label: 'BALE - Bales' },
  { value: 'CONE', label: 'CONE - Cones' },
  { value: 'SPOOL', label: 'SPOOL - Spools' },
];

interface ProductFormDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  mode?: 'create' | 'edit';
  editingProductId?: string | null;
  categories: any[];
}

interface ProductFormValues {
  productCode?: string;
  name: string;
  description?: string;
  material?: string;
  color?: string;
  size?: string;
  weight?: number;
  unitOfMeasure: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity?: number;
  reorderLevel?: number;
  barcode?: string;
  imageUrl?: string;
  isActive: boolean;
}

export const ProductFormDrawer: React.FC<ProductFormDrawerProps> = ({
  visible,
  onClose,
  onSaved,
  mode = 'create',
  editingProductId,
}) => {
  const [form] = Form.useForm<ProductFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const isEditing = mode === 'edit' && !!editingProductId;

  useEffect(() => {
    if (!visible) return;

    const loadData = async () => {
      try {
        if (isEditing && editingProductId) {
          const product = await productService.getProductById(editingProductId);
          populateForm(product);
        } else {
          form.resetFields();
          form.setFieldsValue({
            unitOfMeasure: 'PCS',
            isActive: true,
            stockQuantity: 0,
          });
          setImageUrl('');
          setFileList([]);
        }
      } catch (error: any) {
        console.error('Error loading product:', error);
        message.error(error.message || 'Failed to load product');
      }
    };

    loadData();
  }, [visible, isEditing, editingProductId]);

  const populateForm = (product: ProductDetail) => {
    form.setFieldsValue({
      productCode: product.productCode,
      name: product.name,
      description: product.description,
      material: product.material,
      color: product.color,
      size: product.size,
      weight: product.weight,
      unitOfMeasure: product.unitOfMeasure,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stockQuantity: product.stockQuantity,
      reorderLevel: product.reorderLevel,
      barcode: product.barcode,
      isActive: product.isActive,
    });
    if (product.imageUrl) {
      setImageUrl(product.imageUrl);
      setFileList([{
        uid: '-1',
        name: 'image.png',
        status: 'done',
        url: product.imageUrl,
      }]);
    }
  };

  const handleImageUpload = (info: any) => {
    setFileList(info.fileList);
    if (info.file.status === 'done') {
      setImageUrl(info.file.response?.url || '');
      message.success('Image uploaded successfully');
    } else if (info.file.status === 'error') {
      message.error('Image upload failed');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload: CreateProductRequest = {
        productCode: values.productCode,
        name: values.name,
        description: values.description,
        material: values.material,
        color: values.color,
        size: values.size,
        weight: values.weight,
        unitOfMeasure: values.unitOfMeasure,
        costPrice: values.costPrice,
        sellingPrice: values.sellingPrice,
        stockQuantity: values.stockQuantity,
        reorderLevel: values.reorderLevel,
        barcode: values.barcode,
        imageUrl: imageUrl || undefined,
        isActive: values.isActive,
      };

      if (isEditing && editingProductId) {
        await productService.updateProduct(editingProductId, payload);
        message.success('Product updated successfully');
      } else {
        await productService.createProduct(payload);
        message.success('Product created successfully');
      }

      onSaved();
      onClose();
    } catch (error: any) {
      console.error('Error saving product:', error);
      if (error.errorFields) {
        message.error('Please fill in all required fields');
      } else {
        message.error(error.message || 'Failed to save product');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImageUrl('');
    setFileList([]);
    onClose();
  };

  return (
    <Drawer
      title={
        <div className='drawer-header-with-switch'>
          <span>{isEditing ? 'Edit Product' : 'Create Product'}</span>
          <div className='header-switch'>
            <span className='switch-label'>Active</span>
            <Form.Item name='isActive' valuePropName='checked' noStyle>
              <Switch />
            </Form.Item>
          </div>
        </div>
      }
      width={720}
      open={visible}
      onClose={handleCancel}
      footer={
        <div className='drawer-footer'>
          <Button onClick={handleCancel} disabled={submitting} size='middle'>
            Cancel
          </Button>
          <GradientButton onClick={handleSubmit} loading={submitting} size='middle'>
            {isEditing ? 'Update Product' : 'Create Product'}
          </GradientButton>
        </div>
      }
    >
      <Form form={form} layout='vertical' className='product-form'>
        {/* Section 1: Basic Information with Image */}
        <div className='form-section'>
          <h3 className='section-title'>Basic Information</h3>
          
          {/* Image Upload */}
          <div className='image-upload-section'>
            <div className='image-preview'>
              {imageUrl ? (
                <img src={imageUrl} alt='Product' className='uploaded-image' />
              ) : (
                <div className='image-placeholder'>
                  <UploadOutlined style={{ fontSize: 32, color: '#8c8c8c' }} />
                  <div className='upload-text'>Upload Product Image (JPG/PNG, max 2MB)</div>
                  <div className='upload-hint'>Drag & drop or click to upload</div>
                </div>
              )}
            </div>
            <Upload
              listType='picture'
              fileList={fileList}
              onChange={handleImageUpload}
              beforeUpload={() => false}
              maxCount={1}
              accept='image/*'
            >
              <Button icon={<UploadOutlined />} size='small'>
                {imageUrl ? 'Change Image' : 'Upload Image'}
              </Button>
            </Upload>
          </div>

          <Row gutter={12}>
            <Col span={24}>
              <Form.Item
                name='name'
                label='Product Name'
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input placeholder='Enter product name' />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name='productCode' label='Product Code'>
                <Input placeholder='Auto generated' disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='barcode' label='Barcode/SKU'>
                <Input placeholder='Enter barcode or SKU' />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={24}>
              <Form.Item name='description' label='Description'>
                <TextArea rows={3} placeholder='Enter product description' />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Section 2: Pricing */}
        <div className='form-section'>
          <h3 className='section-title'>Pricing</h3>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name='costPrice'
                label='Cost Price'
                rules={[{ required: true, message: 'Please enter cost price' }]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder='0.00'
                  prefix='₹'
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='sellingPrice'
                label='Selling Price'
                rules={[{ required: true, message: 'Please enter selling price' }]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder='0.00'
                  prefix='₹'
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Section 3: Inventory */}
        <div className='form-section'>
          <h3 className='section-title'>Inventory</h3>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name='stockQuantity' label='Stock Quantity'>
                <InputNumber
                  min={0}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder='0'
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='unitOfMeasure' label='Unit of Measure'>
                <Select placeholder='Select UOM' showSearch>
                  {UOM_OPTIONS.map(uom => (
                    <Option key={uom.value} value={uom.value}>
                      {uom.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name='reorderLevel' label='Reorder Level'>
                <InputNumber
                  min={0}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder='Minimum stock level'
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Section 4: Specifications */}
        <div className='form-section'>
          <h3 className='section-title'>Specifications</h3>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name='material' label='Material'>
                <Input placeholder='e.g., Cotton, Polyester' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='color' label='Color'>
                <Input placeholder='e.g., White, Blue' />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name='size' label='Size'>
                <Input placeholder='e.g., 60 inches width' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='weight' label='Weight (kg)'>
                <InputNumber
                  min={0}
                  precision={3}
                  style={{ width: '100%' }}
                  placeholder='0.000'
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Form>
    </Drawer>
  );
};
