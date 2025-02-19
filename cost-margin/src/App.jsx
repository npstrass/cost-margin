import React, { useState } from "react";

const FET_PERCENTAGE = 0.12;
const PARTIAL_FET_INCREASE = 1.04;
const USD_TO_CAD = 1.43;

const currencyConversion = (amount, toCurrency, fromCurrency) => {
  const number = Number(amount);
  if (isNaN(number) || number <= 0) return 0;
  if (toCurrency === fromCurrency) return number;
  return toCurrency === "USD" ? number / USD_TO_CAD : number * USD_TO_CAD;
};

const round = (price) => (!price ? 0 : (Math.round(price / 10) * 10));
const format = (value) => (!value ? "0.00" : Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

function App() {
  const [values, setValues] = useState({
    sale: "",
    cost: "",
    margin: "",
    fetType: "none",
    partialFetAmount: "",
    costCurrency: "USD",
    saleCurrency: "USD",
  });

  const handleChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });
  const reset = () => setValues({ sale: "", cost: "", margin: "", fetType: "none", partialFetAmount: "", costCurrency: "USD", saleCurrency: "USD" });
  
  const calculateSalePrice = () => (!values.cost || !values.margin ? 0 : values.cost / (1 - values.margin / 100));
  const marginCalc = () => {
    if (!values.sale || !values.cost) return 0;
    const saleAmount = currencyConversion(values.sale, "USD", values.saleCurrency);
    const costAmount = currencyConversion(values.cost, "USD", values.costCurrency);
    return format(((saleAmount - costAmount) / saleAmount) * 100);
  };
  
  const marginVariance = () => (!values.sale || !values.margin ? "" : `(${(marginCalc() - values.margin).toFixed(2)})`);

  const fetCalc = (toCurrency) => {
    if (values.fetType === "none" || !values.cost) return 0;
    const baseAmount = values.fetType === "full" ? calculateSalePrice() : values.partialFetAmount * PARTIAL_FET_INCREASE;
    return currencyConversion(baseAmount, toCurrency, values.costCurrency) * FET_PERCENTAGE;
  };

  const renderOutput = (currency) => (
    <div className="output-group">
      <h2>{currency}</h2>
      {[
        { label: "Cost", value: currencyConversion(values.cost, currency, values.costCurrency) },
        { label: "Sale Price", value: currencyConversion(values.sale, currency, values.saleCurrency) },
        { label: "Target Sale Price", value: currencyConversion(calculateSalePrice(), currency, values.costCurrency) },
        { label: "Estimated FET Amount", value: fetCalc(currency) },
        { label: "Total Target Sale Price (rounded)", value: round(currencyConversion(calculateSalePrice(), currency, values.costCurrency) + fetCalc(currency)) },
      ].map(({ label, value }) => (
        <div className="output-wrapper" key={label}>
          <div>{label}:</div>
          <div>$ {format(value)}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <h1>Margin and Sale Price Calculator</h1>
      <div className="container">
        <div className="form-container">
          {["sale", "cost", "margin"].map((field) => (
            <div className="input-group" key={field}>
              <h2>{field.charAt(0).toUpperCase() + field.slice(1)}:</h2>
              <div className="input-wrapper">
                {field !== "margin" && (
                  <select name={`${field}Currency`} value={values[`${field}Currency`]} onChange={handleChange}>
                    <option value="USD">USD</option>
                    <option value="CAD">CAD</option>
                  </select>
                )}
                <input type="number" name={field} value={values[field]} onChange={handleChange} />
              </div>
            </div>
          ))}

          <div className="input-group">
            <h2>FET Type:</h2>
            <div className="input-wrapper">
              <select name="fetType" value={values.fetType} onChange={handleChange}>
                <option value="none">No FET</option>
                <option value="full">Full FET</option>
                <option value="partial">Partial FET</option>
              </select>
              <input type="number" name="partialFetAmount" value={values.partialFetAmount} onChange={handleChange} disabled={values.fetType !== "partial"} />
            </div>
          </div>
        </div>
        <div className="output-container">
          <div className="output-group">
            <h2>Margin:</h2>
            <div className="output-wrapper"><div>Target Margin:</div><div>{format(values.margin)} %</div></div>
            <div className="output-wrapper"><div>Actual Margin:</div><div>{marginVariance()} {format(marginCalc())} %</div></div>
          </div>
          {renderOutput("USD")} {renderOutput("CAD")}
        </div>
      </div>
      <br />
      <button className="button-67" onClick={reset}>Reset</button>
    </div>
  );
}

export default App;