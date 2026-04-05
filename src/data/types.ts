export type Holding = {
  cusip: string;
  name: string;
  ticker: string;
  shares: number;
  value: number;
  weight: number; // % of portfolio
  changeShares: number; // delta vs previous filing
};

export type FilingsByQuarter = Record<
  string,
  {
    holdings: Holding[];
    totalValue: number;
  }
>;

export type Institution = {
  cik: string;
  name: string;
  quarter: string;
  totalValue: number;
  holdings: Holding[];
  filingHistory?: string[];
  filingsByQuarter?: FilingsByQuarter;
};
