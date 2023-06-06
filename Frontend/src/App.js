import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import logo from './tech.jpeg';

function App() {
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [editableRowIndex, setEditableRowIndex] = useState(-1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios
      .get('http://127.0.0.1:5000/data')
      .then((response) => {
        setData(response.data);
        setError(null);
      })
      .catch((error) => {
        console.error('Error retrieving data: ', error);
        setError('Error retrieving data. Please try again later.');
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = value !== '' ? value : ' '; // Replace empty value with space
  
    setFormData((prevData) => {
      // Clone the previous formData
      const updatedData = { ...prevData };
  
      // Add or update the field value
      updatedData[name] = updatedValue;
  
      return updatedData;
    });
  };
  
  
  
  

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post('http://127.0.0.1:5000/data', formData)
      .then(() => {
        fetchData(); // Refresh the data after successful submission
        setFormData({}); // Clear the form data
      })
      .catch((error) => {
        console.error('Error submitting form data: ', error);
      });
  };

  const deleteRow = (index) => {
    const rowToDelete = data[index];
    const idToDelete = rowToDelete._id; // Get the _id of the row
  
    axios
      .delete(`http://127.0.0.1:5000/data/${idToDelete}`)
      .then(() => {
        fetchData(); // Refresh the data after successful deletion
        console.log('Row deleted');
      })
      .catch((error) => {
        console.error('Error deleting row: ', error);
      });
  };
  
// ... existing code ...

const updateRow = (index) => {
  if (editableRowIndex === index) {
    // Prepare the updated fields for the specific row
    const updatedFields = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== data[index][key]) {
        updatedFields[key] = formData[key];
      }
    });
    if (Object.keys(updatedFields).length === 0) {
      // No fields were changed, exit update mode
      setEditableRowIndex(-1);
      setFormData({});
      return;
    }

    // Save the updated fields to the database
    const updatedRow = { _id: data[index]._id, ...updatedFields }; // Include the _id of the row being updated
    axios
      .put(`http://127.0.0.1:5000/data/${data[index]._id}`, updatedRow) // Pass the _id in the URL
      .then(() => {
        fetchData(); // Refresh the data after successful update
        console.log('Row updated');
      })
      .catch((error) => {
        console.error('Error updating row: ', error);
      });
    setEditableRowIndex(-1);
    setFormData({});
  } else {
    // Set the index of the row to be edited
    setEditableRowIndex(index);
    // Clone the data array to preserve the original data
    const clonedData = [...data];
    // Set the values of the row to be edited in the formData state
    setFormData({ ...clonedData[index] });
  }
};

// ... remaining code ...


// ... remaining code ...


  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <div className="app-container">
      <img src={logo} alt="Techolution Logo" className="logo" />
      <h2>Employees</h2>
      {data.length > 0 ? (
        <>
          <table className="data-table">
            <thead>
              <tr>
                {Object.keys(data[0]).map((columnName) => (
                  <th key={columnName}>{columnName}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {data.map((row, index) => (
  <tr key={index} className="data-row">
    {Object.values(row).map((value, colIndex) => (
      <td key={colIndex}>
        {editableRowIndex === index ? (
          <input
            type="text"
            name={Object.keys(data[0])[colIndex]}
            value={formData[Object.keys(data[0])[colIndex]] || ''}
            onChange={handleInputChange}
          />
        ) : (
          value
        )}
      </td>
    ))}
    <td className="actions-column">
      {editableRowIndex === index ? (
        <>
          <button
            className="cancel-button"
            onClick={() => {
              setEditableRowIndex(-1);
              setFormData({});
            }}
          >
            <span role="img" aria-label="Cancel">
              ❌
            </span>
          </button>
          <button
            className="update-button"
            onClick={() => updateRow(index)}
          >
            <span role="img" aria-label="Update">
              ✅
            </span>
          </button>
        </>
      ) : (
        <>
          <button
            className="edit-button"
            onClick={() => updateRow(index)}
          >
            <span role="img" aria-label="Edit">
              ✏️
            </span>
          </button>
          <button
            className="delete-button"
            onClick={() => deleteRow(index)}
          >
            <span role="img" aria-label="Delete">
              🗑️
            </span>
          </button>
        </>
      )}
    </td>
  </tr>
))}

            </tbody>
          </table>
          <button className="add-button" onClick={toggleForm}>
            Add Data
          </button>
          {showForm && (
            <div className="form-container">
              <h2>Add Data</h2>
              <form onSubmit={handleSubmit}>
                {Object.keys(data[0]).map((columnName) => (
                  <div key={columnName}>
                    <label>{columnName}</label>
                    <input
                      type="text"
                      name={columnName}
                      value={formData[columnName] || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                ))}
                <button type="submit">Submit</button>
              </form>
            </div>
          )}
        </>
      ) : (
        <p>No table found.</p>
      )}
      {error && <p>{error}</p>}
    </div>
  );
}

export default App;
