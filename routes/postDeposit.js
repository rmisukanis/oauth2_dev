
var tools = require('../tools/tools.js');
var config = require('../config.json');
var request = require('request');
var express = require('express');
var router = express.Router();

// POST endpoint to process deposit data
router.post('/upload', async function (req, res) {
  console.log('Request body:', req.body);  // Log the body of the request
  const { deposits } = req.body; // Only expect deposits from the client

  // Ensure deposits is provided
  if (!deposits) {
    return res.json({ error: 'Missing required parameter: deposits.' });
  }

  // Get token and realmId from session (similar to queryPayment.js)
  var token = tools.getToken(req.session);
  if (!token) return res.json({ error: 'Not authorized' });
  if (!req.session.realmId) return res.json({ error: 'No realm ID. QBO calls only work if the accounting scope was passed!' });

  const accessToken = token.accessToken;
  const realmId = req.session.realmId;
  console.log('Using Realm ID:', realmId);

  try {
 
    // Function to generate the batch request for QuickBooks
    function generateBatchRequest(deposits) {
      return {
          "BatchItemRequest": deposits.map((deposit, index) => ({
              "bId": `bid${index + 1}`,
              "operation": "create",
              "Deposit": {
                  "DepositToAccountRef": {
                      "value": deposit.accountValue,
                      "name": deposit.accountName
                  },
                  "TxnDate": deposit.TxnDate,
                  "PrivateNote": deposit.PrivateNote,
                  "Line": [
                      // Add fee line if feeAmount, feeValue, and feeName are present
                      ...(deposit.feeAmount && deposit.feeValue && deposit.feeName
                          ? [{
                              "Amount": deposit.feeAmount,
                              "DetailType": "DepositLineDetail",
                              "DepositLineDetail": {
                                  "AccountRef": {
                                      "value": deposit.feeValue,
                                      "name": deposit.feeName
                                  }
                              }
                          }]
                          : []),
                      {
                          "Amount": deposit.amount,
                          "LinkedTxn": (deposit.payments || [deposit.txnId]).map(payment => ({
                              "TxnId": payment, // Use the payment ID from the payments array or txnId
                              "TxnType": "Payment",
                              "TxnLineId": "0"
                          }))
                      }
                  ]
              }
          }))
      };
  }
    // Generate the batch request
    const batchRequest = generateBatchRequest(deposits);

    const api_uri = config.api_uri;
    const realmId = req.session.realmId;
    const session = req.session.realmId;
    const minorversion = 'minorversion=75'
    const accessToken = token.accessToken;

    console.log('api_uri: ', api_uri);
    console.log('realmId: ', realmId);
    console.log('session: ', session);
  
 
    // Setup request options for QuickBooks API
    const options = {
      method: 'POST',
      url: `${api_uri}${realmId}/batch?${minorversion}`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}` // Use the access token directly
      },
      body: JSON.stringify(batchRequest)
    };

    console.log('Making API request with options:', options);

    // Make the API request to QuickBooks
    request(options, (error, response, body) => {
      if (error) {
        console.error('Error:', error);
        return res.json({ error: 'Error making request to QuickBooks' });
      } else if (response.statusCode === 200) {
        try {
          const depositsBody = JSON.parse(body);
          // Check if the response contains a Fault object
        if (depositsBody.BatchItemResponse && depositsBody.BatchItemResponse[0].Fault) {
          const fault = depositsBody.BatchItemResponse[0].Fault;
          console.error('API request failed:', fault);
          return res.json({ error: 'API request failed', fault });
        }

        // Check if BatchItemResponse exists and contains Deposit objects
        if (depositsBody.BatchItemResponse) {
          const processedDeposits = depositsBody.BatchItemResponse.map(item => {
            if (item.Deposit) {
              const deposit = item.Deposit;

              // Extract Deposit ID and LinkedTxn information
              const depositId = deposit.Id;
              const linkedTxn = deposit.Line.map(line => line.LinkedTxn).flat(); // Flatten LinkedTxn arrays

              return { depositId, linkedTxn };
            } else {
              console.error('No Deposit object found in BatchItemResponse:', item);
              return null;
            }
          }).filter(item => item !== null); // Filter out null values

            // Log the extracted information
            processedDeposits.forEach((deposit, index) => {
              console.log(`Deposit ${index + 1}:`);
              console.log(`  Deposit ID: ${deposit.depositId}`);
              console.log(`  Linked Transactions:`, deposit.linkedTxn);
            });

            // Send the processed deposits as a response
            return res.json({ message: 'Deposits processed successfully', processedDeposits });
          } else {
            console.error('No BatchItemResponse found in the response.');
            return res.json({ error: 'No BatchItemResponse found in the response.' });
          }
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          return res.json({ error: 'Error parsing QuickBooks response' });
        }
      } else {
        console.error('Error:', response.statusCode, body);
        return res.json({ error: 'Error with QuickBooks API', statusCode: response.statusCode });
      }
    });

  } catch (error) {
    console.error('Error processing deposit:', error);
    return res.json({ error: 'Error processing deposit' });
  }
});

module.exports = router;
