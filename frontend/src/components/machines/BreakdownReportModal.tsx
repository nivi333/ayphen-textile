import React, { useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Upload, message, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { GradientButton } from '../ui';
import { machineService, Machine, BreakdownSeverity, BreakdownPriority } from '../../services/machineService';
import './BreakdownReportModal.scss';

const { Option } = Select;
const { TextArea } = Input;

interface BreakdownReportModalProps {
  visible: boolean;
  onClose: () => void;
  onReported: () => void;
  machine: Machine;
}

interface BreakdownFormValues {
  severity: BreakdownSeverity;
  priority: BreakdownPriority;
  title: string;
  description: string;
  assignedTechnician?: string;
  estimatedDowntimeHours?: number;
  estimatedProductionLoss?: number;
}

export const BreakdownReportModal: React.FC<BreakdownReportModalProps> = ({
  visible,
  onClose,
  onReported,
  machine,
}) => {
  const [form] = Form.useForm<BreakdownFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrls(prev => [...prev, e.target?.result as string]);
    };
    reader.readAsDataURL(file);
    return false; // Prevent automatic upload
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      console.log('=== BREAKDOWN REPORT - FRONTEND DATA ===');
      console.log('Form values (camelCase):', values);

      const payload = {
        machineId: machine.id,
        severity: values.severity,
        priority: values.priority,
        title: values.title,
        description: values.description,
        assignedTechnician: values.assignedTechnician,
        estimatedDowntimeHours: values.estimatedDowntimeHours,
        estimatedProductionLoss: values.estimatedProductionLoss,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      };

      console.log('Payload being sent to backend (camelCase):', payload);

      const response = await machineService.createBreakdownReport(payload);
      console.log('Backend response:', response);
      message.success('Breakdown report submitted successfully');
      
      onReported();
      handleCancel();
    } catch (error: any) {
      console.error('Error creating breakdown report:', error);
      if (error.errorFields) {
        message.error('Please fill in all required fields');
      } else {
        message.error(error.message || 'Failed to create breakdown report');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImageUrls([]);
    onClose();
  };

  return (
    <Modal
      title={`Report Breakdown - ${machine.name}`}
      open={visible}
      onCancel={handleCancel}
      width={720}
      footer={[
        <button key='cancel' onClick={handleCancel} disabled={submitting} className='cancel-btn'>
          Cancel
        </button>,
        <GradientButton key='submit' onClick={handleSubmit} loading={submitting}>
          Submit Report
        </GradientButton>,
      ]}
    >
      <Form form={form} layout='vertical' className='breakdown-report-form'>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name='severity'
              label='Severity'
              rules={[{ required: true, message: 'Please select severity' }]}
            >
              <Select placeholder='Select severity'>
                <Option value='CRITICAL'>Critical</Option>
                <Option value='HIGH'>High</Option>
                <Option value='MEDIUM'>Medium</Option>
                <Option value='LOW'>Low</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='priority'
              label='Priority'
              rules={[{ required: true, message: 'Please select priority' }]}
            >
              <Select placeholder='Select priority'>
                <Option value='URGENT'>Urgent</Option>
                <Option value='HIGH'>High</Option>
                <Option value='MEDIUM'>Medium</Option>
                <Option value='LOW'>Low</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              name='title'
              label='Issue Title'
              rules={[{ required: true, message: 'Please enter issue title' }]}
            >
              <Input placeholder='e.g., Motor not starting' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              name='description'
              label='Issue Description'
              rules={[{ required: true, message: 'Please describe the issue' }]}
            >
              <TextArea rows={4} placeholder='Describe the breakdown in detail...' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={24}>
            <Form.Item name='assignedTechnician' label='Assign Technician'>
              <Input placeholder='Technician name or ID' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name='estimatedDowntimeHours' label='Estimated Downtime (Hours)'>
              <InputNumber
                className='full-width'
                min={0.5}
                step={0.5}
                placeholder='e.g., 4'
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='estimatedProductionLoss' label='Estimated Production Loss (Units)'>
              <InputNumber
                className='full-width'
                min={0}
                placeholder='e.g., 500'
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={24}>
            <Form.Item label='Upload Images'>
              <Upload
                beforeUpload={handleImageUpload}
                multiple
                listType='picture'
                accept='image/*'
              >
                <button type='button' className='upload-btn'>
                  <UploadOutlined /> Upload Photos
                </button>
              </Upload>
              <div className='upload-hint'>Upload photos of the breakdown (optional)</div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
