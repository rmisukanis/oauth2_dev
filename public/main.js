//Posting Transaction To Quickbooks


//function for deposit information
function parseCSV(csvData) {
  const rows = csvData.split('\n');  // Split the data into rows

  // Extract headers (first row) and trim any excess spaces
  const headers = rows[0].split(',').map(header => header.trim().replace(/['"]/g, ''));

  // Initialize an empty array to hold the parsed data
  const parsedData = [];

  // Loop through each row starting from index 1 (skip header row)
  for (let i = 1; i < rows.length; i++) {
      const row = rows[i].trim();

      if (row) { // Skip empty rows
          const columns = row.split(',').map(col => col.trim().replace(/['"]/g, ''));

          // Map the row data to an object using headers as keys
          const rowData = {};
          const payments = []; // Array to hold multiple payments

          headers.forEach((header, index) => {
              let value = columns[index] || ''; // Avoid undefined errors if columns are missing

              // Perform custom logic to handle specific fields
              if (header === 'amount' || header === 'feeAmount') {
                  value = parseFloat(value);  // Convert the 'amount' and 'feeAmount' fields to numbers
              } else if (header === 'TxnDate' && value) {
                  value = new Date(value).toISOString().split('T')[0];  // Convert 'txnDate' to YYYY-MM-DD format
              }

              // Check if the header is for a payment (e.g., 'payment1', 'payment2', etc.)
              if (header.startsWith('payment')) {
                  if (value) { // Only add the payment if the value is not empty
                      payments.push(value);
                  }
              } else {
                  rowData[header] = value; // Assign the value to the corresponding header
              }
          });

          // Add the payments array to the rowData if there are any payments
          if (payments.length > 0) {
              rowData.payments = payments;
          } else if (rowData.txnId) {
              // If no payments array exists, use txnId as the single payment ID
              rowData.payments = [rowData.txnId];
          }

          // Push the formatted row data to the parsedData array
          parsedData.push(rowData);
      }
  }

  return parsedData;  // Return the final array of parsed data
}
  function consoleParseCSV(deposits) {
    const resultBox = document.getElementById('result')
    resultBox.innerHTML = '';
    // Iterate over the array
    deposits.forEach((item, index) => {
      // Create a new paragraph for each item in the array
      const itemElement = document.createElement('div'); // Use div instead of p for flexibility

      // Check if the item is an object
      if (typeof item === 'object' && item !== null) {
          // Iterate over the object's key-value pairs
          itemElement.innerHTML += '{'
          for (const key in item) {
              if (item.hasOwnProperty(key)) {
                  // Add each key-value pair with <br> after it
                  const logEntry = `${key}: <span class="key">${item[key]}</span><br>`;
                  itemElement.innerHTML += logEntry; // Append to item element
              }
          }
          itemElement.innerHTML += '}'
      } else {
          // For non-objects (just primitive values like strings, numbers), display them
          itemElement.innerHTML = `Item ${index + 1}: ${item}`;
      }
      // Append the item element to the result-box
      resultBox.appendChild(itemElement);
  });

  }

  // Function to handle CSV file upload
async function handleFileUpload() {
  const fileInput = document.getElementById('csvFile');
  const file = fileInput.files[0];
  
  if (!file) {
    alert("Please select a file.");
    return;
  }

  const reader = new FileReader();
  
  reader.onload = async function(event) {
    const csvData = event.target.result;
    const parsedData = parseCSV(csvData);
    deposits = parsedData;
    //console.log(deposits);
    console.log(deposits)
    consoleParseCSV(deposits);

    try {
       // Send the deposits data to the API
       const response = await axios.post('/postDeposit/upload', { deposits: window.deposits }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Data successfully sent to API:', response.data);
    } catch (error) {
      console.error('Error sending data to API:', error);
    }

  };
  
  reader.readAsText(file);
}



  //function for Transfer information
function parseCSVTransfer(csvData) {
  const rows = csvData.split('\n');  // Split the data into rows

  // Extract headers (first row) and trim any excess spaces
  const headers = rows[0].split(',').map(header => header.trim().replace(/['"]/g, ''));

  // Initialize an empty array to hold the parsed data
  const parsedData = [];

  // Loop through each row starting from index 1 (skip header row)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].trim();

    if (row) { // Skip empty rows
      const columns = row.split(',').map(col => col.trim().replace(/['"]/g, ''));

      // Map the row data to an object using headers as keys
      const rowData = {};
      headers.forEach((header, index) => {
        let value = columns[index] || ''; // Avoid undefined errors if columns are missing

        // Perform custom logic to handle specific fields
        if (header === 'amount') {
          value = parseFloat(value);  // Convert the 'amount' field to a number
        } else if (header === 'TxnDate' && value) {
          value = new Date(value).toISOString().split('T')[0];  // Convert 'txnDate' to YYYY-MM-DD format
        }

        rowData[header] = value; // Assign the value to the corresponding header
      });

      // Push the formatted row data to the parsedData array
      parsedData.push(rowData);
    }
  }

  return parsedData;  // Return the final array of parsed data
}



function consoleParseCSV(transfers) {
  const resultBox = document.getElementById('result')
  resultBox.innerHTML = '';
  // Iterate over the array
  transfers.forEach((item, index) => {
    // Create a new paragraph for each item in the array
    const itemElement = document.createElement('div'); // Use div instead of p for flexibility

    // Check if the item is an object
    if (typeof item === 'object' && item !== null) {
        // Iterate over the object's key-value pairs
        itemElement.innerHTML += '{'
        for (const key in item) {
            if (item.hasOwnProperty(key)) {
                // Add each key-value pair with <br> after it
                const logEntry = `${key}: <span class="key">${item[key]}</span><br>`;
                itemElement.innerHTML += logEntry; // Append to item element
            }
        }
        itemElement.innerHTML += '}'
    } else {
        // For non-objects (just primitive values like strings, numbers), display them
        itemElement.innerHTML = `Item ${index + 1}: ${item}`;
    }
    // Append the item element to the result-box
    resultBox.appendChild(itemElement);
});

}

// Function to handle CSV file upload
async function handleFileUploadTransfer() {
const fileInput = document.getElementById('csvFileTransfer');
const file = fileInput.files[0];

if (!file) {
  alert("Please select a file for transfer.");
  return;
}

const reader = new FileReader();

reader.onload = async function(event) {
  const csvData = event.target.result;
  const parsedData = parseCSVTransfer(csvData);
  transfers = parsedData;
  //console.log(transfers);
  console.log(transfers)
  consoleParseCSV(transfers);

  try {
     // Send the transfers data to the API
     const response = await axios.post('/postTransfer/upload', { transfers: window.transfers }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Data successfully sent to API for transfer:', response.data);
  } catch (error) {
    console.error('Error sending data to API for transfer:', error);
  }

};

reader.readAsText(file);
}

 //function for Expense information
 function parseCSVExpense(csvData) {
  const rows = csvData.split('\n');  // Split the data into rows

  // Extract headers (first row) and trim any excess spaces
  const headers = rows[0].split(',').map(header => header.trim().replace(/['"]/g, ''));

  // Initialize an empty array to hold the parsed data
  const parsedData = [];

  // Loop through each row starting from index 1 (skip header row)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].trim();

    if (row) { // Skip empty rows
      const columns = row.split(',').map(col => col.trim().replace(/['"]/g, ''));

      // Map the row data to an object using headers as keys
      const rowData = {};
      headers.forEach((header, index) => {
        let value = columns[index] || ''; // Avoid undefined errors if columns are missing

        // Perform custom logic to handle specific fields
        if (header === 'Amount' && value) {
          value = parseFloat(value);  // Convert the 'Amount' field to a number
        } else if (header === 'TxnDate' && value) {
          const parsedDate = new Date(value);
          if (parsedDate instanceof Date && !isNaN(parsedDate)) {
            value = parsedDate.toISOString().split('T')[0]; // Convert 'TxnDate' to YYYY-MM-DD format
          } else {
            // Handle invalid date value
            console.error("Invalid date:", value);
            value = null; // or any fallback logic
          }
        }

        rowData[header] = value; // Assign the value to the corresponding header
      });

      // Push the formatted row data to the parsedData array
      parsedData.push(rowData);
    }
  }

  return parsedData;  // Return the final array of parsed data
}


function consoleParseCSV(expenses) {
  const resultBox = document.getElementById('result')
  resultBox.innerHTML = '';
  // Iterate over the array
  expenses.forEach((item, index) => {
    // Create a new paragraph for each item in the array
    const itemElement = document.createElement('div'); // Use div instead of p for flexibility

    // Check if the item is an object
    if (typeof item === 'object' && item !== null) {
        // Iterate over the object's key-value pairs
        itemElement.innerHTML += '{'
        for (const key in item) {
            if (item.hasOwnProperty(key)) {
                // Add each key-value pair with <br> after it
                const logEntry = `${key}: <span class="key">${item[key]}</span><br>`;
                itemElement.innerHTML += logEntry; // Append to item element
            }
        }
        itemElement.innerHTML += '}'
    } else {
        // For non-objects (just primitive values like strings, numbers), display them
        itemElement.innerHTML = `Item ${index + 1}: ${item}`;
    }
    // Append the item element to the result-box
    resultBox.appendChild(itemElement);
});

}

// Function to handle CSV file upload
async function handleFileUploadExpense() {
const fileInput = document.getElementById('csvFileExpense');
const file = fileInput.files[0];

if (!file) {
  alert("Please select a file for expense.");
  return;
}

const reader = new FileReader();

reader.onload = async function(event) {
  const csvData = event.target.result;
  const parsedData = parseCSVExpense(csvData);
  expenses = parsedData;
  //console.log(expenses);
  console.log(expenses)
  consoleParseCSV(expenses);

  try {
     // Send the expenses data to the API
     const response = await axios.post('/postExpense/upload', { expenses: window.expenses }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Data successfully sent to API for expense:', response.data);
  } catch (error) {
    console.error('Error sending data to API for expense:', error);
  }

};

reader.readAsText(file);
}
