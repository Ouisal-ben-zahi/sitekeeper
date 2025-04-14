import OneSignal from 'react-onesignal';

export default async function runOneSignal() {
  await OneSignal.init({
    appId: 'ba888a39-2e4e-4b37-bff1-e3736b585632',
    allowLocalhostAsSecureOrigin: true, 
    notifyButton: {
      enable: true, 
    },
    serviceWorkerPath: "OneSignalSDKWorker.js",
  serviceWorkerParam: { scope: "/" }
  });
  
  OneSignal.showSlidedownPrompt();
}