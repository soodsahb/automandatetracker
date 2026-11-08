# Mandate

A responsive React Native app for tracking active autopay mandates and reaching each merchant’s cancellation flow. Built with Expo and TypeScript; the same app runs on iOS, Android, and the web.

## Run locally

Install Node.js 20 or newer, then clone the repository and install dependencies:

```sh
git clone https://github.com/soodsahb/automandatetracker.git
cd automandatetracker
npm install
```

### Web

```sh
npm run web
```

Open the local URL printed by Expo. The app is configured for port 3000.

### Android with Expo Go

1. Install **Expo Go** from Google Play. Use the current version supporting Expo SDK 54.
2. Connect your Android phone and computer to the same Wi-Fi network.
3. Start the development server:

   ```sh
   npm start
   ```

4. In Expo Go, choose **Scan QR code** and scan the QR code in the terminal. You can also run `npm run android` to start the same server with the Android prompt.

No Android SDK or development build is needed. If your network blocks device discovery, run `npx expo start --tunnel` instead and scan that QR code.

### iOS simulator

```sh
npm run ios
```

## Features

- Active mandate totals, seven-day debit summary, upcoming schedule, and category insights
- Search and category filters, including a cancelled-mandate history
- Add mandates with the amount, next debit, payment method, and merchant management URL
- Merchant app deep links on native devices with secure website fallback
- Explicit local confirmation after cancelling at the merchant
- On-device persistence with AsyncStorage; no credentials or payment data are collected

`npm run typecheck` checks the TypeScript source. `npx expo export --platform web` creates a production web build.
