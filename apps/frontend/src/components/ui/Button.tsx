type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
};

export function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled,
  onClick,
}: ButtonProps) {
  const className = variant === 'secondary' ? 'button button-secondary' : 'button';
  return (
    <button className={className} type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
