import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

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
      .get('http://127.0.0.1:5000//data')
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post('http://127.0.0.1:5000//data', formData)
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
    axios
      .delete('http://127.0.0.1:5000//data', { data: rowToDelete })
      .then(() => {
        fetchData(); // Refresh the data after successful deletion
        console.log('Row deleted');
      })
      .catch((error) => {
        console.error('Error deleting row: ', error);
      });
  };

  const updateRow = (index) => {
    if (editableRowIndex === index) {
      // Save the updated values to the database
      axios
        .put('http://127.0.0.1:5000//data', data[index])
        .then(() => {
          fetchData(); // Refresh the data after successful update
          console.log('Row updated');
        })
        .catch((error) => {
          console.error('Error updating row: ', error);
        });
      setEditableRowIndex(-1);
    } else {
      setEditableRowIndex(index);
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <div className="app-container">
      <h2>Table</h2>
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
                          value={value}
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
                          onClick={() => setEditableRowIndex(-1)}
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
