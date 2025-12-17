import { Input as AntInput, InputProps as AntInputProps } from 'antd';
import { TextAreaProps } from 'antd/lib/input';
import {
  forwardRef,
  useState,
  useEffect,
  ChangeEventHandler,
  KeyboardEventHandler,
  FocusEventHandler,
} from 'react';
import type { InputRef } from 'antd';

type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

// Enhanced Input with auto-trim functionality
export const Input = forwardRef<InputRef, AntInputProps>((props, ref) => {
  const { allowClear = false, value, onChange, onKeyDown, onBlur, ...restProps } = props;

  const [trimmedValue, setTrimmedValue] = useState<string | number | bigint | readonly string[]>();

  useEffect(() => {
    setTrimmedValue(value);
  }, [value]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = e => {
    setTrimmedValue(e.target.value);
    onChange?.(e);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = e => {
    if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
    }
    onKeyDown?.(e);
  };

  const handleBlur: ChangeEventHandler<HTMLInputElement> = e => {
    const trimmedValue = e.target.value.trim();
    const trimmedEvent = {
      ...e,
      target: {
        ...e.target,
        value: trimmedValue,
      },
    };
    setTrimmedValue(trimmedValue);
    onBlur?.(trimmedEvent as React.FocusEvent<HTMLInputElement>);
    onChange?.(trimmedEvent as InputChangeEvent);
  };

  const handleFocus: FocusEventHandler<HTMLInputElement> = e => {
    const preventScroll = (event: WheelEvent) => event.preventDefault();

    // Add the wheel event listener with passive: false on focus
    e.target.addEventListener('wheel', preventScroll, { passive: false });

    // Clean up the listener when the input loses focus
    e.target.addEventListener(
      'blur',
      () => {
        e.target.removeEventListener('wheel', preventScroll);
      },
      { once: true }
    );
  };

  return (
    <AntInput
      ref={ref}
      {...restProps}
      allowClear={allowClear ?? false}
      value={trimmedValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
    />
  );
});

Input.displayName = 'Input';

// Password Input
export const InputPassword = forwardRef<InputRef, AntInputProps>((props, ref) => {
  return <AntInput.Password ref={ref} {...props} />;
});

InputPassword.displayName = 'InputPassword';

// TextArea Input
export const InputTextArea = forwardRef<InputRef, TextAreaProps>((props, ref) => {
  return <AntInput.TextArea ref={ref as any} {...props} />;
});

InputTextArea.displayName = 'InputTextArea';

export default Input;
