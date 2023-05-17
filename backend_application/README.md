# Backend Application
This is the backend application made in flask, which can perform basic CRUD operations on the database.




## Steps to Setup this application in your local machine
##### For Mac users
Install brew
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew update
```

Install mongodb ( I'm using community edition, you can use any edition which have mongod)
```
brew install mongodb-community@6.0
```

Create Virtual Environment for python dependencies
```
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
```

## Steps to run this application in your local machine
##### For Mac users
To run MongoDB (i.e. the mongod process) as a macOS service, run:
```
brew services start mongodb-community@6.0
```

Also if you want to stop a mongod running as a macOS service, use the following command as needed:
```
brew services stop mongodb-community@6.0
```

Run flask application in debug mode
```
python3 app.py
```




## API endpoints
Get all the record : GET request
```
/read/
```

Get a single record : GET request
```
/read/<id:str>/
```

Post a record : POST request
```
/write/
```
Post data as form-data in request body



Update a record : PUT request
```
/update/<id:str>/
```
Post data as form-data in request body


Delete a record : DELETE request
```
/delete/<id:str>/
```


