import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './SearchInput.scss';

export const SearchInput = (props: any) => {
  return (
    <Input
      {...props}
      allowClear
      prefix={<SearchOutlined className='search-icon' />}
      className={`search-input ${props.className || ''}`}
      placeholder={props.placeholder || 'Search...'}
    />
  );
};

export default SearchInput;
