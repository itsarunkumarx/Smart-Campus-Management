const axios = require('axios');

const testApi = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/placements');
        console.log('Placements:', response.data);
    } catch (error) {
        console.error('Error fetching placements:', error.message);
    }
};

testApi();
