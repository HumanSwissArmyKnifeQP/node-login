#[Node-Login](https://nodejs-login.herokuapp.com)

##Installation & Setup
1. Install [Node.js](https://nodejs.org/) & [MongoDB](https://www.mongodb.org/) if you haven't already.

2. Install [Nodemon](https://github.com/remy/nodemon/) globally `npm install -g nodemon` 

3. Install dependencies `npm install`
		
4. Make sure to `mkdir /home/data` and then `chmod` it so that the current user has write privileges.

5. In a separate shell start the MongoDB daemon: `mongod`

6. `cd` into project folder and `npm start`

TODO: Create bash script for starting mongod and app as subprocess.
