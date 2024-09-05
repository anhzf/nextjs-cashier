'use client';

import { useRouter } from 'next/navigation';
import type { ComponentProps, MouseEventHandler } from 'react';

interface ButtonBackProps extends ComponentProps<'button'> { }

export function ButtonBack({ onClick: _onClick, ...props }: ButtonBackProps) {
  const router = useRouter();

  const onClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    router.back();
    _onClick?.(e);
  };

  return (
    <button {...props} onClick={onClick} />
  );

}