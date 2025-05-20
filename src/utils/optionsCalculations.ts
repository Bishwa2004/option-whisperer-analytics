
// Black-Scholes Option Pricing Model
export function calculateBlackScholes(
  stockPrice: number,
  strikePrice: number,
  timeToExpiry: number, // in years
  volatility: number, // annual volatility in decimal
  riskFreeRate: number, // annual rate in decimal
  optionType: "call" | "put"
) {
  // Convert volatility and time to yearly
  const vol = volatility;
  const time = timeToExpiry;

  // Calculate d1 and d2
  const d1 =
    (Math.log(stockPrice / strikePrice) +
      (riskFreeRate + 0.5 * vol * vol) * time) /
    (vol * Math.sqrt(time));
  const d2 = d1 - vol * Math.sqrt(time);

  // Calculate call or put price
  if (optionType === "call") {
    return (
      stockPrice * cumulativeNormalDistribution(d1) -
      strikePrice * Math.exp(-riskFreeRate * time) * cumulativeNormalDistribution(d2)
    );
  } else {
    return (
      strikePrice * Math.exp(-riskFreeRate * time) * cumulativeNormalDistribution(-d2) -
      stockPrice * cumulativeNormalDistribution(-d1)
    );
  }
}

// Calculate the cumulative normal distribution
function cumulativeNormalDistribution(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * z);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

  return 0.5 * (1.0 + sign * y);
}

// Calculate Greeks
export function calculateGreeks(
  stockPrice: number,
  strikePrice: number,
  timeToExpiry: number, // in years
  volatility: number, // annual volatility in decimal
  riskFreeRate: number, // annual rate in decimal
  optionType: "call" | "put"
) {
  // Standard normal probability density function
  const pdf = (x: number) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);

  const vol = volatility;
  const time = timeToExpiry;

  const d1 =
    (Math.log(stockPrice / strikePrice) +
      (riskFreeRate + 0.5 * vol * vol) * time) /
    (vol * Math.sqrt(time));
  const d2 = d1 - vol * Math.sqrt(time);

  // Delta
  let delta = 0;
  if (optionType === "call") {
    delta = cumulativeNormalDistribution(d1);
  } else {
    delta = cumulativeNormalDistribution(d1) - 1;
  }

  // Gamma (same for call and put)
  const gamma = pdf(d1) / (stockPrice * vol * Math.sqrt(time));

  // Theta
  let theta = 0;
  if (optionType === "call") {
    theta =
      -(stockPrice * vol * pdf(d1)) / (2 * Math.sqrt(time)) -
      riskFreeRate * strikePrice * Math.exp(-riskFreeRate * time) * cumulativeNormalDistribution(d2);
  } else {
    theta =
      -(stockPrice * vol * pdf(d1)) / (2 * Math.sqrt(time)) +
      riskFreeRate * strikePrice * Math.exp(-riskFreeRate * time) * cumulativeNormalDistribution(-d2);
  }
  // Convert to daily theta (from yearly)
  theta = theta / 365;

  // Vega (same for call and put)
  const vega = stockPrice * Math.sqrt(time) * pdf(d1) * 0.01; // 0.01 for 1% change in volatility

  // Rho
  let rho = 0;
  if (optionType === "call") {
    rho = strikePrice * time * Math.exp(-riskFreeRate * time) * cumulativeNormalDistribution(d2) * 0.01;
  } else {
    rho = -strikePrice * time * Math.exp(-riskFreeRate * time) * cumulativeNormalDistribution(-d2) * 0.01;
  }

  return {
    delta,
    gamma,
    theta,
    vega,
    rho,
  };
}

// Calculate implied volatility using bisection method
export function calculateImpliedVolatility(
  marketPrice: number,
  stockPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  riskFreeRate: number,
  optionType: "call" | "put",
  precision: number = 0.0001,
  maxIterations: number = 100
): number {
  let low = 0.001;
  let high = 5.0; // 500% volatility as upper bound
  let mid = 0;

  for (let i = 0; i < maxIterations; i++) {
    mid = (low + high) / 2;
    const price = calculateBlackScholes(stockPrice, strikePrice, timeToExpiry, mid, riskFreeRate, optionType);
    
    if (Math.abs(price - marketPrice) < precision) {
      return mid;
    }

    if (price > marketPrice) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return mid; // Return the closest approximation
}
