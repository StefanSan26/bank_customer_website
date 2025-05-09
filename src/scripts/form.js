document.getElementById('predictionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    CreditScore: document.getElementById('CreditScore').value,
    Geography: document.getElementById('Geography').value,
    Gender: document.getElementById('Gender').value,
    Age: document.getElementById('Age').value,
    Tenure: document.getElementById('Tenure').value,
    Balance: document.getElementById('Balance').value,
    NumOfProducts: document.getElementById('NumOfProducts').value,
    HasCrCard: document.getElementById('HasCrCard').value,
    IsActiveMember: document.getElementById('IsActiveMember').value,
    EstimatedSalary: document.getElementById('EstimatedSalary').value,
    Surname: document.getElementById('Surname').value
  };

  try {
    const response = await fetch('http://localhost:80/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'http://localhost:4321'
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Raw server response:', result);
    
    // Display the result on the page
    const resultContainer = document.getElementById('result');
    const predictionText = document.getElementById('predictionText');
    resultContainer.style.display = 'block';
    
    // Format the prediction result to be more readable
    let formattedResult = '';
    
    // Handle different response formats
    if (typeof result === 'object') {
      // Check for the new response format (churn_probability and will_churn)
      if ('churn_probability' in result && 'will_churn' in result) {
        const probability = (result.churn_probability * 100).toFixed(1);
        const predictionMessage = result.will_churn
          ? 'This customer is likely to leave the bank.'
          : 'This customer is likely to stay with the bank.';

        formattedResult = `${predictionMessage}\nChurn Probability: ${probability}%`;
      }
      // Check for the alternative format (prediction and probability)
      else if (result.prediction !== undefined || (result.data && result.data.prediction !== undefined)) {
        const predictionData = result.data || result;
        const prediction = predictionData.prediction;
        const probability = predictionData.probability;
        const confidence = probability ? (probability * 100).toFixed(1) : null;
        
        const predictionMessage = prediction === 1 
          ? 'This customer is likely to leave the bank.' 
          : 'This customer is likely to stay with the bank.';
        
        const confidenceMessage = confidence 
          ? `\nConfidence Level: ${confidence}%` 
          : '';
        
        formattedResult = `${predictionMessage}${confidenceMessage}`;
      } else {
        formattedResult = 'Unexpected response format. Raw result:\n' + JSON.stringify(result, null, 2);
      }
    } else {
      formattedResult = 'Unexpected response type. Raw result:\n' + result;
    }
    
    predictionText.textContent = formattedResult;
    
    // Add appropriate color class based on prediction
    predictionText.className = '';
    if (result.will_churn || result.prediction === 1 || (result.data && result.data.prediction === 1)) {
      predictionText.classList.add('prediction-churn');
    } else if (result.will_churn === false || result.prediction === 0 || (result.data && result.data.prediction === 0)) {
      predictionText.classList.add('prediction-stay');
    }
    
  } catch (error) {
    console.error('Error:', error);
    // Display error on the page
    const resultContainer = document.getElementById('result');
    const predictionText = document.getElementById('predictionText');
    resultContainer.style.display = 'block';
    predictionText.textContent = `Error: ${error.message}. Please ensure the server is running and CORS is properly configured.`;
  }
}); 