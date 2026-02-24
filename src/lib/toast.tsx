import toast from 'react-hot-toast';

interface ToastOptions {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClick?: () => void;
  className?: string;
}

export const showToast = ({ title, message, type, duration = 5000, onClick = () => null, className = '' }: ToastOptions) => {
  const toastOptions = {
    duration,
    style: {
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '12px',
      padding: '16px 20px',
      maxWidth: '420px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
  } as const;

  // Format content with proper spacing and hierarchy
  const toastContent = (
    <div onClick={onClick} style={{ lineHeight: '1.5' }} className={className}>
      <div
        style={{
          fontWeight: '600',
          fontSize: '15px',
          marginBottom: '6px',
          color: 'inherit',
        }}
       
      >
        {title}
      </div>
      <div
        style={{
          fontSize: '12px',
          opacity: 0.85,
          lineHeight: '1.4',
        }}
      >
        {message}
      </div>
    </div>
  );

  const base = {
    ...toastOptions,
    style: {
      ...toastOptions.style,
      color: '#fff',
    },
  } as const;

  switch (type) {
    case 'success':
      return toast.success(toastContent, {
        ...base,
        style: {
          ...base.style,
          background: 'var(--bs-success)',
        },
      });
    case 'error':
      return toast.error(toastContent, {
        ...base,
        style: {
          ...base.style,
          background: 'var(--bs-danger)',
        },
      });
    case 'warning':
      return toast(() => toastContent, {
        ...base,
        style: {
          ...base.style,
          background: 'var(--bs-warning)',
          color: 'var(--bs-dark)',
        },
      });
    case 'info':
    default:
      return toast(() => toastContent, {
        ...base,
        style: {
          ...base.style,
          background: 'var(--bs-info)',
        },
      });
  }
};
