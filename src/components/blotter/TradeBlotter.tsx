'use client';

import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, themeQuartz, ColDef } from 'ag-grid-community';
import { useTradingContext } from '@/context/TradingContext';
import { Trade } from '@/lib/types';
import { formatNotional, formatTime, formatRate } from '@/lib/tradeUtils';
import StatusCellRenderer from './StatusCellRenderer';

ModuleRegistry.registerModules([AllCommunityModule]);

const darkTheme = themeQuartz.withParams({
  accentColor: '#2962FF',
  backgroundColor: '#101118',
  borderColor: '#262730',
  browserColorScheme: 'dark',
  foregroundColor: '#E8EAED',
  headerBackgroundColor: '#0A0B0E',
  headerFontSize: 11,
  headerFontWeight: 600,
  headerTextColor: '#8B8D97',
  fontSize: 12,
  rowBorder: { color: '#1A1B23', style: 'solid', width: 1 },
  oddRowBackgroundColor: '#12131A',
  rowHoverColor: '#1A1B23',
  cellHorizontalPaddingScale: 0.8,
});

export default function TradeBlotter() {
  const { trades } = useTradingContext();

  const columnDefs = useMemo<ColDef<Trade>[]>(() => [
    { field: 'id', headerName: 'Trade ID', width: 110, filter: true },
    {
      field: 'timestamp',
      headerName: 'Time',
      width: 90,
      valueFormatter: (p) => p.value ? formatTime(p.value) : '',
      sort: 'desc',
    },
    { field: 'pair', headerName: 'Pair', width: 90, filter: true },
    {
      field: 'direction',
      headerName: 'Side',
      width: 70,
      cellStyle: (p) => ({
        color: p.value === 'BUY' ? '#00C48C' : '#FF4757',
      }),
    },
    {
      field: 'notional',
      headerName: 'Notional',
      width: 100,
      valueFormatter: (p) => p.value ? formatNotional(p.value) : '',
      type: 'rightAligned',
    },
    {
      field: 'rate',
      headerName: 'Rate',
      width: 100,
      valueFormatter: (p) => {
        if (!p.value || !p.data) return '';
        return formatRate(p.value, p.data.pair);
      },
      type: 'rightAligned',
      cellClass: '!font-mono',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 95,
      cellRenderer: StatusCellRenderer,
    },
    { field: 'counterparty', headerName: 'Counterparty', width: 120, filter: true },
    { field: 'source', headerName: 'Source', width: 70 },
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    resizable: true,
    suppressMovable: true,
  }), []);

  return (
    <div className="flex flex-col h-full" data-testid="trade-blotter">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#262730]">
        <h2 className="text-xs font-semibold text-[#8B8D97] uppercase tracking-wider">Trade Blotter</h2>
        <span className="text-[10px] text-[#555662]">{trades.length} trades</span>
      </div>
      <div className="flex-1 min-h-0">
        <AgGridReact<Trade>
          theme={darkTheme}
          rowData={trades}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          getRowId={(params) => params.data.id}
          suppressCellFocus={true}
        />
      </div>
    </div>
  );
}
