import { useState } from 'react';
import { Form, FormControlProps, InputGroup } from 'react-bootstrap';
import { IconType } from 'react-icons';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface InputProps extends FormControlProps {
  label?: string;
  startIcon?: IconType;
  endIcon?: IconType;
}

export const Input = ({
  label,
  startIcon: StartIcon,
  endIcon: EndIcon,
  type = 'text',
  className,
  ...props
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const renderEndIcon = () => {
    if (isPassword) {
      return (
        <InputGroup.Text
          onClick={toggleShowPassword}
          style={{ cursor: 'pointer' }}
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </InputGroup.Text>
      );
    }
    if (EndIcon) {
      return (
        <InputGroup.Text>
          <EndIcon />
        </InputGroup.Text>
      );
    }
    return null;
  };

  return (
    <Form.Group>
      {label && <Form.Label>{label}</Form.Label>}
      <InputGroup>
        {StartIcon && (
          <InputGroup.Text>
            <StartIcon />
          </InputGroup.Text>
        )}
        <Form.Control
          className={'shadow-none ' + className}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          {...props}
        />
        {renderEndIcon()}
      </InputGroup>
    </Form.Group>
  );
};
