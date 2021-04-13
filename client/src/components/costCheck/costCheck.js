import React, { useState } from 'react';
import { getCosts } from '../../services/budgetServices';
import './costCheck.scss';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const CostCheck = () => {
  const [fileValue, setFileValue] = useState();
  const [costs, setCosts] = useState(null);

  const handleFieldChange = (target, setFieldState) => {
    setFieldState(target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (fileValue) {
      const data = new FormData();

      data.append('costs', fileValue);
      getCosts(data)
        .then((costsData) => {
          setCosts(costsData);
        })
        .catch((error) => console.warn(error));
    }
  };

  return (
    <div className="app-page__section cost-check">
      <h2 className="app-page__headline">Costs calculator</h2>
      {!costs ? (
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label>Upload daily budget</Form.Label>
            <Form.File
              id="budget-upload"
              onChange={({ target }) => handleFieldChange(target, setFileValue)}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Calculate costs
          </Button>
        </Form>
      ) : (
        <div>
          <div className="cost-check__costs">
            <h4 className="cost-check__headline">1. Costs generated</h4>
            <ol className="cost-check__daily-costs">
              {costs[0].map((dailyCosts) => {
                return (
                  <li
                    key={Object.entries(dailyCosts)[0][0]}
                    className="cost-check__day-item"
                  >
                    <div className="cost-check__item">
                      <span className="cost-check__day">
                        {Object.entries(dailyCosts)[0][0]}:
                      </span>
                      {Object.entries(dailyCosts)[0][1].map((costItem) => {
                        return (
                          <div
                            key={Object.entries(costItem)[0][0]}
                            className="cost-check__hourly-costs"
                          >
                            <span className="cost-check__cost-value">
                              {Object.entries(costItem)[0][1]}
                            </span>
                            {Object.entries(costItem)[0][0] !== '0' ? (
                              <span className="cost-check__hour">
                                ({Object.entries(costItem)[0][0]});
                              </span>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="cost-check__costs-history">
            <h4 className="cost-check__headline">2. Daily History report</h4>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Budget</th>
                  <th>Costs</th>
                </tr>
              </thead>
              <tbody>
                {costs[1].map((dailyHistoryItem) => {
                  return (
                    <tr key={dailyHistoryItem[0]}>
                      <td>{dailyHistoryItem[0]}</td>
                      <td>{dailyHistoryItem[1]}</td>
                      <td>{dailyHistoryItem[2]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostCheck;
