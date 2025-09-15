// app/(main)/(components)/currency-input.jsx
'use client';

import React from 'react';
import { Input } from "@/components/ui/input";

export const CurrencyInput = React.forwardRef(({ onChange, value, ...props }, ref) => {
  const handleInputChange = (e) => {
    let rawValue = e.target.value.replace(/\D/g, '');
    let numberValue = Number(rawValue) / 100;

    onChange(numberValue); // Passa o valor numérico para o form
  };
  
  const displayValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);

  return (
    <Input
      {...props}
      ref={ref}
      value={displayValue}
      onChange={handleInputChange}
      type="text"
      inputMode="decimal"
    />
  );
});

CurrencyInput.displayName = 'CurrencyInput';