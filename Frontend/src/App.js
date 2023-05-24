import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios.get('/api/data')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error retrieving data: ', error);
      });
  };

  const handleInputChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const addNewItem = () => {
    axios.post('/api/data', newItem)
      .then(response => {
        fetchData(); // Refresh the data
        setNewItem({}); // Clear the input fields
      })
      .catch(error => {
        console.error('Error adding new item: ', error);
      });
  };

  const selectItem = (item) => {
    setSelectedItem(item);
  };

  const updateItem = () => {
    axios.put(`/api/data/${selectedItem.employeeID}`, selectedItem)
      .then(response => {
        fetchData(); // Refresh the data
        setSelectedItem(null); // Clear the selected item
      })
      .catch(error => {
        console.error('Error updating item: ', error);
      });
  };

  const deleteItem = (item) => {
    axios.delete(`/api/data/${item.employeeID}`)
      .then(response => {
        fetchData(); // Refresh the data
      })
      .catch(error => {
        console.error('Error deleting item: ', error);
      });
  };

  return (
    <div className="app-container">
      <div className="logo-container">
        <img src="/path/to/logo.png" alt="Logo" />
      </div>
      <div className="table-container">
        <div>
          <h2>Add New Item</h2>
          {Object.keys(data[0] || {}).map(columnName => (
            <input
              key={columnName}
              type="text"
              name={columnName}
              value={newItem[columnName] || ''}
              onChange={handleInputChange}
              placeholder={columnName}
            />
          ))}
          <button onClick={addNewItem}>Add</button>
        </div>
        <div>
          <h2>Items</h2>
          {data.map((item, index) => (
            <div key={index}>
              {Object.entries(item).map(([columnName, columnValue]) => (
                <p key={columnName}>{columnValue}</p>
              ))}
              <button onClick={() => selectItem(item)}>Edit</button>
              <button onClick={() => deleteItem(item)}>Delete</button>
            </div>
          ))}
        </div>
        {selectedItem && (
          <div>
            <h2>Edit Item</h2>
            {Object.entries(selectedItem).map(([columnName, columnValue]) => (
              <input
                key={columnName}
                type="text"
                name={columnName}
                value={columnValue}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, [columnName]: e.target.value })
                }
              />
            ))}
            <button onClick={updateItem}>Save</button>
            <button onClick={() => setSelectedItem(null)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
