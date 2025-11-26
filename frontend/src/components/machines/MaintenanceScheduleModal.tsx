import React, { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, message, Row, Col } from 'antd';
import { GradientButton } from '../ui';
import { machineService, Machine, MaintenanceType } from '../../services/machineService';
import './MaintenanceScheduleModal.scss';

const { Option } = Select;
const { TextArea } = Input;

interface MaintenanceScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onScheduled: () => void;
  machine: Machine;
}

interface MaintenanceFormValues {
  maintenanceType: MaintenanceType;
  title: string;
  description?: string;
  frequencyDays?: number;
  nextDue: any;
  estimatedHours?: number;
  assignedTechnician?: string;
  checklist?: string;
  partsRequired?: string;
}

export const MaintenanceScheduleModal: React.FC<MaintenanceScheduleModalProps> = ({
  visible,
  onClose,
  onScheduled,
  machine,
}) => {
  const [form] = Form.useForm<MaintenanceFormValues>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      console.log('=== MAINTENANCE SCHEDULE - FRONTEND DATA ===');
      console.log('Form values (camelCase):', values);

      const payload = {
        machineId: machine.id,
        maintenanceType: values.maintenanceType,
        title: values.title,
        description: values.description,
        frequencyDays: values.frequencyDays,
        nextDue: values.nextDue?.format('YYYY-MM-DD'),
        estimatedHours: values.estimatedHours,
        assignedTechnician: values.assignedTechnician,
        checklist: values.checklist ? JSON.parse(`[${values.checklist}]`) : undefined,
        partsRequired: values.partsRequired ? JSON.parse(`[${values.partsRequired}]`) : undefined,
      };

      console.log('Payload being sent to backend (camelCase):', payload);

      const response = await machineService.createMaintenanceSchedule(payload);
      console.log('Backend response:', response);
      message.success('Maintenance schedule created successfully');
      
      onScheduled();
      handleCancel();
    } catch (error: any) {
      console.error('Error creating maintenance schedule:', error);
      if (error.errorFields) {
        message.error('Please fill in all required fields');
      } else {
        message.error(error.message || 'Failed to create maintenance schedule');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={`Schedule Maintenance - ${machine.name}`}
      open={visible}
      onCancel={handleCancel}
      width={720}
      footer={[
        <button key='cancel' onClick={handleCancel} disabled={submitting} className='cancel-btn'>
          Cancel
        </button>,
        <GradientButton key='submit' onClick={handleSubmit} loading={submitting}>
          Schedule Maintenance
        </GradientButton>,
      ]}
    >
      <Form form={form} layout='vertical' className='maintenance-schedule-form'>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name='maintenanceType'
              label='Maintenance Type'
              rules={[{ required: true, message: 'Please select maintenance type' }]}
            >
              <Select placeholder='Select maintenance type'>
                <Option value='PREVENTIVE'>Preventive</Option>
                <Option value='CORRECTIVE'>Corrective</Option>
                <Option value='PREDICTIVE'>Predictive</Option>
                <Option value='ROUTINE'>Routine</Option>
                <Option value='EMERGENCY'>Emergency</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='nextDue'
              label='Next Due Date'
              rules={[{ required: true, message: 'Please select next due date' }]}
            >
              <DatePicker className='full-width' placeholder='Select due date' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              name='title'
              label='Maintenance Title'
              rules={[{ required: true, message: 'Please enter maintenance title' }]}
            >
              <Input placeholder='e.g., Monthly Lubrication Check' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={24}>
            <Form.Item name='description' label='Description'>
              <TextArea rows={3} placeholder='Describe the maintenance tasks...' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name='frequencyDays' label='Frequency (Days)'>
              <InputNumber
                className='full-width'
                min={1}
                placeholder='e.g., 30 for monthly'
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='estimatedHours' label='Estimated Hours'>
              <InputNumber
                className='full-width'
                min={0.5}
                step={0.5}
                placeholder='e.g., 2.5'
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={24}>
            <Form.Item name='assignedTechnician' label='Assigned Technician'>
              <Input placeholder='Technician name or ID' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={24}>
            <Form.Item name='checklist' label='Checklist (comma-separated)'>
              <TextArea
                rows={2}
                placeholder='"Check oil level", "Inspect belts", "Clean filters"'
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={24}>
            <Form.Item name='partsRequired' label='Parts Required (comma-separated)'>
              <TextArea
                rows={2}
                placeholder='"Oil filter", "Drive belt", "Grease"'
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
