import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

// Base Button component
export function Button(props: AntButtonProps) {
  const { size, children } = props;
  return (
    <AntButton {...props} size={size ?? 'middle'}>
      {children}
    </AntButton>
  );
}

// Add New Button with Plus icon
export function AddNewButton(props: AntButtonProps) {
  return (
    <Button
      {...props}
      icon={props.icon ?? <PlusOutlined />}
      type={props.type ?? 'primary'}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
}

// Delete Button with danger styling
export function DeleteButton(props: AntButtonProps) {
  return (
    <Button
      {...props}
      icon={props.icon ?? <DeleteOutlined />}
      type={props.type}
      disabled={props.disabled}
      onClick={props.onClick}
      danger
    >
      {props.children}
    </Button>
  );
}

// Edit Button
export function EditButton(props: AntButtonProps) {
  return (
    <Button
      {...props}
      icon={props.icon ?? <EditOutlined />}
      type={props.type}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
}

export default Button;
