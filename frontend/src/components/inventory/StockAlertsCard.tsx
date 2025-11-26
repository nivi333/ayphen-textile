import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Button,
  Badge,
  Avatar,
  Typography,
  Space,
  Tag,
  Tooltip,
  message,
  Empty,
  Spin
} from 'antd';
import {
  AlertOutlined,
  WarningOutlined,
  CheckOutlined,
  AppstoreOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { inventoryService, StockAlert } from '../../services/inventoryService';
import useAuth from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

interface StockAlertsCardProps {
  maxItems?: number;
  showHeader?: boolean;
  onAlertClick?: (alert: StockAlert) => void;
}

const StockAlertsCard: React.FC<StockAlertsCardProps> = ({
  maxItems = 5,
  showHeader = true,
  onAlertClick
}) => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentCompany } = useAuth();

  // Fetch stock alerts
  const fetchAlerts = async () => {
    if (!currentCompany?.id) return;

    setLoading(true);
    try {
      const response = await inventoryService.getStockAlerts('ACTIVE');
      if (response.success) {
        setAlerts(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [currentCompany?.id]);

  // Handle acknowledge alert
  const handleAcknowledgeAlert = async (alert: StockAlert, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      const response = await inventoryService.acknowledgeStockAlert(alert.alertId);
      if (response.success) {
        message.success('Alert acknowledged successfully');
        // Remove the acknowledged alert from the list
        setAlerts(prev => prev.filter(a => a.id !== alert.id));
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      message.error('Failed to acknowledge alert');
    }
  };

  // Get alert severity
  const getAlertSeverity = (alert: StockAlert) => {
    if (alert.currentStock <= 0) {
      return { color: 'error', icon: <AlertOutlined />, text: 'Critical' };
    }
    return { color: 'warning', icon: <WarningOutlined />, text: 'Warning' };
  };

  // Get alert description
  const getAlertDescription = (alert: StockAlert) => {
    if (alert.alertType === 'LOW_STOCK') {
      if (alert.currentStock <= 0) {
        return `Out of stock at ${alert.location.name}`;
      }
      return `Low stock: ${alert.currentStock} remaining (threshold: ${alert.thresholdValue})`;
    }
    return alert.message;
  };

  // Render alert item
  const renderAlertItem = (alert: StockAlert) => {
    const severity = getAlertSeverity(alert);
    
    return (
      <List.Item
        key={alert.id}
        style={{ 
          cursor: onAlertClick ? 'pointer' : 'default',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '8px',
          backgroundColor: '#fafafa',
          border: '1px solid #f0f0f0'
        }}
        onClick={() => onAlertClick?.(alert)}
        actions={[
          <Tooltip title="Acknowledge Alert" key="acknowledge">
            <Button
              type="text"
              size="small"
              icon={<CheckOutlined />}
              onClick={(e) => handleAcknowledgeAlert(alert, e)}
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
        ]}
      >
        <List.Item.Meta
          avatar={
            <Badge dot color={severity.color === 'error' ? '#ff4d4f' : '#faad14'}>
              <Avatar
                size={40}
                src={alert.product.imageUrl}
                icon={<AppstoreOutlined />}
                style={{ 
                  backgroundColor: alert.product.imageUrl ? undefined : '#f0f0f0',
                  color: '#666'
                }}
              />
            </Badge>
          }
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text strong style={{ fontSize: '14px' }}>
                {alert.product.name}
              </Text>
              <Tag color={severity.color}>
                {severity.icon} {severity.text}
              </Tag>
            </div>
          }
          description={
            <div>
              <div style={{ marginBottom: '4px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {getAlertDescription(alert)}
                </Text>
              </div>
              <Space size={4} style={{ fontSize: '11px', color: '#999' }}>
                <Text type="secondary">{alert.product.productCode}</Text>
                <Text type="secondary">•</Text>
                <Text type="secondary">{alert.location.name}</Text>
                <Text type="secondary">•</Text>
                <Text type="secondary">{dayjs(alert.createdAt).fromNow()}</Text>
              </Space>
            </div>
          }
        />
      </List.Item>
    );
  };

  const displayAlerts = alerts.slice(0, maxItems);
  const hasMoreAlerts = alerts.length > maxItems;

  return (
    <Card
      title={showHeader ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertOutlined style={{ color: '#faad14' }} />
            <Title level={5} style={{ margin: 0 }}>
              Stock Alerts
            </Title>
            {alerts.length > 0 && (
              <Badge count={alerts.length} style={{ backgroundColor: '#faad14' }} />
            )}
          </div>
          <Tooltip title="Refresh">
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              onClick={fetchAlerts}
              loading={loading}
            />
          </Tooltip>
        </div>
      ) : undefined}
      bodyStyle={{ padding: alerts.length > 0 ? '16px' : '24px' }}
      style={{ height: '100%' }}
    >
      <Spin spinning={loading}>
        {alerts.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">No active stock alerts</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  All inventory levels are within normal ranges
                </Text>
              </div>
            }
          />
        ) : (
          <>
            <List
              dataSource={displayAlerts}
              renderItem={renderAlertItem}
              split={false}
              style={{ marginBottom: hasMoreAlerts ? '12px' : 0 }}
            />
            
            {hasMoreAlerts && (
              <div style={{ textAlign: 'center', paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  +{alerts.length - maxItems} more alerts
                </Text>
              </div>
            )}
          </>
        )}
      </Spin>
    </Card>
  );
};

export default StockAlertsCard;
