# Deploy on Vercel

You can Deploy this project by click this button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/vercel/tree/main/examples/nuxtjs&template=nuxtjs)

# Setup Project

## Set Database
Go to Firebase console
https://console.firebase.google.com/u/0/

## Create Analytics Account
1. Click `Create a project`
2. Enter your project name as example `MySpending`
3. Continue till `Configure Google Analytics` and create a new account as example `MySpending` and select your country then check the terms and then create the project
4. Wait till the loading finish and you will redirect to your project dashboard

## Register Firebase
1. When you landing to your Project Dashboard, find and click icon like `</>`
2. And then fill app nickname using `MySpending` and let ~Also set up Firebase Hosting for this app.~ be uncheck then register app
3. Then when app is registred, just click `Continue to console`

## Create Authentication
This Authentication is for your login page and authenticated the user later
1. On the sidebar menu, click build and it will expand other menus then click `Authentication`
2. Click button `Get started` and on tab Sign-in method choose `Google`
3. Then click the enable toggle on top right and on `Support email for project` select your own email and then hit save
4. You can go on tab `Settings` and on `Authorised domains menu` you can add your vercel domain later

## Create Database
1. On the sidebar menu, click build and it will expand other menus then click `Firestore Database`
2. Click button `Create database` and then just next
3. Choose `Start in Production mode` and then Create
4. Wait till the loading finish and you will see your Database dashboard

## Setting and connect your project using .env file
To connect your project, you need fill the .env file with value from `clientSDK` and `serverSDK`
1. Copy env.example and rename it to .env
2. To get `clientSDK`, you can go and click Icon Gear on top left and click Project settings
3. On tab General, scroll to bottom and you will `const firebaseConfig = { }`
4. Use the value to fill your .env file (FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID)
5. And for `serverSDK`, on the same menu with clientSDK you can go to tab `Service accounts`, choose Node.js and click button `Generate new private key`
6. You will download a file, open it and use it to fill the serverSDK in .env (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL)

## Set Allowed User
1. After all of that, don't forget to fill env `ALLOWED_USER` with array of email

# Run Project on Local
1. Clone Project
2. Run `npm i`
3. Run `npm run dev`



