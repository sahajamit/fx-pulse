'use client';

interface PriceDisplayProps {
  price: number;
  isJpy: boolean;
  direction: 'up' | 'down' | 'unchanged';
  side: 'bid' | 'ask';
}

export default function PriceDisplay({ price, isJpy, direction, side }: PriceDisplayProps) {
  const priceStr = isJpy ? price.toFixed(3) : price.toFixed(5);

  let bigFigure: string;
  let pips: string;
  let fractional: string;

  if (isJpy) {
    const parts = priceStr.split('.');
    bigFigure = parts[0] + '.';
    pips = parts[1].substring(0, 2);
    fractional = parts[1].substring(2);
  } else {
    const parts = priceStr.split('.');
    bigFigure = parts[0] + '.' + parts[1].substring(0, 2);
    pips = parts[1].substring(2, 4);
    fractional = parts[1].substring(4);
  }

  const colorClass = direction === 'up' ? 'text-[#00C48C]' : direction === 'down' ? 'text-[#FF4757]' : 'text-[#E8EAED]';

  return (
    <div className={`flex items-baseline ${side === 'ask' ? 'justify-end' : 'justify-start'}`} data-testid={`price-${side}`}>
      <span className={`text-xs ${colorClass} opacity-60 font-mono`}>{bigFigure}</span>
      <span className={`text-2xl font-bold ${colorClass} font-mono leading-none`}>{pips}</span>
      <span className={`text-sm ${colorClass} opacity-70 font-mono -translate-y-1.5 inline-block`}>{fractional}</span>
    </div>
  );
}
