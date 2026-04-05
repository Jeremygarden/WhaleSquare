export type Holding = {
  cusip: string;
  name: string;
  ticker: string;
  shares: number;
  value: number;
  weight: number; // % of portfolio
  changeShares: number; // delta vs previous filing
};

export type Institution = {
  cik: string;
  name: string;
  quarter: string;
  totalValue: number;
  holdings: Holding[];
  filingHistory?: string[];
};
