import axios from 'axios';

const url = 'http://localhost:3001/api';

/**
 * Get costs and daily history from server given a daily budget
 *
 * @param costs
 * @returns {Promise<any>}
 */
export const getCosts = async (costs) => {
  try {
    const res = await axios.post(url, costs);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};
