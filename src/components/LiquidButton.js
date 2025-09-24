import React from 'react';

// Minimal class names combiner (replaces clsx to avoid external dependency)
function cx(...parts) {
  return parts
    .flat()
    .filter(Boolean)
    .join(' ');
}

/*
  LiquidButton - JS version inspired by provided TSX reference.
  Props:
    variant: primary | ghost | outline | danger | (default)
    size: sm | default | lg | xl | icon
    as: element/tag override (string or component)
    disabled: boolean
    icon: optional React node to render before children
*/

const BASE = 'liquid-btn';

const variantClass = {
  primary: 'liquid-btn--primary',
  ghost: 'liquid-btn--ghost',
  outline: 'liquid-btn--outline',
  danger: 'liquid-btn--danger'
};

const sizeClass = {
  sm: 'liquid-btn--sm',
  default: '',
  lg: 'liquid-btn--lg',
  xl: 'liquid-btn--xl',
  icon: 'liquid-btn--icon'
};

export function LiquidButton({
  as: Comp = 'button',
  variant = 'primary',
  size = 'default',
  className,
  icon,
  children,
  disabled = false,
  ...rest
}) {
  return (
    <Comp
      className={cx(
        BASE,
        variantClass[variant] || null,
        sizeClass[size] || null,
        className
      )}
      disabled={disabled}
      {...rest}
    >
      {icon && <span className="inline-flex items-center justify-center text-lg">{icon}</span>}
      <span className="relative z-10 font-medium">{children}</span>
    </Comp>
  );
}

export default LiquidButton;
