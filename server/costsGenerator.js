/**
 * Parse the received budget data to construct an array of daily budgets
 *
 * @param budget
 * @returns {[]}
 */
const parseBudget = (budget) => {
  let rawBudget = budget.replace(/[^0-9.,:;()]+/g, '').split(';');
  const dailyBudget = [];

  if (rawBudget[0][0] === ':') {
    rawBudget[0] = rawBudget[0].substring(1);
  }

  rawBudget.forEach((dayBudget) => {
    const dayBudgetArray = dayBudget.replace(/:/, '-').split('-');
    dayBudgetArray[1] = dayBudgetArray[1]
      .replace(/\(/g, '-')
      .replace(/\)/g, '');
    const rawHourlyBudget = dayBudgetArray[1].split(',');
    const hourlyBudget = [];

    rawHourlyBudget.forEach((hourlyBudgetItem) => {
      const hourlyBudgetArray = hourlyBudgetItem.split('-');
      const hourlyBudgetObj = {};

      hourlyBudgetObj[hourlyBudgetArray[1]] = hourlyBudgetArray[0];
      hourlyBudget.push(hourlyBudgetObj);
    });

    const budgetPerDay = {};

    budgetPerDay[dayBudgetArray[0]] = hourlyBudget;
    dailyBudget.push(budgetPerDay);
  });

  return dailyBudget;
};

/**
 * Generate random cost between 0 and a given value
 *
 * @param currentBudget
 * @returns {number}
 */
const randomCost = (currentBudget) => {
  return Math.floor(Math.random() * currentBudget * 10) / 10;
};

/**
 * Generate random value
 *
 * @param min
 * @param max
 * @returns {number}
 */
const randomValue = (min, max) => {
  return Math.floor(Math.random() * (max + 1 - min) + min);
};

/**
 * Generate random costs depending on a daily budget
 *
 * @param day
 * @param dayBudget
 * @param maxMonthlyBudgets
 * @param currentCostPerMonth
 * @returns {[]}
 */
const generateDailyCosts = (
  day,
  dayBudget,
  maxMonthlyBudgets,
  currentCostPerMonth
) => {
  const maxTies = 10;
  const randomTries = randomValue(1, maxTies);
  const triesArray = [];
  let cumulatedDailyCosts = 0;
  const dayCosts = [];
  const MINUTES_IN_DAY = 1440;

  let maxMonthlyBudget = 0;
  let currentMonth = parseInt(day.split('.')[0], 10);

  maxMonthlyBudgets.forEach((monthBudget) => {
    if (
      Object.entries(monthBudget)[0][0].toString() === currentMonth.toString()
    ) {
      maxMonthlyBudget = Object.entries(monthBudget)[0][1];
    }
  });

  for (let i = 0; i < randomTries; i++) {
    let added = false;
    let newRandom;

    while (!added) {
      newRandom = randomValue(1, MINUTES_IN_DAY);

      if (!triesArray.includes(newRandom)) {
        triesArray.push(newRandom);
        added = true;
      }
    }
  }

  triesArray.sort((a, b) => a - b);

  triesArray.forEach((randomTry) => {
    dayBudget.every((currentBudget) => {
      const timeKey = Object.entries(currentBudget)[0][0];
      const budgetValue = Object.entries(currentBudget)[0][1];
      const timeArr = timeKey.split(':');
      const minutesKey = parseInt(+timeArr[0] * 60 + +timeArr[1]);

      if (randomTry >= minutesKey) {
        const maxValueByMonth =
          (maxMonthlyBudget * 10 - currentCostPerMonth * 10) / 10;
        const maxValueByDay =
          (budgetValue * 20 - cumulatedDailyCosts * 10) / 10;
        const maxValue =
          maxValueByDay <= maxValueByMonth ? maxValueByDay : maxValueByMonth;
        const randomCostValue = randomCost(maxValue);
        const newCost = {};
        const hours = Math.floor(randomTry / 60);
        const costTime = `${hours.toString().padStart(2, '0')}:${Math.floor(
          (randomTry / 60 - hours) * 60
        )
          .toString()
          .padStart(2, '0')}`;

        if (randomCostValue !== 0) {
          cumulatedDailyCosts =
            (cumulatedDailyCosts * 10 + randomCostValue * 10) / 10;
          newCost[costTime] = randomCostValue;
          dayCosts.push(newCost);
          currentCostPerMonth =
            (currentCostPerMonth * 10 + randomCostValue * 10) / 10;
        }

        return false;
      }

      return true;
    });
  });

  if (dayCosts.length === 0) {
    dayCosts.push({ 0: '0' });
  }

  return dayCosts;
};

/**
 * Create and array dates between 2 given dates
 *
 * @param startDate
 * @param endDate
 * @returns {[]}
 */
const getDatesBetweenDates = (startDate, endDate) => {
  let dates = [];
  const theDate = new Date(startDate);

  while (theDate <= endDate) {
    dates = [...dates, new Date(theDate)];
    theDate.setDate(theDate.getDate() + 1);
  }

  return dates;
};

/**
 * Return a date from date like string
 *
 * @param day
 * @returns {Date}
 */
const getDate = (day) => {
  const dayArray = day.toString().split('.');

  return new Date(
    Date.UTC(
      parseInt(dayArray[2]),
      parseInt(dayArray[0], 10) - 1,
      parseInt(dayArray[1], 10)
    )
  );
};

/**
 * Crate and array of cumulated budget per month and also add maximum daily budgets in a given array
 *
 * @param dates
 * @param dailyBudget
 * @param budgetCosts
 * @returns {[]}
 */
const getMaxBudget = (dates, dailyBudget, budgetCosts) => {
  let maxBudgets = [];
  let cumulativeBudget = 0;
  let currentMonth = dates[0].getMonth() + 1;
  let lastBudget = 0;

  dates.forEach((date) => {
    const currentDay = [
      `${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}.${date
        .getDate()
        .toString()
        .padStart(2, '0')}.${date.getFullYear().toString().padStart(2, '0')}`,
    ];
    let budgetInDay = 0;

    dailyBudget.forEach((budgetDay) => {
      const budgetDate = getDate(Object.entries(budgetDay)[0][0]);

      if (date.getTime() === budgetDate.getTime()) {
        let maxBudget = 0;
        let currentBudget = 0;

        Object.entries(budgetDay)[0][1].forEach((budgetItem) => {
          currentBudget = parseInt(Object.entries(budgetItem)[0][1].toString());
          lastBudget = currentBudget;

          if (currentBudget > maxBudget) {
            maxBudget = currentBudget;
          }
        });

        budgetInDay = maxBudget;
      }

      if (budgetInDay === 0) {
        budgetInDay = lastBudget;
      }
    });

    if (currentMonth !== date.getMonth() + 1) {
      const currentMaxBudget = {};

      currentMaxBudget[currentMonth] = cumulativeBudget;
      maxBudgets.push(currentMaxBudget);
      cumulativeBudget = 0;
      currentMonth = date.getMonth() + 1;
    } else {
      cumulativeBudget += parseInt(budgetInDay);
    }

    if (budgetCosts) {
      currentDay.push(budgetInDay);
      budgetCosts.push(currentDay);
    }
  });

  const currentMaxBudget = {};

  currentMaxBudget[currentMonth] = cumulativeBudget + lastBudget;
  maxBudgets.push(currentMaxBudget);

  return maxBudgets;
};

/**
 * Create and array with the cumulated costs per day
 *
 * @param dailyBudget
 * @param dailyCosts
 * @param dates
 * @param budgetCosts
 * @returns {*}
 */
const generateCostsPerDay = (dailyBudget, dailyCosts, dates, budgetCosts) => {
  dates.forEach((date, index) => {
    let costInDay = 0;

    dailyCosts.forEach((costsDay) => {
      const costsDate = getDate(Object.entries(costsDay)[0][0]);

      if (date.getTime() === costsDate.getTime()) {
        Object.entries(costsDay)[0][1].forEach((costsItem) => {
          costInDay =
            (costInDay * 10 + Object.entries(costsItem)[0][1] * 10) / 10;
        });
      }
    });

    budgetCosts[index].push(costInDay);
  });

  return budgetCosts;
};

/**
 * Calculate daily budget and costs and generate random costs given a budget history
 *
 * @param budget
 * @returns {[[], *]}
 */
const calculateBudgetsAndCosts = (budget) => {
  const dailyBudget = parseBudget(budget);
  const costs = [];
  const firstDay = getDate(Object.entries(dailyBudget[0])[0][0]);
  const lastDay = getDate(
    Object.entries(dailyBudget[dailyBudget.length - 1])[0][0]
  );
  const dates = getDatesBetweenDates(firstDay, lastDay);
  const budgetCosts = [];
  let maxBudgets = getMaxBudget(dates, dailyBudget, budgetCosts);
  let costPerMonth = 0;
  let currentMonth = parseInt(
    Object.entries(dailyBudget[0])[0][0].split('.')[0],
    10
  );

  budgetCosts.forEach((dayAndBudget) => {
    let currentDayBudgets = null;

    dailyBudget.forEach((budgetPerDay) => {
      if (dayAndBudget[0] === Object.entries(budgetPerDay)[0][0]) {
        currentDayBudgets = budgetPerDay;
      }
    });

    const dailyCots = {};
    let month = 0;

    if (currentDayBudgets) {
      dailyCots[Object.entries(currentDayBudgets)[0][0]] = generateDailyCosts(
        Object.entries(currentDayBudgets)[0][0],
        Object.entries(currentDayBudgets)[0][1],
        maxBudgets,
        costPerMonth
      );
      costs.push(dailyCots);

      month = parseInt(
        Object.entries(currentDayBudgets)[0][0].split('.')[0],
        10
      );
    } else if (dayAndBudget[1] !== 0) {
      const budgetObj = {};

      budgetObj['00:00'] = dayAndBudget[1].toString();
      dailyCots[dayAndBudget[0]] = generateDailyCosts(
        dayAndBudget[0],
        [budgetObj],
        maxBudgets,
        costPerMonth
      );

      costs.push(dailyCots);
      month = parseInt(dayAndBudget[0].split('.')[0], 10);
    }

    if (currentMonth !== month) {
      currentMonth = month;
      costPerMonth = 0;
    }
  });

  const budgetAndCosts = generateCostsPerDay(
    dailyBudget,
    costs,
    dates,
    budgetCosts
  );

  return [costs, budgetAndCosts];
};

module.exports = { calculateBudgetsAndCosts };
