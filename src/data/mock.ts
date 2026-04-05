import type { Institution } from "./types";

export const mockInstitution: Institution = {
  cik: "0001067983",
  name: "Sample Capital Management",
  quarter: "2025 Q4",
  filingHistory: ["2025 Q4", "2025 Q3", "2025 Q2", "2025 Q1"],
  totalValue: 1245600000,
  holdings: [
    { cusip: "037833100", name: "Apple Inc.", ticker: "AAPL", shares: 1200000, value: 225000000, weight: 0.18, changeShares: 200000 },
    { cusip: "594918104", name: "Microsoft Corp", ticker: "MSFT", shares: 800000, value: 260000000, weight: 0.21, changeShares: -50000 },
    { cusip: "023135106", name: "Amazon.com Inc", ticker: "AMZN", shares: 600000, value: 198000000, weight: 0.16, changeShares: 100000 },
    { cusip: "02079K305", name: "Alphabet Inc", ticker: "GOOGL", shares: 450000, value: 150000000, weight: 0.12, changeShares: -80000 },
  ],
  filingsByQuarter: {
    "2025 Q4": {
      holdings: [
        { cusip: "037833100", name: "Apple Inc.", ticker: "AAPL", shares: 1200000, value: 225000000, weight: 0.18, changeShares: 200000 },
        { cusip: "594918104", name: "Microsoft Corp", ticker: "MSFT", shares: 800000, value: 260000000, weight: 0.21, changeShares: -50000 },
        { cusip: "023135106", name: "Amazon.com Inc", ticker: "AMZN", shares: 600000, value: 198000000, weight: 0.16, changeShares: 100000 },
        { cusip: "02079K305", name: "Alphabet Inc", ticker: "GOOGL", shares: 450000, value: 150000000, weight: 0.12, changeShares: -80000 },
      ],
      totalValue: 1245600000,
    },
  },
};
