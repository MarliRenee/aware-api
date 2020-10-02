# Aware App API

Welcome to the server code for Aware - a cognitive behavioral processing app based on Virginia Satir's iceberg model. The iceberg model uses simple prompts to guide you to greater emotional awareness.

- View the [live app](https://aware-app.vercel.app/)

- Checkout the [client code](https://github.com/MarliRenee/aware-app/tree/styling) 

- See the [Kanban board](https://github.com/users/MarliRenee/projects/1) (along with all my day-dreams for the app).

The app was designed for phones, but will scale for desktop viewing.

You can run through a quick "iceberg" processing flow without signing-in, or register to save your progress and review it in the future. 

## Summary

Aware is a eight-step processing tool designed to help people articulate the emotions behind stressful or unusual events. Satir's iceberg model has been used by CBT therapists for decades, but now users can independentally work through the questions, save completed processing "icebergs" for later referal, and ditch cluttered homework sheets. And save trees! 

## Technology
<b>Back End</b>
- Node and Express
    - Authentication via JWT
    - RESTful Api

<b>Testing</b>
- Supertest
- Mocha and Chai

<b>Database</b>
- PostgresSQL

<b>Production</b>
- Deployed via Heroku

## Screenshots
![Home Page](https://github.com/MarliRenee/aware-app/blob/styling/src/Assets/Homepage.jpg?raw=true)
![Login Page](https://github.com/MarliRenee/aware-app/blob/styling/src/Assets/Login.PNG?raw=true)
![Iceberg Page](https://github.com/MarliRenee/aware-app/blob/styling/src/Assets/IcebergSample.PNG?raw=true)
![Iceberg Question](https://github.com/MarliRenee/aware-app/blob/styling/src/Assets/QuestionSample.jpg?raw=true)

## Set up

Complete the following steps to start a new project (NEW-PROJECT-NAME):

1. Clone this repository to your machine, cd into the directory and run `npm install`
4. Install the node dependencies `npm install`
5. Create a `.env` file in the project root
6. Edit the contents of the `package.json` to use NEW-PROJECT-NAME instead of `"name": "aware-api",`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`


## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.# aware-api