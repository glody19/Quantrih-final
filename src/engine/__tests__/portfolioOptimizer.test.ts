import { describe, it, expect } from "vitest";
import {
  projectCappedSimplex, minVariance, maxSharpe, riskParity, riskContributions, efficientFrontier,
  targetVolatility, targetReturn, portfolioVol, portfolioReturn, maxDiversification, simulatePath, estimateMoments,
} from "../portfolio-optimizer";

const mu = [0.08, 0.04, 0.06];
const vol = [0.18, 0.06, 0.15];
const corr = [[1, -0.2, 0.3], [-0.2, 1, 0.1], [0.3, 0.1, 1]];
const cov = corr.map((r, i) => r.map((c, j) => c * vol[i] * vol[j]));
const input = { mu, cov, lo: [0, 0, 0], hi: [1, 1, 1], rf: 0.02 };
const s = (w: number[]) => w.reduce((a, b) => a + b, 0);

describe("portfolio optimizer", () => {
  it("projects onto the capped simplex", () => {
    const w = projectCappedSimplex([0.9, 0.9, -0.5], [0, 0.1, 0], [0.6, 1, 1]);
    expect(s(w)).toBeCloseTo(1, 8);
    expect(w[0]).toBeLessThanOrEqual(0.6 + 1e-9);
    expect(w[1]).toBeGreaterThanOrEqual(0.1 - 1e-9);
  });

  it("minimum variance beats random portfolios", () => {
    const w = minVariance(input);
    const v = portfolioVol(w, cov);
    for (let k = 0; k < 500; k++) {
      const r = [Math.random(), Math.random(), Math.random()];
      const t = s(r);
      expect(v).toBeLessThanOrEqual(portfolioVol(r.map((x) => x / t), cov) + 1e-9);
    }
  });

  it("max Sharpe beats random portfolios and respects bounds", () => {
    const w = maxSharpe(input);
    const sh = (x: number[]) => (portfolioReturn(x, mu) - 0.02) / portfolioVol(x, cov);
    for (let k = 0; k < 500; k++) {
      const r = [Math.random(), Math.random(), Math.random()];
      const t = s(r);
      expect(sh(w)).toBeGreaterThanOrEqual(sh(r.map((x) => x / t)) - 1e-6);
    }
    const capped = maxSharpe({ ...input, hi: [0.3, 1, 1] });
    expect(capped[0]).toBeLessThanOrEqual(0.3 + 1e-9);
    expect(s(capped)).toBeCloseTo(1, 8);
  });

  it("risk parity equalizes risk contributions", () => {
    const rc = riskContributions(riskParity(input), cov);
    rc.forEach((x) => expect(x).toBeCloseTo(1 / 3, 4));
  });

  it("frontier is increasing and targets are met", () => {
    const fr = efficientFrontier(input);
    for (let i = 1; i < fr.length; i++) {
      expect(fr[i].vol).toBeGreaterThan(fr[i - 1].vol);
      expect(fr[i].ret).toBeGreaterThanOrEqual(fr[i - 1].ret - 1e-9);
    }
    const wv = targetVolatility(input, 0.1, fr);
    expect(portfolioVol(wv, cov)).toBeLessThanOrEqual(0.1 + 1e-6);
    expect(portfolioVol(wv, cov)).toBeGreaterThan(0.095);
    const wr = targetReturn(input, 0.06, fr);
    expect(portfolioReturn(wr, mu)).toBeGreaterThanOrEqual(0.06 - 1e-6);
  });

  it("max diversification is fully invested", () => {
    expect(s(maxDiversification(input))).toBeCloseTo(1, 8);
  });

  it("simulates a rebalanced path", () => {
    const rets = [[0.1, -0.1], [0, 0]];
    const { values } = simulatePath(rets, ["2020-01", "2020-02"], () => [0.5, 0.5], 100, "monthly");
    expect(values).toHaveLength(3);
    expect(values[1]).toBeCloseTo(105, 8);
    expect(values[2]).toBeCloseTo(105 * (1 - 0.05), 8);
  });

  it("estimates annualized moments", () => {
    const { mu: m, cov: c } = estimateMoments([[0.01, 0.03], [0.02, 0.02]]);
    expect(m[0]).toBeCloseTo(0.24, 8);
    expect(c[1][1]).toBe(0);
  });
});
